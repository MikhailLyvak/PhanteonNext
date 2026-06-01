# Screener — Frontend ↔ Backend Integration Plan

How to cut the PhanteonNext screener over from direct-Binance + mocks to the new `screener-service`.

Companions:
- [`screener-contract.md`](./screener-contract.md) — wire formats (source of truth).
- [`screener-known-issues.md`](./screener-known-issues.md) — what each step fixes.
- [`screener-lightweight-limits.md`](./screener-lightweight-limits.md) — operational ceiling.
- `../../screener-service/README.md` — backend design.

---

## 0. Goal and constraints

**Goal.** Replace every direct call to `fapi.binance.com` / `stream.binance.com` from the browser, and every read of `src/lib/screener/mock/*`, with a same-origin call to `/api/screener/*` proxied to `screener-service`.

**Constraints we are NOT relaxing:**
- Frontend code MUST NOT learn about port `4000` or about a separate hostname for the backend. Same-origin only. The Next.js rewrite hides the backend.
- Each step is independently shippable. We do not cut everything over in one PR.
- Types on the FE side must match `screener-contract.md`. When a step touches a payload the contract describes, the FE type for that payload comes from the contract — not from a free-hand TS interface.
- We DROP the right-side `LiquidationsFeed` (decided previously — liquidations already appear on the chart pane and in the dashboard table column; a third copy as a side feed is redundant and is not in the ТЗ). Step 6 removes both the UI component and the backend endpoints that fed it.

**Out of scope for this plan:**
- L2 order book widget, on-chain flow widget (both in ТЗ but require new backend pipelines, deferred).
- Auth on screener endpoints (`ScreenerAccessGate` stays a frontend gate; backend is read-only public).
- Production deploy of `screener-service` itself — covered in `../../screener-service/README.md` §12.

---

## 1. Wire the Next.js rewrite (foundation, ~½ day)

**Why first.** Establishes the URL contract. Every later step writes against `/api/screener/...`; without the rewrite, those paths 404 in dev.

**Change.** `next.config.ts`:

```ts
async rewrites() {
  const target = process.env.SCREENER_SERVICE_URL ?? 'http://localhost:4000'
  return [
    { source: '/tron-proxy/:path*', destination: 'https://tron.algonix.org/:path*' },
    { source: '/api/screener/:path*', destination: `${target}/:path*` },
  ]
}
```

**SSE through Next.js rewrites.** Next 15 proxies SSE correctly out of the box — no buffering, no chunked-encoding stripping. Verified by hitting `/api/screener/health` and `/api/screener/stream/dashboard` from the browser DevTools network tab and watching events stream live.

