# Screener Data Contract — Exchange & Backend

Audience: BE engineer (or Claude Code) replacing the screener's current data sources with a backend.
Source of truth for FE types: `src/lib/screener/types.ts`.

This document has two parts:
- **Part I — Current reality**: what the FE does *today*. Direct calls to Binance + deterministic mocks. No backend involved.
- **Part II — Target backend contract**: the endpoints the backend must expose so the FE can stop talking to Binance and stop using mocks.

Every mock file under `src/lib/screener/mock/` has a `TODO(real-data)` comment pointing at the target endpoint that will replace it.

---

# Part I — Current reality (FE ↔ Binance + mocks)

The FE currently talks to **Binance public futures API directly from the browser** and fills the rest with deterministic mocks. There is **no backend involvement** in the screener today. The "REST" base / "WS" base env vars below are referenced by this doc but **not read by any code yet**.

## I.1 Direct Binance calls

All calls are unauthenticated `GET` requests to `https://fapi.binance.com`.

| # | Endpoint | Used for | FE file | Polling |
| --- | --- | --- | --- | --- |
| 1 | `/fapi/v1/exchangeInfo` | Pair list (perp USDT only) | `src/api/Screener/getBinanceFuturesPairs.ts` | once + module cache |
| 2 | `/fapi/v1/ticker/24hr` (no symbol) | Dashboard last price / 24h % / 24h volume | `src/lib/screener/mock/dashboard.ts` via `AssetsTable.tsx:73` | **1 s** |
| 3 | `/fapi/v1/ticker/24hr?symbol={code}` | Live header price on terminal | `src/app/components/Screener/LivePrice.tsx:23` | **1 s** |
| 4 | `/fapi/v1/klines` | Candles (init + live tail + load-older) | `src/api/Screener/getBinanceKlines.ts` | initial 5 000-bar batch, then **1 s** live, plus on-scroll backfill |
| 5 | `/fapi/v1/openInterest` + `/fapi/v1/ticker/price` | Current OI (notional USD) | `src/app/components/Screener/MasterChart.tsx:370` | **5 s** |
| 6 | `/futures/data/openInterestHist` | OI history series | `src/api/Screener/getBinanceIndicators.ts` | initial batch only |
| 7 | `/futures/data/takerlongshortRatio` + `/ticker/price` | "Liquidations" pane (buy/sell vol via taker ratio × price) | `src/api/Screener/getBinanceIndicators.ts` | initial batch only |
| 8 | `/fapi/v1/fundingRate` | Funding history pane | `src/api/Screener/getBinanceIndicators.ts` | initial batch only |

### I.1.1 Exchange info → pairs

```ts
GET https://fapi.binance.com/fapi/v1/exchangeInfo
```
The FE filters `symbols[]` where `contractType === 'PERPETUAL' && status === 'TRADING' && quoteAsset === 'USDT'`, then maps each to `AssetPair`:
- `code` ← `symbol`, `coin` ← `baseAsset`, `type` ← `'USDT'`
- `tick` ← `PRICE_FILTER.tickSize`, `precision` ← decimal places of `tick`
- `iconUrl` ← `''` (Binance does not provide one — see §II.1 for backend requirement)

Cached at module scope; not refreshed during a session.

### I.1.2 Klines

```ts
GET https://fapi.binance.com/fapi/v1/klines
  ?symbol={code}
  &interval={1m|5m|15m|30m|1h|2h|4h|8h|12h|1d|1w|1M}
  &limit={≤1500}
  [&startTime=<ms>] [&endTime=<ms>]
```
- Initial load (`getInitialKlinesFromBinance`) fetches up to **5 000** candles in 1 500-bar batches across a 30-day window (`INIT_WINDOW_MS`). Result mapped to `Candle[]` (`time` in **seconds**, not millis).
- Live tail: `MasterChart` re-fetches the last small batch every 1 s and merges in place (`MasterChart.tsx:442`).
- Older bars: on chart scroll, `loadOlderCandles()` paginates backward by `endTime = oldestTime - 1` (`MasterChart.tsx:172`).

### I.1.3 OI history → `OIPoint[]`

```ts
GET https://fapi.binance.com/futures/data/openInterestHist
  ?symbol={code}
  &period={5m|15m|30m|1h|2h|4h|6h|12h|1d}
  &limit={≤500} [&startTime] [&endTime]
```
Period is derived from chart timeframe (`1m`/`5m` → `5m`; `1M`/`1w` → `1d`, etc. — see `timeframeToIndicatorPeriod` in `getBinanceIndicators.ts:5`).
Mapped to `{ time, value: sumOpenInterestValue }`. Paginated backward to align with candle history.

