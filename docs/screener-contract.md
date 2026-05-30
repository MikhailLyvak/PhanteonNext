# Screener FE ↔ BE Contract

Audience: BE engineer (or Claude Code) implementing the screener endpoints.
Source of truth for FE types: `src/lib/screener/types.ts`.
Source of truth for FE consumers: see "Where each endpoint is used" at the bottom.

The FE is currently fed by deterministic mocks in `src/lib/screener/mock/`. Every mock file has a `TODO(real-data)` comment naming the endpoint it will be replaced by. This document describes those endpoints.

---

## 0. Configuration

| FE env var | Purpose | Example |
| --- | --- | --- |
| `NEXT_PUBLIC_SCREENER_API_BASE_URL` | REST base for all `/api/screener/*` calls | `https://api.example.com` |
| `NEXT_PUBLIC_SCREENER_WS_BASE_URL` | WS base for all `/ws/*` connections | `wss://api.example.com` |

Auth: **TBD — see Open Questions §7.** Assume for now that the same `local_access_token` cookie used elsewhere in the cabinet is in scope for both REST and WS.

---

## 1. Endpoints overview

| # | Transport | Path | Purpose | FE caller |
| --- | --- | --- | --- | --- |
| 1 | REST `GET` | `/api/screener/pairs` | Tradeable pair listing (+ tick / precision / icon) | bootstrap, see §2 |
| 2 | REST `GET` | `/api/screener/dashboard` | Snapshot of all screener rows | `AssetsTable.tsx:50` |
| 3 | WS | `/ws/all` | Incremental dashboard updates | `AssetsTable.tsx` (TODO) |
| 4 | WS | `/ws/chart/{pair}?tf={tf}` | Chart init payload + incremental updates | `MasterChart.tsx:177` |
| 5 | WS | `/ws/liquidations-stream/{pair}` | Live liquidation events for a pair | `LiquidationsFeed.tsx:22` |
| 6 | WS | `/ws/trades-stream/{pair}` | Live large-trade events for a pair | `TradesFeed.tsx:22` |
| 7 | REST `GET` | `/api/screener/chart/{pair}/history` | Backfill older candles (Load older button) | `MasterChart.tsx:303` (TODO) |

---

## 2. `GET /api/screener/pairs`

Returns the list of pairs the screener should render. Replaces the hardcoded `PAIRS` constant in `src/lib/screener/mock/pairs.ts`.

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
  { "id": 1, "code": "BTCUSDT", "coin": "BTC", "type": "USDT", "tick": 0.1,    "precision": 1, "iconUrl": "https://…/bitcoin.png" },
  { "id": 2, "code": "ETHUSDT", "coin": "ETH", "type": "USDT", "tick": 0.01,   "precision": 2, "iconUrl": "https://…/ethereum.png" }
]
```

Notes:
- `tick` and `precision` are required — the chart heatmap bins by `tick` and all price formatting uses `precision`.
- Order in the array is the default render order; FE will sort on top of this.

---

## 3. `GET /api/screener/dashboard`

Returns a one-shot snapshot of metrics for every pair. The FE then merges incremental updates from `/ws/all` (§4) on top.

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

---

## 4. WS `/ws/all` — dashboard incremental updates

Pushes deltas for any subset of pairs whenever the BE has new data. FE listens for the lifetime of the screener page.

**Connection**
- Open immediately after `/api/screener/dashboard` resolves.
- No subscribe message — server pushes for all pairs.
- Heartbeat: **TBD §7.**

**Server → client message**
```ts
interface DashboardUpdateMessage {
  type: 'dashboard_update'
  ts: number   // server epoch millis
  updates: Array<{
    code: string                                 // pair, e.g. "BTCUSDT"
    patch: DeepPartial<DashboardAssetData>       // only the fields that changed
  }>
}
```

Notes:
- Sending the whole `DashboardAssetData` is also acceptable (FE merges shallowly per top-level key).
- Batching multiple pairs into one message is encouraged; 5 Hz upper bound is fine.

---

## 5. WS `/ws/chart/{pair}?tf={tf}` — chart stream

Single WS per open terminal page. Replaces `getChartInit` in `src/lib/screener/mock/chart.ts`.

**Path params**
- `pair` — `AssetPair.code`, e.g. `BTCUSDT`
- `tf` — one of `1m | 5m | 15m | 1h | 4h | 1d` (see `Timeframe` in `types.ts`)

**Server → client: first message (init)**
```ts
interface ChartInitMessage {
  type: 'init'
  payload: ChartInitPayload
}

interface ChartInitPayload {
  candles:      Candle[]          // ~200 most recent, ascending by time
  footprints:   FootprintFrame[]  // one per candle, same time index
  cvd:          CvdPoint[]        // same time index as candles
  liquidations: LiquidationBar[]  // same time index as candles
  funding:      FundingBar[]      // same time index as candles
  oi:           OIPoint[]         // same time index as candles
}

interface Candle {
  time:   number   // UNIX seconds, aligned to tf boundary
  open:   number
  high:   number
  low:    number
  close:  number
  volume: number   // in base asset units (NOT USD)
}

interface FootprintFrame {
  time: number                                          // same as parent candle
  data: Record<string /* price-as-string */, { b: number; s: number }>
  // key: price rounded to `tick` size, stringified with up to 8 decimals.
  // b = buy volume traded at that price, s = sell volume.
}