**Env wiring.**
- `.env.local` (dev): `SCREENER_SERVICE_URL=http://localhost:4000` (or omit — that's the default).
- `.env.production` / AWS env: `SCREENER_SERVICE_URL=https://<deployed-service-url>`. **Production deploy of the FE blocks on the backend being reachable at that URL** — add a deploy-time smoke check that hits `/api/screener/health` and 503s the deploy if upstream is degraded.

**Acceptance.**
- `curl http://localhost:3000/api/screener/health` → 200 with the body from `screener-service`.
- `curl -N http://localhost:3000/api/screener/stream/dashboard` streams `dashboard_update` SSE events with no buffering delay.

---

## 2. Add a thin typed client layer (~½ day)

**Why.** We do not want 7 components hand-rolling `fetch('/api/screener/...')` and parsing JSON. One module owns the URL strings and the response types. No state, no caching layer, no React Query wrapper at this stage — those land if/when components actually need shared state.

**New files** (only two — keep it small):

```
src/api/screener/
├── client.ts          # REST helpers: getDashboard, getPairs, getChartHistory, getLiquidationsHistory
└── streams.ts         # SSE helpers: openDashboardStream, openChartStream, openTradesStream
```

**Shape.**

```ts
// src/api/screener/client.ts
import type { DashboardSnapshot, Pair, ChartHistory } from '@/lib/screener/types'

const BASE = '/api/screener'

export async function getDashboard(): Promise<DashboardSnapshot> {
  const r = await fetch(`${BASE}/dashboard`, { cache: 'no-store' })
  if (!r.ok) throw new ScreenerHttpError(r.status, await r.text())
  return r.json()
}
// … same pattern for getPairs, getChartHistory.
```

```ts
// src/api/screener/streams.ts
type SseHandlers<T> = {
  onEvent: (event: string, data: T) => void
  onError?: (e: Event) => void
}

export function openDashboardStream(h: SseHandlers<DashboardUpdate>): () => void {
  const es = new EventSource('/api/screener/stream/dashboard')
  es.addEventListener('dashboard_update', (ev) =>
    h.onEvent('dashboard_update', JSON.parse((ev as MessageEvent).data))
  )
  es.onerror = h.onError ?? (() => {}) // EventSource auto-reconnects; only log.
  return () => es.close()
}
// … openChartStream, openTradesStream.
```

**Types come from `screener-contract.md`.** Update `src/lib/screener/types.ts` with the payload types from Part II of the contract. One PR — no mid-migration `// TODO match contract`. If a contract type does not exist yet, write it now and propose the change in the contract PR.

**Acceptance.**
- `typecheck` passes — no `any` in client.ts / streams.ts.
- A throwaway unit test (or one component that imports it) compiles.

---

## 3. Cut over pairs list (~½ day)

**Why first among consumers.** Smallest blast radius (one list, no streaming, no UI semantics change), validates the client layer end-to-end.

**Current state.** `src/api/Screener/getBinanceFuturesPairs.ts` hits `https://fapi.binance.com/fapi/v1/exchangeInfo` from the browser.

**Change.**
- Replace contents of `getBinanceFuturesPairs.ts` with a one-liner that calls `getPairs()` from `src/api/screener/client.ts`, OR delete the file and have callers import `getPairs` directly. Prefer deletion — fewer files.
- Find all callers (`grep -rn getBinanceFuturesPairs src/`), swap them.
- Icons: the backend already includes `iconUrl` (Step 10 in `screener-service`). Drop any frontend-side icon-map import.

**Mocks to delete in this step:** `src/lib/screener/mock/pairs.ts` (and the icon-map call sites in components if they pulled from it).

**Acceptance.**
- Dashboard page lists pairs. Icons render. No `fapi.binance.com` request in the network tab.

---

## 4. Cut over dashboard (table + live patches) (~1 day)

**Why next.** Highest-traffic surface (per `screener-known-issues.md` §1 the 1 s direct-Binance poll is the worst rate-limit risk). Removing it is the single biggest user-visible reliability win.

**Current state.**
- `src/store/Screener/useScreenerStore.ts` — polls Binance directly via `getBinanceIndicators.ts`.
- `src/lib/screener/mock/dashboard.ts` fills frozen columns (liquidations, OI, funding, CVD).

**Change — two-phase inside this step (do both in one PR):**

1. **Replace the poll** in `useScreenerStore.ts`:
   - On mount: `getDashboard()` once for initial paint.
   - Then `openDashboardStream({ onEvent: applyPatch })` for incremental updates.
   - Remove the `setInterval(fetch, 1000)` loop entirely.

2. **Stop reading from `src/lib/screener/mock/dashboard.ts`.** Every column that was frozen-mocked (liq 1h/4h/24h, OI 1h/4h/24h, funding, CVD) now comes from `/dashboard` and `/stream/dashboard` directly — backend already computes them per `screener-service/README.md` §6.4.

**Files touched.**
- `src/store/Screener/useScreenerStore.ts` (replace poll loop).
- `src/api/Screener/getBinanceIndicators.ts` — delete.
- `src/lib/screener/mock/dashboard.ts` — delete.
- `src/app/components/Screener/AssetsTable.tsx`, `TableRow.tsx` — verify columns render from real store state.

**Acceptance.**
- DevTools network: zero requests to `fapi.binance.com` from `/myCabinet/screener`.
- One open EventSource to `/api/screener/stream/dashboard`, receiving events.
- Reload page → table re-paints in <300 ms from `/dashboard`, then deltas flow.
- Backend stopped → table shows a "stale" indicator (degraded health, see §9 below). It does not crash.

---

## 5. Cut over chart (init + ticks + history) (~1 day)

**Current state.**
- `src/api/Screener/getBinanceKlines.ts` paginates `fapi.binance.com/fapi/v1/klines` from the browser.
- `MasterChart.tsx` (+ `HeatmapPlugin.ts`, `LiquidationsChart.tsx`, `OIChart.tsx`) consume mocked footprint / liq-bars / OI-bars from `src/lib/screener/mock/chart.ts`.
- `LivePrice.tsx` polls or holds last ticker price (verify).

**Change.**

1. **Init + live ticks:** open `openChartStream(pair, tf, { onEvent })`. The init frame seeds candles + footprint + CVD + liquidation bars + OI bars in one payload (`screener-contract.md` §II.5). Subsequent `tick` events update the current candle / bin counts; `bar_close` finalises the candle.

2. **History (scroll-back):** when the user scrolls left past the loaded window, call `getChartHistory(pair, { before, tf, limit })`. Prepend to the in-memory candle array.

3. **Drop direct Binance klines.** Delete `src/api/Screener/getBinanceKlines.ts`.

4. **Replace chart mocks.** Delete `src/lib/screener/mock/chart.ts`. Components read everything from the chart stream.

**Files touched.**
- `MasterChart.tsx`, `HeatmapPlugin.ts`, `LiquidationsChart.tsx`, `OIChart.tsx`, `LivePrice.tsx`.
- `src/store/Screener/useTerminalStore.ts` — owns the chart subscription lifecycle.
- `chartUtils.ts` — adapt parsers if shape differs from current.

**Acceptance.**
- `/myCabinet/screener/terminal/BTCUSDT` opens, paints candles in <500 ms.
- Switching timeframe (`TimeframeToggle.tsx`) closes the old stream, opens a new one.
- Scrolling left fetches and prepends history without flicker.
- Liquidation-bar pane under price, OI sub-pane, footprint heatmap all show real data.
- No request to `fapi.binance.com` from terminal page.

---

## 6. Cut over trades feed; remove liquidations feed (~½ day)

**Decision recap.** The right-side `FeedTabs` currently toggles between `Ліквідації` and `Великі угоди`. Per discussion, we KEEP the trades tape (it is the ТЗ "Кассета / time & sales") and DROP the liquidations feed (liquidations already appear in two other places on the page — chart pane bars and dashboard table column — and a side feed of them is not in the ТЗ).

**Frontend changes.**
- `src/app/components/Screener/FeedTabs.tsx` — delete or simplify to a non-tabbed `TradesFeed` panel (we may rename it to `OrderFlowTape.tsx` later when stacking with order book + on-chain).
- `src/app/components/Screener/LiquidationsFeed.tsx` — delete.
- `src/app/myCabinet/screener/terminal/[assetId]/page.tsx` — replace `<FeedTabs />` with the trades panel directly.
- `TradesFeed.tsx` — wire to `openTradesStream(pair, { onEvent })`. Seed: backend sends a `seed` event with the last N detected large trades on subscribe; subsequent `event` messages append in real time.

**Mocks to delete.** `src/lib/screener/mock/feeds.ts`.

**Backend changes (apply to `screener-service` in the same PR or one before).**
- Remove SSE route `/stream/liquidations/:pair` (`src/routes/stream.ts:99-163`).
- Remove REST route `/liquidations/:pair` (`src/routes/liquidations.ts`).
- Remove the `liquidations` broker channel publisher in `src/app.ts:164-166`.
- Delete tests: `test/stream-liquidations.test.ts`, `test/rest-liquidations.test.ts`.
- KEEP: `state/liquidations.ts` ring buffer, SQLite persistence, `state/liquidations-bars.ts` — these still feed the chart-pane bars via `/stream/chart` (see §II.5 of the contract).

**Contract update.** `screener-contract.md` §II.7 — remove the whole subsection. §II.10 source map — remove the `/stream/liquidations` and `/liquidations` rows. §II.1 endpoints table — same.

**Acceptance.**
- Terminal page right column shows a single `Великі угоди` tape, not a tab switcher.
- Trades arrive live as large trades land on Binance.
- `screener-service` exposes no `/stream/liquidations` route (`curl ... | grep 404`).
- Liquidation bars on the chart pane still render — they come from `/stream/chart`.

---

## 7. Live price + funding indicator (~¼ day)

**Why standalone.** `LivePrice.tsx` is small but its data source overlaps with both dashboard and chart streams. Easy to leave hanging.

**Decision.**
- Live mark price for the terminal header comes from the chart stream's tick payload (already includes `lastPrice` per `screener-contract.md` §II.5). No separate stream.
- Funding rate column — already covered by the dashboard stream in §4.

**Change.** Drop any custom polling in `LivePrice.tsx`, read from the chart store.

**Acceptance.**
- One EventSource per terminal page (the chart one), not two.

---

## 8. Delete mocks and direct-Binance clients (~¼ day)

**Cleanup commit.** After §3–§7 ship and bake for a day:

```
rm src/lib/screener/mock/{chart,dashboard,feeds,pairs,rng}.ts
rm src/api/Screener/getBinance{FuturesPairs,Indicators,Klines}.ts
```

(`src/lib/screener/mock/rng.ts` only existed to seed the deterministic mocks — goes with them.)

`src/lib/screener/types.ts` and `src/lib/screener/format.ts` STAY — they hold the shared contract types and number formatters.

**Acceptance.**
- `grep -rn fapi.binance.com src/` returns nothing.
- `grep -rn /lib/screener/mock src/` returns nothing.
- App builds, all screener routes still work.

---

## 9. Health and error UX (~½ day)

**Why explicit.** Without this, the user sees blank columns when `screener-service` is degraded and has no way to know why.

**Add a thin health indicator.**
- `src/api/screener/client.ts`: `getHealth()` hits `/api/screener/health`.
- In `useScreenerStore.ts`, poll `/health` every 30 s (cheap — same-origin, JSON). When status is `degraded` or fetch fails twice in a row, set a store flag.
- Surface as a small badge in the dashboard header: "Live" (green) / "Stale (X s)" (amber) / "Disconnected" (red).
- Chart and trades streams: on `EventSource.onerror`, EventSource auto-reconnects. Do NOT show transient errors. Only surface after >15 s without an event.

**Files touched.** `useScreenerStore.ts`, one new presentational component for the badge.

**Acceptance.**
- Stop `screener-service` locally → badge flips to red within ~30 s. UI does not crash.
- Restart → badge returns to green within ~2 s of next stream event.

---

## 10. Production deploy gating

**Before flipping `SCREENER_SERVICE_URL` to the production backend URL:**

1. Backend is deployed (per `screener-service/README.md` §12) and `https://<service-url>/health` returns 200 with all `upstream.last_msg_ms_ago < 10_000`.
2. SSE works through whatever proxy fronts the service. **Specifically:** the proxy must NOT buffer responses (test by `curl -N` and watching events arrive incrementally). If the proxy is Cloudflare, ensure no transformation rules buffer text/event-stream. If it's an ALB, idle timeout must be ≥ heartbeat interval (15 s in our config — set ALB idle to ≥60 s for headroom).
3. The Next.js deploy on AWS has `SCREENER_SERVICE_URL` set in env, and a healthcheck step that calls `/api/screener/health` and fails the deploy on non-200.

**Rollback plan.** Keep the rewrite, but flip `SCREENER_SERVICE_URL` to a known-good previous backend deploy URL. The FE itself does not need to be rolled back — same image works against any backend instance.

---

## 11. Execution order summary

Sequenced so each PR is shippable and de-risks the next:

| # | Scope | Approx | Removes mocks | Removes direct-Binance |
|---|---|---|---|---|
| 1 | Next.js rewrite + health smoke | ½ day | — | — |
| 2 | Client + SSE helper modules | ½ day | — | — |
| 3 | Pairs list cutover | ½ day | `mock/pairs.ts` | `getBinanceFuturesPairs.ts` |
| 4 | Dashboard cutover (REST + SSE) | 1 day | `mock/dashboard.ts` | `getBinanceIndicators.ts` |
| 5 | Chart cutover (init + ticks + history) | 1 day | `mock/chart.ts` | `getBinanceKlines.ts` |
| 6 | Trades feed cutover + remove liquidations feed (FE + backend) | ½ day | `mock/feeds.ts` | — |
| 7 | LivePrice consolidation | ¼ day | — | — |
| 8 | Final mock + direct-Binance cleanup commit | ¼ day | residual | residual |
| 9 | Health + error UX | ½ day | — | — |
| 10 | Production deploy gating | — | — | — |

**Total: ~5 working days FE-side**, assuming `screener-service` is reachable in dev for the duration.

Each step is gated by the acceptance criteria in its section — do not start step N+1 until step N's acceptance criteria pass.

---

## 12. What this plan deliberately does NOT do

- **No React Query / SWR adoption.** Current stores work. Adding a fetching library is a separate decision.
- **No backend re-architecture.** The plan integrates against the contract as it stands today.
- **No new UI features.** Order book, on-chain flow, alert toggles are out — they are net-new product work, not integration.
- **No type-generation pipeline.** Hand-maintained types in `src/lib/screener/types.ts`, kept in sync with the contract by code review. We add codegen only if type drift becomes a recurring bug source.
- **No retry/backoff on REST calls.** One try, surface the error. EventSource already retries SSE. Adding a retry layer before we have data on real failure modes is premature.
