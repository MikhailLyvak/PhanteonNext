# Screener — Known Issues & Risks

Companion to `screener-contract.md`. This doc catalogues the concrete problems with the screener's current data layer and explains why each one matters. Order is by **operational severity** (impact on real users / cost to fix), not alphabetical.

Scope: data flow only — UI/UX issues, layout bugs, and unrelated cabinet features are out of scope.

References:
- Direct-Binance modules: `src/api/Screener/getBinanceFuturesPairs.ts`, `getBinanceKlines.ts`, `getBinanceIndicators.ts`
- Mocks: `src/lib/screener/mock/{dashboard,chart,feeds,pairs}.ts`
- Consumers: `src/app/components/Screener/{AssetsTable,MasterChart,LivePrice,LiquidationsFeed,TradesFeed}.tsx`

---

## 1. Binance rate limit exhaustion (HIGH)

**What's happening.** The browser hits `fapi.binance.com` directly on a tight cadence:

| Caller | Endpoint | Interval | Weight* |
| --- | --- | --- | --- |
| `AssetsTable` (dashboard) | `/fapi/v1/ticker/24hr` (no symbol) | 1 s | 40 |
| `LivePrice` (terminal header) | `/fapi/v1/ticker/24hr?symbol=…` | 1 s | 1 |
| `MasterChart` (live tail) | `/fapi/v1/klines` | 1 s | 5 |
| `MasterChart` (current OI) | `/fapi/v1/openInterest` + `/ticker/price` | 5 s | 1 + 1 |
| Initial chart load | `/klines` × ~4 batches + 3 indicator endpoints | once per terminal open | ~30 burst |

\* approximate Binance "weight" units. Per-IP limit is **2 400 / minute** across all `fapi` calls.

**Math for one user:**
- Dashboard alone: `40 weight × 60 s = 2 400 / min` — **at the limit with zero terminals open**.
- Open one terminal: +60 (klines live) + 12 (OI) + initial burst → over budget.

**Math for many users behind one NAT** (corporate proxy, mobile carrier, our own ingress): every additional concurrent user multiplies the load on the shared IP. A small office or a popular mobile ISP will get the whole population banned (HTTP 418 "I'm a teapot" / 429), typically for 2–10 minutes.

**Symptom users will see.** Dashboard suddenly empties for everyone in the same network segment; chart freezes; no error message (see issue §5).

**Fix path.** Move to backend (`/api/screener/dashboard`, `/ws/all`, `/ws/chart/{pair}`) — one outbound IP, one consolidated rate budget, server-side caching. This is the single highest-leverage fix.

---

## 2. CORS / geo / availability dependency on Binance (HIGH)

**What's happening.** The frontend is a Binance client. Every page load issues cross-origin requests to `fapi.binance.com`. Three things can break this at any moment, and we have no fallback:

1. **CORS policy tightening.** Binance currently sends permissive `Access-Control-Allow-Origin`. If they ever restrict origins, every screener fetch fails browser-side with no useful error.
2. **Geo-blocking.** Binance blocks several jurisdictions (US, UK partially, Ontario, etc.) at the *edge*. Users in those regions either get 451 or DNS-level refusal. The screener simply doesn't load for them.
3. **Endpoint deprecation.** `fapi.binance.com/futures/data/*` endpoints have been quietly changed before. A breaking change ships with no migration window for us because we have no abstraction layer.

**Symptom.** Region-specific outages we can't diagnose from logs (we don't have any — see §5), no way to switch venues.

**Fix path.** Backend proxies all exchange traffic. Adds the abstraction layer needed to add other venues (Bybit, OKX) later.

---

## 3. No WebSockets — everything is polled (HIGH)

**What's happening.** Every "live" value uses `setInterval`:

| Component | Mechanism | Interval |
| --- | --- | --- |
| `AssetsTable` | `setInterval(fetch /ticker/24hr, 1000)` | 1 s |
| `LivePrice` | `setInterval(fetch /ticker/24hr?symbol=…, 1000)` | 1 s |
| `MasterChart` candles | `setInterval(fetch /klines, 1000)` | 1 s |
| `MasterChart` OI | `setInterval(fetch /openInterest + /ticker/price, 5000)` | 5 s |
| Mock feeds | `setInterval(emit fake event, 1500–4000ms)` | random |

**Why polling is wrong here:**
- **Latency.** Mid-poll-interval price changes show up to 1 s late. For a trading-adjacent UI that's noticeable.
- **Bandwidth.** A persistent WS frame is bytes; a fresh HTTP request is hundreds of bytes of headers + JSON for the same payload.
- **Tab throttling.** Browsers throttle `setInterval` in background tabs to 1 / minute or worse. After switching tabs, the chart silently desyncs until the user returns.
- **No backpressure.** If the network slows, polls pile up — multiple in-flight requests for the same data, then a burst when the connection recovers.

**Symptom.** Janky updates, occasional desync after tab switch, no way to express "send me the latest now."

**Fix path.** `/ws/all` and `/ws/chart/{pair}` per the contract. Both are already speccd.

---