### I.1.4 Taker ratio → `LiquidationBar[]`  *(NOT real liquidations)*

```ts
GET https://fapi.binance.com/futures/data/takerlongshortRatio
  ?symbol={code} &period={…} &limit={…} [&startTime] [&endTime]
GET https://fapi.binance.com/fapi/v1/ticker/price?symbol={code}   // for USD conversion
```
The FE treats `buyVol = buySellRatio_buy_volume × price` and `sellVol = sell_volume × price` and renders them in the **Liquidations** pane. **This is a stand-in — Binance's public liquidation stream is not consumed**. The backend (§II.6) is expected to provide real liquidations.

### I.1.5 Funding → `FundingBar[]`
```ts
GET https://fapi.binance.com/fapi/v1/fundingRate?symbol={code}&limit={…} [&startTime] [&endTime]
```
`fundingRate` is treated as a fraction (e.g. `0.0001` = `0.01 %`). No live updates; pulled once per chart load.

## I.2 Mocks still in play

| Mock | What it fakes | TODO marker | Replaced by |
| --- | --- | --- | --- |
| `mock/dashboard.ts` | Per-row **OI / CVD / liquidations / funding** values on the dashboard table (price/volume/24h% come from real Binance ticker). Seeded by `mulberry32(hashString(pair.code))` so they don't change across polls. | `:32` | §II.2 + §II.3 |
| `mock/chart.ts` | `getChartInit` — entirely deterministic chart, **not actually called**: `MasterChart` uses `getChartInitFromBinance` instead. Dead code, kept for reference. | `:97` | §II.4 |
| `mock/feeds.ts` (`subscribeLiquidations`) | Liquidation feed seed (50 events) + random `setInterval` emitter every 1.5–4 s. | `:69` | §II.6 |
| `mock/feeds.ts` (`subscribeTrades`) | Large-trade feed, same shape as liquidations. | `:79` | §II.7 |
| `mock/pairs.ts` | Hardcoded `iconUrl` per coin (Binance doesn't provide icons). Used to enrich the live Binance pair list. | — | §II.1 (`iconUrl` field) |

## I.3 Stores (Zustand)

| Store | State | Persistence |
| --- | --- | --- |
| `useScreenerStore` (`src/store/Screener/useScreenerStore.ts`) | `searchTerm`, `sortKey`, `sortDir`, `preset` ('all' only) | none |
| `useTerminalStore` (`src/store/Screener/useTerminalStore.ts`) | `timeframe`, `heatmapVisible`, `indicators: Record<IndicatorKey, boolean>` (`volume / cvd / funding / liq / oi`) | localStorage `pantheon-terminal-v1` — persists `indicators` + `heatmapVisible` only |

## I.4 Known problems with the current setup

1. **Rate limits.** Binance public API allows ~1 200 weight/min/IP. Today the dashboard alone is one `/ticker/24hr` every second (weight 40). With one open terminal we also poll `/klines` + `/ticker/24hr` + `/openInterest` continuously. Many concurrent users on the same NAT can be banned for several minutes (HTTP 418/429).
2. **CORS / availability risk.** Binance public API currently sets permissive CORS, but any tightening — or geo-blocks (e.g. US users) — breaks the screener in production with no fallback.
3. **No live streams of any kind.** Every "live" value uses `setInterval`. Higher latency and traffic than a single server-push stream, and miss-prone (a slow tab can lag behind without us noticing).
4. **Stale mocked fields.** The 1 s dashboard poll updates `lastPrice / openPrice / quoteVolume` from Binance, but OI / CVD / liquidations / funding columns are seeded mocks that never change. Users see a "live" table where half the numbers are frozen.
5. **Silent failures.** Every `fetch` is wrapped in `try / catch {}` with no retry or surfacing. A transient network blip silently empties the table on the next render.
6. **No auth boundary.** Nothing on the screener is gated. Once we add per-user features (favorites, alerts, bot orders) we'll need auth on the backend before they make sense.
7. **Misleading "liquidations" pane** (I.1.4). The current series is *taker buy/sell ratio*, not liquidations. Acceptable as a placeholder; must be replaced.
8. **Dead code.** `mock/chart.ts` `getChartInit` is exported, listed in `index.ts`, and never imported by any consumer. Worth removing when the backend lands.

---

# Part II — Target backend contract

## II.0 Configuration

| FE env var | Purpose | Example | Status |
| --- | --- | --- | --- |
| `SCREENER_SERVICE_URL` (server-side, in `next.config.ts`) | Target the Next.js rewrite `/api/screener/:path*` → screener-service. REST and SSE both ride on this single base URL. | `http://localhost:4000` (dev), service URL in prod | declared in `screener-service/README.md` §11, **not yet wired in code** |

Auth: **TBD — see Open Questions**. Assume for now that the same `local_access_token` cookie used elsewhere in the cabinet is in scope for both REST and WS.

## II.1 Endpoints overview

Transport: REST for request-response, **SSE (Server-Sent Events)** for one-way server push to the client. SSE was chosen over WebSocket because client → server has nothing to say on these channels, `EventSource` handles reconnect automatically, and SSE rides over plain HTTP through the Next.js rewrites without a custom server. See §II.9.2 for lifecycle.

| # | Transport | Path | Replaces | FE caller (target) |
| --- | --- | --- | --- | --- |
| 1 | REST `GET` | `/api/screener/pairs` | Binance `/exchangeInfo` + `mock/pairs.ts` icons | bootstrap |
| 2 | REST `GET` | `/api/screener/dashboard` | Binance `/ticker/24hr` + mocked OI/CVD/liq/funding | `AssetsTable.tsx` |
| 3 | SSE `GET` | `/api/screener/stream/dashboard` | the 1 s dashboard poll | `AssetsTable.tsx` (new) |
| 4 | SSE `GET` | `/api/screener/stream/chart/{pair}?tf={tf}` | Binance `/klines` + `openInterestHist` + `takerlongshortRatio` + `fundingRate` + `mock/chart.ts` footprints | `MasterChart.tsx` |
| 5 | REST `GET` | `/api/screener/chart/{pair}/history` | Binance `/klines` backward pagination | `MasterChart.tsx` `loadOlderCandles` |
| 6 | SSE `GET` | `/api/screener/stream/liquidations/{pair}` | `mock/feeds.ts` `subscribeLiquidations` | `LiquidationsFeed.tsx` |
| 7 | SSE `GET` | `/api/screener/stream/trades/{pair}` | `mock/feeds.ts` `subscribeTrades` | `TradesFeed.tsx` |

## II.2 `GET /api/screener/pairs`

Returns the list of pairs the screener should render. Replaces the live Binance `/exchangeInfo` call **and** the hardcoded `iconUrl` map in `mock/pairs.ts`.

**Response 200**
```ts
type Response = AssetPair[]

interface AssetPair {
  id: number          // stable per pair, used as React key
  code: string        // exchange symbol, e.g. "BTCUSDT" — used in all URLs
  coin: string        // base asset, e.g. "BTC" — displayed in UI
  type: 'USDT'        // quote asset; only USDT supported for now
  tick: number        // price tick size, e.g. 0.1 for BTC, 0.0001 for XRP
  precision: number   // decimal places to render for price, e.g. 1 for BTC
  iconUrl: string     // absolute URL to coin logo (PNG/JPG, ~128px)
}
```

**Example**
```json
[
  { "id": 1, "code": "BTCUSDT", "coin": "BTC", "type": "USDT", "tick": 0.1,  "precision": 1, "iconUrl": "https://…/bitcoin.png" },
  { "id": 2, "code": "ETHUSDT", "coin": "ETH", "type": "USDT", "tick": 0.01, "precision": 2, "iconUrl": "https://…/ethereum.png" }
]
```

Notes:
- `tick` and `precision` are required — the chart heatmap bins by `tick` and all price formatting uses `precision`.
- Order in the array is the default render order; FE will sort on top of this.
- `iconUrl` must be set — Binance does not return logos and the FE has no fallback path.

## II.3 `GET /api/screener/dashboard`

One-shot snapshot of metrics for every pair. The FE then merges incremental updates from `/api/screener/stream/dashboard` (§II.4) on top.

**Response 200**
```ts
type Response = Record<string /* AssetPair.code */, DashboardAssetData>

interface DashboardAssetData {
  ohlcv: {
    close_latest: number       // current mark / last close
    close_1h?:    number       // close 1h ago,  used for 1h% change
    close_4h?:    number       // close 4h ago,  used for 4h% change
    close_24h?:   number       // close 24h ago, used for 24h% change
  }
  oi: {
    ointerest_latest: number   // current open interest in USD
    ointerest_1h?:    number   // OI 1h ago — FE renders `(now-1h)/1h - 1` as %
    ointerest_4h?:    number
    ointerest_24h?:   number
  }
  liquidations: {
    buy_turnover_1h?:    number  // USD volume of long liquidations over last 1h
    sell_turnover_1h?:   number  // USD volume of short liquidations over last 1h
    total_turnover_1h?:  number  // buy + sell, displayed in `Liq 1h` column
    buy_turnover_4h?:    number
    sell_turnover_4h?:   number
    total_turnover_4h?:  number
    buy_turnover_24h?:   number
    sell_turnover_24h?:  number
    total_turnover_24h?: number
  }
  cvd: {
    cvd_1h?:  number   // cumulative volume delta over last 1h (signed)
    cvd_4h?:  number
    cvd_24h?: number
  }
  funding?: { close_latest: number }   // funding rate as fraction, e.g. 0.0001 == 0.01%
  tick: number         // duplicated from AssetPair for FE convenience
  precision: number    // duplicated from AssetPair for FE convenience
}
```

Notes:
- All `_1h` / `_4h` / `_24h` fields are *historical reference values*, not deltas. FE computes the % change.
- Missing fields render as "—" / 0. Prefer omitting over sending `null`.
- Funding may be absent for non-perp pairs.
- Replaces both `mock/dashboard.ts` mocks **and** the 1 s Binance `/ticker/24hr` poll.

## II.4 SSE `GET /api/screener/stream/dashboard` — dashboard incremental updates

Pushes patches for any subset of pairs whenever the BE has new data. FE opens an `EventSource` immediately after `/api/screener/dashboard` resolves and keeps it open for the lifetime of the screener page.

**Frame format**

Standard SSE: each frame is a sequence of `event:` / `data:` lines terminated by a blank line.

```
event: dashboard_update
data: {"ts":1735689600000,"updates":[{"code":"BTCUSDT","patch":{"ohlcv":{"close_latest":63450.1}}}]}

```

**Payload**

```ts
interface DashboardUpdateMessage {
  ts: number   // server epoch millis
  updates: Array<{
    code: string                                 // pair, e.g. "BTCUSDT"
    patch: DeepPartial<DashboardAssetData>       // only the fields that changed
  }>
}
```

Notes:
- Sending the whole `DashboardAssetData` per pair is also acceptable (FE merges shallowly per top-level key).
- Batching multiple pairs into one frame is encouraged; 5 Hz upper bound is fine.
- Heartbeat / reconnect / error semantics: see §II.9.2.

## II.5 SSE `GET /api/screener/stream/chart/{pair}?tf={tf}` — chart stream

One SSE connection per open terminal page. Replaces `getChartInitFromBinance` (`MasterChart.tsx:430`) and the indicator polling that currently fans out to four Binance endpoints.

**Path / query**
- `pair` — `AssetPair.code`, e.g. `BTCUSDT`
- `tf` — one of the 12 timeframes in `Timeframe` (`types.ts`):
  `1m | 5m | 15m | 30m | 1h | 2h | 4h | 8h | 12h | 1d | 1w | 1M`

**First frame: `init`**

```
event: init
data: <JSON of ChartInitPayload>

```

```ts
interface ChartInitPayload {
  candles:      Candle[]          // up to ~5000 most recent, ascending by time
  footprints:   FootprintFrame[]  // one per candle, same time index
  cvd:          CvdPoint[]        // same time index as candles
  liquidations: LiquidationBar[]  // same time index as candles
  funding:      FundingBar[]      // same time index as candles
  oi:           OIPoint[]         // same time index as candles
}

interface Candle {
  time:            number   // UNIX seconds, aligned to tf boundary
  open:            number
  high:            number
  low:             number
  close:           number
  volume:          number   // in base asset units (NOT USD)
  takerBuyVolume?: number   // optional; lets FE derive CVD client-side if cvd[] is absent
}

interface FootprintFrame {
  time: number                                          // same as parent candle
  data: Record<string /* price-as-string */, { b: number; s: number }>
  // key: price rounded to `tick` size, stringified with up to 8 decimals.
  // b = buy volume traded at that price, s = sell volume.
}

interface CvdPoint        { time: number; value: number }
interface LiquidationBar  { time: number; buy_volume: number; sell_volume: number }
interface FundingBar      { time: number; value: number }   // fraction (0.0001 == 0.01%)
interface OIPoint         { time: number; value: number }   // USD notional
```

**Subsequent frames: `tick` and `bar_close`**

Two flavours; FE will support both.

(a) `event: tick` — most common, fired on every tick within the current bar (updates the last bar in place if `candle.time` matches the last bar's time, otherwise appends).

```
event: tick
data: <JSON of TickPayload>

```

```ts
interface TickPayload {
  candle?:       Candle
  footprint?:    FootprintFrame
  cvd?:          CvdPoint
  liquidations?: LiquidationBar
  funding?:      FundingBar
  oi?:           OIPoint
}
```

(b) `event: bar_close` — fired once when a bar closes and a new one opens. Same payload shape as `tick`.

Notes:
- `time` is **UNIX seconds**, not millis. Lightweight-Charts requires seconds.
- Footprint `data` keys are strings to preserve precision across JSON. Use `.toFixed(8)`.
- On reconnect (network blip → `EventSource` auto-reconnect) the server re-sends `init` then resumes ticks. FE replaces its local chart state on every `init`. See §II.9.2.
- `LiquidationBar` here is real liquidation USD volume — **not** the taker-ratio stand-in used today (I.1.4).

## II.6 `GET /api/screener/chart/{pair}/history` — Load older candles

Powers backward-scroll on the chart. Returns *only* candles + footprints; secondary series are not back-paginated.

**Query**
- `before` — UNIX seconds; return bars with `time < before`
- `tf` — same enum as §II.5
- `limit` — int, FE will request `6000`

**Response 200**
```ts
{
  candles:    Candle[]          // ascending by time, all with time < `before`
  footprints: FootprintFrame[]  // same time index as candles
}
```

Today's FE backward-paginates Binance `/klines` directly (`MasterChart.tsx:172`). When this endpoint ships, that code path is swapped over.

## II.7 SSE `GET /api/screener/stream/liquidations/{pair}` — liquidation feed

Per-pair live liquidation events. Replaces `subscribeLiquidations` in `mock/feeds.ts`.

**First frame: `seed`**

```
event: seed
data: {"events":[…up to 50 LiquidationEvent…]}

```

```ts
interface LiqSeedPayload {
  events: LiquidationEvent[]   // up to 50 most recent, descending by ts
}
```

**Per-event frame**

```
event: event
data: <JSON of LiquidationEvent>

```

```ts
interface LiquidationEvent {
  ts:     number             // epoch millis
  symbol: string             // pair code, e.g. "BTCUSDT"
  side:   'buy' | 'sell'     // 'buy' = long liquidated, 'sell' = short liquidated
  price:  number
  volume: number             // USD notional
}
```

FE keeps a sliding window of 50 events (newest first).

On reconnect: server re-sends `seed`, then resumes live events.

## II.8 SSE `GET /api/screener/stream/trades/{pair}` — large-trades feed

Same shape as §II.7 but for large prints only. Server-side threshold is an EMA-based detector (see `screener-service/README.md` §6.1) — `volume` and `notional` test against a rolling per-pair baseline so small-cap tokens aren't drowned out by BTC-scale prints.

```ts
interface TradeEvent {
  ts:      number
  symbol:  string
  side:    'buy' | 'sell'
  price:   number
  volume:  number          // USD notional
  isLarge: true            // always true — server-side filter
}
```

Frames: `event: seed` (once, payload `{ events: TradeEvent[] }`), then `event: event` per print (payload is the `TradeEvent` itself).

## II.9 Cross-cutting concerns

### II.9.1 Auth — **TBD**
Cookie? Bearer in `Authorization` header? Token in WS query string (e.g. `?token=…`)? Subprotocol? Decide before any endpoint is shipped.

### II.9.2 SSE lifecycle

- **Heartbeat.** Server sends `:keepalive\n\n` (SSE comment frame) every 15 s on every open stream. `EventSource` ignores comment frames silently — their only purpose is to keep proxies and load balancers from closing the idle TCP connection.
- **Reconnect.** `EventSource` reconnects automatically on any disconnect (default 2–3 s delay). Server may set the delay explicitly by sending a `retry: <ms>` line once at connection start; not required.
- **Resume on reconnect.** No cursor, no `Last-Event-ID` replay. Each stream re-establishes its own initial state:
  - `/stream/chart/{pair}` re-sends `event: init` then resumes ticks. FE replaces local state.
  - `/stream/liquidations/{pair}` and `/stream/trades/{pair}` re-send `event: seed` then resume events.
  - `/stream/dashboard` resumes mid-stream without re-seed; clients keep their last known `DashboardAssetData` until the first `dashboard_update` lands.
- **Stopping reconnect.** If the server wants the client to give up (e.g. `pair` was delisted), it returns HTTP `204 No Content` on the next reconnect — `EventSource` treats `204` as terminal and stops.
- **Connect-time errors.** Standard HTTP status codes:
  - `404` — unknown pair.
  - `400` — bad `tf` query parameter.
  - `503` — upstream not connected (Coinank or Binance WS is down). Client should back off and retry.

### II.9.3 Errors
REST errors should use:
```json
{ "error": { "code": "PAIR_NOT_FOUND", "message": "Unknown pair: XYZUSDT" } }
```
with HTTP status reflecting the class (400/401/404/5xx).

The FE currently swallows all fetch errors silently (see §I.4 #5). When the backend lands, the FE should surface error toasts at minimum.

### II.9.4 Time units
- Candle / chart-series `time`: **UNIX seconds** (lightweight-charts requirement).
- Feed events `ts`: **epoch millis** (renders directly via `new Date(ts)`).
- Don't mix.

### II.9.5 Number sizes
USD turnover values can exceed `Number.MAX_SAFE_INTEGER` for BTC. Either keep them as `number` (acceptable — FE only displays formatted USD) or send as strings. **Decide and stick to one.**

## II.10 Where each endpoint will be wired in the FE

| Endpoint | FE module(s) | Replaces |
| --- | --- | --- |
| `GET /api/screener/pairs` | `src/api/Screener/getBinanceFuturesPairs.ts` (call site) + `src/lib/screener/mock/pairs.ts` (icons) | Binance `/exchangeInfo` |
| `GET /api/screener/dashboard` | `src/app/components/Screener/AssetsTable.tsx` initial load + `src/lib/screener/mock/dashboard.ts` (delete) + `src/app/components/Screener/LivePrice.tsx` (header price) | Binance `/ticker/24hr` (`AssetsTable`, `LivePrice`) |
| SSE `/api/screener/stream/dashboard` | `src/app/components/Screener/AssetsTable.tsx` (replace `setInterval` with `EventSource`) | the 1 s dashboard poll |
| SSE `/api/screener/stream/chart/{pair}` | `src/app/components/Screener/MasterChart.tsx` (replace `getChartInitFromBinance` + the 1 s/5 s polls) | Binance `/klines`, `/openInterest`, `/openInterestHist`, `/takerlongshortRatio`, `/fundingRate` |
| `GET /api/screener/chart/{pair}/history` | `src/app/components/Screener/MasterChart.tsx` `loadOlderCandles` | Binance `/klines` backward pagination |
| SSE `/api/screener/stream/liquidations/{pair}` | `src/app/components/Screener/LiquidationsFeed.tsx` | `mock/feeds.ts` `subscribeLiquidations` |
| SSE `/api/screener/stream/trades/{pair}` | `src/app/components/Screener/TradesFeed.tsx` | `mock/feeds.ts` `subscribeTrades` |

---

# Open questions

These must be resolved before BE integration starts.

- [ ] **Auth model** for REST and SSE. `EventSource` cannot set custom request headers, so any auth must travel as a **cookie** (preferred, matches the rest of the cabinet) or a **query-string token**. Bearer-in-`Authorization` is not an option for SSE.
- [ ] **Numeric format** for large USD values — `number` everywhere vs. `string` for turnovers.
- [ ] **`/stream/dashboard` message granularity** — patch-per-pair (recommended) or full-snapshot replays.
- [ ] **History pagination** — by `before=<ts>` (recommended) or by `page`/`offset`.
- [ ] **Funding-rate semantics** — fraction (`0.0001 = 0.01 %`) or basis points? FE currently assumes fraction.
- [ ] **Rate limits** — per-IP/per-token caps on both REST and SSE connections.
- [ ] **Liquidations source** — backend must use real liquidation streams (Coinank `liqOrder@All@All@1m` per `screener-service/README.md` §5.2); the current taker-ratio stand-in (§I.1.4) must not be carried forward.
- [ ] **Migration order** — sequenced in `screener-service/README.md` §14. Summary: §II.2 (pairs) + §II.3 (dashboard) first, then §II.4 SSE, then chart, then feeds.

Resolved (kept here for trail):
- ~~WS heartbeat / reconnect / resume / close codes~~ — replaced by SSE lifecycle, see §II.9.2.