interface CvdPoint        { time: number; value: number }
interface LiquidationBar  { time: number; buy_volume: number; sell_volume: number }
interface FundingBar      { time: number; value: number }
interface OIPoint         { time: number; value: number }
```

**Server → client: subsequent messages (update)**

Two flavours are acceptable; FE will support both.

(a) *Replace last bar* — most common, fired on every tick within the current bar:
```ts
{
  type: 'tick'
  candle?:       Candle           // updates last bar in-place if time matches; appends otherwise
  footprint?:    FootprintFrame
  cvd?:          CvdPoint
  liquidations?: LiquidationBar
  funding?:      FundingBar
  oi?:           OIPoint
}
```

(b) *Bar close* — fired once when a bar closes and a new one opens:
```ts
{ type: 'bar_close' /* same shape as 'tick' */ }
```

Notes:
- `time` is **UNIX seconds**, not millis. Lightweight-Charts requires seconds.
- Footprint `data` keys are strings to preserve precision across JSON. Use `.toFixed(8)`.
- FE never sends client → server messages on this socket. If you need subscriptions, prefer separate URLs.

---

## 6. `GET /api/screener/chart/{pair}/history` — Load older candles

Powers the "Load older" button (currently no-op at `MasterChart.tsx:303`). Returns *only* candles + footprints; secondary series are not back-paginated.

**Query**
- `before` — UNIX seconds; return bars with `time < before`
- `tf` — same enum as §5
- `limit` — int, FE will request `6000`

**Response 200**
```ts
{
  candles:    Candle[]          // ascending by time, all with time < `before`
  footprints: FootprintFrame[]  // same time index as candles
}
```

---

## 7. WS `/ws/liquidations-stream/{pair}` — liquidation feed

Per-pair live liquidation events. Replaces `subscribeLiquidations` in `src/lib/screener/mock/feeds.ts`.

**On connect: seed**
```ts
interface LiqSeedMessage {
  type: 'seed'
  events: LiquidationEvent[]   // up to 50 most recent, descending by ts
}
```

**Per-event**
```ts
interface LiqEventMessage {
  type: 'event'
  event: LiquidationEvent
}

interface LiquidationEvent {
  ts:     number             // epoch millis
  symbol: string             // pair code, e.g. "BTCUSDT"
  side:   'buy' | 'sell'     // 'buy' = long liquidated, 'sell' = short liquidated
  price:  number
  volume: number             // USD notional
}
```

FE keeps a sliding window of 50 events (newest first).

---

## 8. WS `/ws/trades-stream/{pair}` — large-trades feed

Same shape as §7 but for large prints only (BE-side threshold).

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

Messages: `{ type: 'seed', events: TradeEvent[] }` on connect, then `{ type: 'event', event: TradeEvent }` per print.

---

## 9. Cross-cutting concerns

### 9.1 Auth — **TBD**
Cookie? Bearer in `Authorization` header? Token in WS query string (e.g. `?token=…`)? Subprotocol? Decide before any endpoint is shipped. See [Open Questions](#open-questions).

### 9.2 WS lifecycle — **TBD**
- Heartbeat: ping interval and direction (server-ping vs client-ping)?
- Reconnect: FE strategy will be exponential backoff (1s → 30s cap). On reconnect, does the client need to send a `since=<ts>` cursor, or does the server replay automatically?
- Close codes: define BE-side close codes (auth failure, unknown pair, rate-limited).

### 9.3 Errors
REST errors should use:
```json
{ "error": { "code": "PAIR_NOT_FOUND", "message": "Unknown pair: XYZUSDT" } }
```
with HTTP status reflecting the class (400/401/404/5xx).

### 9.4 Time units
- Candle / chart-series `time`: **UNIX seconds** (lightweight-charts requirement).
- Feed events `ts`: **epoch millis** (renders directly via `new Date(ts)`).
- Don't mix.

### 9.5 Number sizes
USD turnover values can exceed `Number.MAX_SAFE_INTEGER` for BTC. Either keep them as `number` (acceptable — FE only displays formatted USD) or send as strings. **Decide and stick to one.**

---

## 10. Where each endpoint is used (FE source map)

| Endpoint | FE module | Line |
| --- | --- | --- |
| `GET /api/screener/pairs` | `src/lib/screener/mock/pairs.ts` | replaces `PAIRS` export |
| `GET /api/screener/dashboard` | `src/app/components/Screener/AssetsTable.tsx` | `:50` |
| WS `/ws/all` | `src/app/components/Screener/AssetsTable.tsx` | not yet wired |
| WS `/ws/chart/{pair}` | `src/app/components/Screener/MasterChart.tsx` | `:177` |
| WS `/ws/liquidations-stream/{pair}` | `src/app/components/Screener/LiquidationsFeed.tsx` | `:22` |
| WS `/ws/trades-stream/{pair}` | `src/app/components/Screener/TradesFeed.tsx` | `:22` |
| `GET /api/screener/chart/{pair}/history` | `src/app/components/Screener/MasterChart.tsx` | `:303` (no-op) |

---

## Open Questions

These must be resolved before BE integration starts.

- [ ] **Auth model** for REST and WS. Cookie / bearer / query token / subprotocol?
- [ ] **WS heartbeat** — interval and direction. Native ping/pong frames or app-level `{type:'ping'}`?
- [ ] **WS reconnect / resume** — does the client send `since=<ts>` or does the server replay automatically?
- [ ] **Pairs source** — REST endpoint as in §2, or keep the FE list hardcoded with BE-validated symbols?
- [ ] **Numeric format** for large USD values — `number` everywhere vs. `string` for turnovers.
- [ ] **`/ws/all` message granularity** — patch-per-pair (recommended) or full-snapshot replays.
- [ ] **History pagination** — by `before=<ts>` (recommended) or by `page`/`offset`.
- [ ] **Funding-rate semantics** — fraction (0.0001 = 0.01%) or basis points? FE currently assumes fraction.
- [ ] **Rate limits** — per-IP/per-token caps on both REST and WS.
- [ ] **Close codes** for WS errors (auth failed, unknown pair, banned).