## 4. Half-frozen dashboard ("live" mixed with seeded mocks) (MEDIUM)

**What's happening.** `AssetsTable` polls `getDashboardSnapshot()` every second. Inside, that function:
1. Fetches real Binance `/ticker/24hr` → updates `lastPrice`, `openPrice`, `quoteVolume`.
2. For every other column (OI, CVD, liquidations, funding), generates a **deterministic** value from `mulberry32(hashString(pair.code))`.

The PRNG is seeded by the pair code, so the OI / CVD / liq values are **identical across every poll** and **identical on every page load**. They appear to live in a refreshing table but they never move.

**Symptom.** A user comparing the dashboard against TradingView will see OI sit at the same number for hours. The "Liq 1h" column on BTCUSDT is currently a constant. This is worse than no data because it looks credible.

**Aggravating factor:** the misleading "liquidations" pane on the chart (§9) is in fact the *taker buy/sell ratio*, not real liquidations. So the dashboard says "Liq = $X (constant)" while the chart pane says "Liq = $Y (changing, but not liquidations)" — two different fictions on the same screen.

**Fix path.** `/api/screener/dashboard` + `/ws/all`. Delete `mock/dashboard.ts` once shipped.

---

## 5. Silent fetch failures everywhere (MEDIUM)

**What's happening.** Every `fetch` in the screener is wrapped in `try { … } catch {}` with no surfacing:

```ts
// AssetsTable.tsx ~:83
try { setRows(await getDashboardSnapshot(pairs)) }
catch { /* swallowed */ }
```

The same pattern repeats in `MasterChart` polls, `LivePrice`, indicator loaders, the `loadOlderCandles` backfill, and the mock feeds.

**Consequences:**
- A transient 429 (§1) silently renders an empty table on the next tick.
- A breaking change in a Binance response shape (§2) silently corrupts mapped data.
- No retry, no exponential backoff, no toast, no Sentry breadcrumb — we have no visibility into how often any of this fails in production.
- The user's only signal is "the data stopped moving," which they can't distinguish from "the market is quiet."

**Fix path.** Even before the backend lands: surface errors to a small in-page banner, add a retry-with-backoff helper around the polls, send failures to the existing error reporter.

---

## 6. No auth boundary on screener data (MEDIUM, blocks future features)

**What's happening.** Everything in the screener is unauthenticated — it has to be, because Binance public endpoints don't take credentials, and there's no backend in the loop.

**Why it matters now:**
- We can't add per-user features (favorites, alerts, saved layouts, watchlists, bot orders bound to the open pair) without first establishing an authenticated data path.
- The `local_access_token` cookie used elsewhere in the cabinet (see `MEMORY.md` → Algonix login) is in scope for the page but not used by any screener call.

**Fix path.** Decide auth model (cookie / bearer / WS subprotocol) before BE work begins. Tracked in `screener-contract.md` Open Questions.

---

## 7. Initial-load burst is heavy and uncached (MEDIUM)

**What's happening.** Opening a terminal triggers a flurry of parallel calls:
- `/klines` paginated up to 5 000 bars (4 sequential batches of 1 500)
- `/openInterestHist` paginated to align with candle history
- `/takerlongshortRatio` paginated to align
- `/fundingRate` once
- `/ticker/price` for USD conversion of taker ratios
- `/openInterest` for the current OI head

That's ~10 requests, several KB of JSON each, executed every single time a terminal is opened — no caching beyond the in-process `pairsCache` for `/exchangeInfo`.

**Symptom.**
- First chart paint takes 1–3 s on a typical connection.
- Hitting the same terminal twice in a session re-downloads everything.
- Contributes meaningfully to §1 (rate budget burn).

**Fix path.** `/ws/chart/{pair}` init message bundles all of these in one server-side query. Backend can also cache initial payloads per pair/timeframe across users.

---

## 8. Backward pagination uses real-IP klines (MEDIUM)

**What's happening.** When the user scrolls backward on the chart, `MasterChart.loadOlderCandles()` walks `/klines` backward with `endTime = oldestTime - 1`, fetching 1 500 bars at a time. A user scrolling far back can issue many of these in seconds, multiplying §1.

**Symptom.** "Load older" is the fastest way for one user to ban the whole NAT.

**Fix path.** `/api/screener/chart/{pair}/history` — server-side store, no per-user IP cost. Already in the contract.

---

## 9. "Liquidations" pane is actually taker long/short ratio (MEDIUM, data-correctness)

**What's happening.** `getBinanceIndicators.ts` calls `/futures/data/takerlongshortRatio` and renders the result as buy/sell volume in the **Liquidations** pane on the chart. Real Binance liquidations live on a different stream (`!forceOrder@arr` WS), which we don't consume.

The labels say "Liquidations" but the values mean "USD-converted taker buy/sell volume from aggressive market orders." Those are different concepts — a user who acts on the pane is acting on the wrong signal.

**Fix path.** Backend must source from a real liquidation feed (Binance `!forceOrder` or equivalent on the chosen venue) and supply `LiquidationBar` / `LiquidationEvent` per the contract. **Do not carry the taker-ratio stand-in into the backend.**

---

## 10. Footprints are entirely mocked (MEDIUM, data-correctness)

**What's happening.** Chart footprints (volume by price level inside each candle) come from `mock/chart.ts` — pure RNG seeded by `${pairCode}|${tf}`. There's no exchange call behind them.

The same applies to CVD when not derived from real `takerBuyVolume`.

**Symptom.** A trader reading footprints to assess delta or absorption is reading noise. Worse than the "Liquidations" mislabel (§9) because there's no real data underneath at all.

**Fix path.** Backend must compute footprints from trade-by-trade data and ship them in the `ChartInitPayload` / `tick` messages (§II.5). Until then, the heatmap should ideally be hidden, not shown filled with fake data.

---

## 11. Liquidations and trades feeds are simulators (MEDIUM, data-correctness)

**What's happening.** `mock/feeds.ts` `subscribeLiquidations` and `subscribeTrades` are both `setInterval` loops emitting random events every 1.5–4 s with PRNG-generated prices and sizes. The seed list of 50 events is also fabricated. Nothing in either feed has ever happened on a real exchange.

**Fix path.** `/ws/liquidations-stream/{pair}` and `/ws/trades-stream/{pair}` per the contract. Same caveat as §9: don't reuse the taker-ratio numbers.

---

## 12. No reconnection / heartbeat strategy decided (LOW today, MEDIUM at WS launch)

**What's happening.** There's no WS code in the screener yet, so this isn't biting today. But the contract specifies four WS endpoints and the lifecycle is still TBD:
- No heartbeat decided (server-ping vs client-ping, interval).
- No reconnect policy decided (FE plans exponential backoff 1 s → 30 s, server-side replay strategy TBD).
- No close-code taxonomy.

**Why it matters.** If we ship the contract without nailing these down, the first mobile user on flaky LTE finds out for us — the page silently stops updating on every network blip, exactly the failure mode we have today with polling (§5).

**Fix path.** Resolve in `screener-contract.md` §II.9 Open Questions before BE implementation starts.

---

## 13. Stale module-level caches (LOW)

**What's happening.** `getBinanceFuturesPairs.ts` caches the pair list at module scope for the full session. New listings on Binance won't appear until reload. `getDashboardSnapshot` rebuilds from scratch every poll. `mock/chart.ts` caches per `${pair}|${tf}` forever.

**Symptom.** Mostly cosmetic today. Becomes a problem when we add favorites or new pairs go live mid-session.

**Fix path.** Either time-bound the cache (`Cache-Control: max-age=…` from the backend) or add a manual refresh control.

---

## 14. Dead code in `mock/chart.ts` (LOW, hygiene)

**What's happening.** `getChartInit()` is exported and listed in the mock module's `index.ts`, but **no consumer imports it**. `MasterChart` uses `getChartInitFromBinance` instead. The mock is misleading dead weight — anyone reading the code might assume the chart is mocked when in fact it's live Binance data.

**Fix path.** Delete `getChartInit` + its export when migrating to `/ws/chart/{pair}`.

---

## 15. Env vars declared but unused (LOW, hygiene)

**What's happening.** `screener-contract.md` §II.0 declares `NEXT_PUBLIC_SCREENER_API_BASE_URL` and `NEXT_PUBLIC_SCREENER_WS_BASE_URL`. Neither is read anywhere in the codebase.

**Symptom.** A developer setting them expecting things to switch over will find nothing changes. Cosmetic until the backend lands, but should be wired up the moment the first endpoint ships so config drift doesn't compound.

---

## Severity summary

| Severity | Issues |
| --- | --- |
| **HIGH** (production-risk, fix before scaling users) | §1 rate-limit ban, §2 Binance dependency, §3 polling instead of WS |
| **MEDIUM** (degrades experience or correctness) | §4 frozen mock columns, §5 silent errors, §6 no auth, §7 init burst, §8 backward-pagination cost, §9 fake liquidations, §10 fake footprints, §11 simulated feeds |
| **LOW** (hygiene / future work) | §12 WS lifecycle TBD, §13 stale caches, §14 dead code, §15 unused env vars |

## Recommended fix order

1. **§5 silent errors** — single-PR fix, immediate visibility win, *required* to diagnose everything else.
2. **§4 + §1 + §2 together** — ship `GET /api/screener/pairs` + `GET /api/screener/dashboard`, point `AssetsTable` and `LivePrice` at them. This kills the per-IP rate-limit risk on the most-used screen and unfreezes the mocked columns.
3. **§3 + §7 + §8** — ship `WS /ws/chart/{pair}` and `GET /api/screener/chart/{pair}/history`, switch `MasterChart`. Eliminates terminal polling and the load-older IP cost.
4. **§9 + §10 + §11** — ship liquidation/trade WS feeds with **real** data. Delete the taker-ratio mislabel and the mock feeds in the same PR so the bad data path can't be revived.
5. **§6 auth** — must be decided before any of §2–§4 are shipped, but enforced gradually.
6. **§12 WS lifecycle** — finalize before the first WS endpoint goes live.
7. **§13–§15** — cleanup once the backend migration is complete.
