# Screener — Architecture Overview

Audience: engineers joining the screener stack who need to understand **what was built and why**, not just the API surface.

This document is a holistic, decision-oriented overview of the screener system end-to-end:

- **Frontend** — the screener feature inside `PhanteonNext` (Next.js app).
- **Backend** — the `screener-service` repo (`/Users/asilverrrr/WebstormProjects/screener-service`).

For specific reference material, see the sibling docs:

- [`screener-contract.md`](./screener-contract.md) — FE ↔ BE data contract (REST + SSE message shapes).
- [`screener-integration-plan.md`](./screener-integration-plan.md) — how the FE was cut over from direct Binance calls to the backend.
- [`screener-known-issues.md`](./screener-known-issues.md) — open issues and limitations.
- [`screener-lightweight-limits.md`](./screener-lightweight-limits.md) — explicit budget constraints (no Redis/Kafka until X, etc.).

---

## 1. What the screener is

A real-time, multi-pair crypto trading terminal embedded in the Pantheon cabinet. It provides:

- A **dashboard table** of all Binance USDT-margined perpetuals, with sortable columns for last price, 24h volume, Open Interest, funding rate, CVD, and liquidation turnover across multiple timeframes.
- A **terminal view** per pair, with candlestick charts, an Open Interest pane, a CVD pane, a funding pane, a liquidations footprint overlay (heatmap), and a live large-trade feed.
- **Live updates** at sub-second granularity for prices, ticks, and footprints.

The audience is active retail/prop traders watching many markets simultaneously. The design priorities, in order, are:

1. **Latency** — visible updates must feel live (≤1 s end-to-end).
2. **Coverage** — every Binance USDT perpetual must be watchable, not a hand-curated list.
3. **Operational cost** — the backend must run for under $10/month at current load.
4. **Operational simplicity** — single team, no dedicated SRE; everything must be debuggable from one log stream.

Those priorities drove every major decision below.

---

## 2. System topology

```
 ┌──────────────────────────────────────────────────────────────┐
 │ Browser (PhanteonNext)                                       │
 │                                                              │
 │  React + Zustand stores ── EventSource (SSE) ──┐             │
 │       └─ lightweight-charts                    │             │
 └────────────────────────────────────────────────┼─────────────┘
                                                  │
                            same-origin           │
              ┌─────────────────────────────────  ┼ ────────────┐
              │ Next.js app router                │             │
              │  /screener-proxy/[...path]/route.ts             │
              │  - reverse-proxies REST + SSE     │             │
              │  - strips problematic headers     │             │
              │  - forces `x-accel-buffering: no` │             │
              └─────────────────────────────────  ┼ ────────────┘
                                                  │
                                                  ▼
 ┌──────────────────────────────────────────────────────────────┐
 │ screener-service (Node 22 + Fastify)                         │
 │                                                              │
 │  ┌── Upstream ──────────────┐  ┌── State (in-memory) ────┐   │
 │  │ Binance WS               │  │ dashboard (per pair)    │   │
 │  │  !ticker@arr             │─▶│ liquidations ring (48h) │   │
 │  │  !markPrice@arr@1s       │  │ large-trades ring       │   │
 │  │  !forceOrder@arr         │  │ funding (latest)        │   │
 │  │  <sym>@aggTrade (lazy)   │  │ chart bars per pair/tf  │   │
 │  │ Binance REST pollers     │  └─────────────────────────┘   │
 │  │  /openInterest           │              │                 │
 │  │  /openInterestHist       │              ▼                 │
 │  │  /klines (CVD)           │  ┌── Fanout ──────────────┐    │
 │  │  /exchangeInfo (6h)      │  │ SSE broker per channel │    │
 │  └──────────────────────────┘  │  dashboard             │    │
 │                                │  chart:PAIR:TF         │    │
 │                                │  trades:PAIR           │    │
 │                                │  liquidations:PAIR     │    │
 │                                └────────────┬───────────┘    │
 │                                             │                │
 │   every 60 s, delta flush                   │                │
 │           ▼                                                  │
 │  ┌── PostgreSQL ─────────────────────────┐                   │
 │  │ liquidations / trades / pair_indicators                   │
 │  └───────────────────────────────────────┘                   │
 └──────────────────────────────────────────────────────────────┘
```

There is **exactly one backend process** and **one Postgres database**. There are no workers, no message brokers, no Redis, no second instance for HA. This is intentional — see §3.1.

---

## 3. Architectural decisions

Each decision below names the choice, the alternatives that were considered, and the reasoning. These are the load-bearing decisions; smaller tactical choices live in code comments.

### 3.1 Single-process, in-memory aggregator (no Redis, no Kafka)

**Decision.** All hot state — per-pair rollups, the 48 h liquidation ring, the large-trade ring, chart bars, funding — lives in the Node process's heap. Postgres is used only for cold history and for restart recovery.

**Alternatives considered.**

- Redis for shared state across multiple Node instances.
- Kafka/Redpanda for an event log that downstreams could replay.

**Why we didn't.** The screener at current scale handles ~400 pairs, ~1k SSE clients in the peak case, and tens of WS frames/sec. That fits in <300 MB of RSS comfortably. Adding Redis or Kafka would:

1. Add an external dependency to the failure surface (each one is another thing that can be down at 3am).
2. Add a network hop on the hot path (Binance WS → Redis → SSE), which is a measurable latency tax we have no budget for given priority (1).
3. Add monthly cost (priority 3) and operational burden (priority 4) for a problem we don't have.

The boundary at which we'd revisit this is captured explicitly in [`screener-lightweight-limits.md`](./screener-lightweight-limits.md). Briefly: if we ever need a second instance (HA, blue/green, or sharded by pair), we add Redis. Until then, the process *is* the cache.

**Implication for callers.** A restart loses up to 60 s of liquidations/large-trades in-memory state (since they're flushed to Postgres on that cadence), plus all the in-flight SSE connections (clients reconnect transparently via `EventSource`).

### 3.2 SSE for all live channels, not WebSocket

**Decision.** Every live channel from BE to FE is **Server-Sent Events** over HTTP. There is no client → server message channel.

**Alternatives considered.**

- WebSocket from FE ↔ BE.
- Long-poll.

**Why SSE.**

- **Unidirectional fits the problem.** The browser never has anything to send the server about a chart — it only consumes pushes. WebSocket's bidirectional capability would be unused.
- **Auto-reconnect is free.** Browser `EventSource` reconnects on its own with the `Last-Event-ID` mechanism. WebSocket needs a custom reconnect loop on every consumer.
- **Tunnels through everything.** SSE is plain HTTP — it traverses CDNs, reverse proxies, corporate firewalls, and the Next.js app-router route handler at `src/app/screener-proxy/[...path]/route.ts` with zero special configuration beyond setting `x-accel-buffering: no` to prevent buffering.
- **Auth via cookie** inherits from the same-origin browser context. WebSocket would need explicit token plumbing.

**Tradeoff.** Each SSE connection consumes a TCP connection. At our current scale that's fine; if we ever hit ~5–10k concurrent viewers we'll need to revisit (likely with a fan-out tier in front, still using SSE).

### 3.3 Same-origin proxy at `/screener-proxy/*`

**Decision.** The browser never talks to `screener-service` directly. All requests go to `/screener-proxy/<path>` on the same origin as the cabinet, and the Next.js route handler tunnels them upstream.

**Why.**

- **No CORS surface.** Cross-origin SSE with credentials is painful; same-origin is trivial.
- **Auth piggybacks the cabinet session.** Whatever cookie the cabinet uses authenticates the screener too — no separate token exchange.
- **Upstream URL is environment-controlled.** The Heroku URL is the default; for local dev, swap `UPSTREAM` to `http://localhost:4000` in the route handler and the entire FE rewires.
- **Header hygiene.** The route handler strips `set-cookie`, `transfer-encoding`, and other headers that confuse intermediate proxies, and forces `x-accel-buffering: no` so SSE flushes immediately rather than waiting on nginx-style buffering.

**Tradeoff.** Every byte goes through Node twice (once for the proxy hop, once at the backend). At current throughput this is fine. If it ever becomes a bottleneck, the same proxy semantics can be moved to a CDN edge worker.

### 3.4 On-demand large-trade subscriptions (not a fixed top-N)

**Decision.** The `aggTrade` WebSocket subscription for any given pair is opened **only when the first SSE viewer connects to `/stream/trades/:pair`**, and torn down ~30 s after the last viewer disconnects (the linger window absorbs brief reconnects).

**History.** Earlier the service subscribed to a fixed set of ~40 pairs at boot by URL-packing them into one `streams=…` multiplex. That meant the long tail of pairs was invisible to the large-trade feed, and that we paid the per-frame cost continuously even when nobody was watching.

**Why on-demand.**

- **Full universe coverage** (priority 2). Every Binance perp can now show a large-trade feed when somebody opens it.
- **Costs scale with viewership, not with the catalogue.** If nobody opens the trades feed for `DOGEUSDT`, we don't pay for it.
- **Per-pair EMA isolation.** Each pair's large-trade detector ([`src/upstream/large-trade-detector.ts`](../../screener-service/src/upstream/large-trade-detector.ts)) maintains its own EMA-smoothed volume baseline. On unsubscribe we explicitly drop the per-pair state via `detector.forget(pair)` so the next subscription starts cold and warms up against fresh data, not stale stats.

**Tradeoff.** The first viewer to open a pair sees a brief warm-up window before the detector has enough history to mark trades as "large." We accept this — REST backfill of the last ~15 min through a fresh EMA narrows the gap.

### 3.5 EMA-smoothed large-trade detector (not a fixed USD threshold)

**Decision.** A trade is "large" if both:

1. `qty > ema_volume * EMA_MULTIPLIER` (default multiplier 12) — relative to the pair's recent activity, and
2. `qty * price > MIN_NOTIONAL_USD` (default $5k) — absolute floor.

**Why both.**

- A fixed USD threshold drowns `BTCUSDT` in noise while missing meaningful activity on `XRPUSDT`-class pairs.
- A pure-EMA filter triggers on any momentary spike for low-volume pairs.

The AND of the two gives "this is large *relative to this pair's typical flow* AND it isn't a rounding error" — which matches how traders actually parse the feed.

**Knobs.** All three constants (`EMA_ALPHA`, `EMA_MULTIPLIER`, `MIN_NOTIONAL_USD`) are environment variables, so we can tune per-deployment without a redeploy.

### 3.6 Ring buffer + Postgres watermark for liquidations and trades

**Decision.**

- **Hot path:** liquidations and large trades live in an in-memory ring buffer (48 h window, capped at 2 000 per pair). The dashboard's `liq_*` columns and the live SSE event stream read directly from the ring.
- **Cold path:** every 60 s, a snapshot task reads everything newer than the last watermark (`lastLiqTs`) and bulk-inserts into Postgres with `ON CONFLICT DO NOTHING`. The watermark is advanced to `max(rows.ts)`.
- **Boot:** on startup, the ring is re-hydrated by selecting the last 48 h from Postgres.

**Why.**

- **Reads stay hot.** The dashboard's per-pair 1 h liquidation turnover is computed against the ring on every coalesce flush; never a Postgres query.
- **Idempotent writes.** `ON CONFLICT DO NOTHING` against a multi-column primary key (`ts, pair, exchange, side, price`) means re-entries after a crash are safe — you can replay the same window without duplicates.
- **Re-entry guard.** If a snapshot tick is still in flight when the next one fires, the second one is skipped with a warning. The watermark + ON CONFLICT mean a missed tick is recovered on the next one — no orphaned state.
- **Bounded memory.** The ring is FIFO with a hard cap and a time window, so unbounded liquidation storms can't OOM the process.

**Tradeoff.** A crash mid-cycle loses up to 60 s of liquidation history. That's an acceptable RPO for a screener (vs an order management system where it would not be).

### 3.7 PostgreSQL, not SQLite

**Decision.** Postgres via the `pg` driver. Used for cold history (`liquidations`, `trades`) and cached per-pair indicators (`pair_indicators`).

**History.** The first version of the service used SQLite on a mounted volume. We moved to Postgres because:

- **Managed Postgres is cheap and operationally trivial** on Railway / Render / Supabase. We don't pay for SRE attention.
- **Concurrent readers + single writer** is the workload here (snapshot task writes; `/dashboard` cold-start reads from the indicators table). SQLite handles this with WAL, but Postgres handles it without any locking gymnastics.
- **No mount.** Removing the volume removed an entire class of deployment failure mode.

**What stayed.** Single-writer (the snapshot task), low write rate, simple schema, no foreign keys, no triggers, no extensions. The schema is small enough to fit in one mental model.

### 3.8 `/market/ws` instead of `/ws` for Binance WebSocket

**Decision.** All Binance futures WS connections use `wss://fstream.binance.com/market/ws/*` and `/market/stream`, not the documented `/ws/*` and `/stream`.

**Why.** Empirically, the `/ws/` path completes its WebSocket handshake successfully but **silently drops market-data frames** from some POPs and ASNs. The handshake looks fine, ping/pong works, and yet no frames arrive. Switching to `/market/ws` resolved this end-to-end in production. This is documented as a feedback memory ([`feedback_binance_ws_diagnosis.md`](../../../../.claude/projects/-Users-asilverrrr-WebstormProjects-PhanteonNext/memory/feedback_binance_ws_diagnosis.md)) so we don't waste hours blaming geo/ASN next time.

**Implication.** When diagnosing missing frames, this is the first thing to check — not the network.

### 3.9 Layered upstream / state / fanout separation

**Decision.** The service is split into three layers with strict dataflow:

- **`upstream/`** — exchange-specific. Knows about Binance WS frame shapes, REST endpoints, reconnect logic. Emits normalized events.
- **`state/`** — exchange-agnostic. Receives normalized events, maintains rollups. Knows nothing about HTTP, nothing about SSE.
- **`fanout/` (`sse.ts`)** — knows about HTTP and SSE channels. Knows nothing about Binance, nothing about data semantics.
- **HTTP routes** — thin glue between state and fanout. No business logic.

**Why this matters.** When we eventually add Bybit (or replace Binance liquidations with Coinank, as we did briefly), only `upstream/` changes. State and fanout aren't touched. The pair-format and field-name normalization happens at the upstream boundary, so the rest of the service speaks one canonical vocabulary.

### 3.10 Coalesced dashboard patches (100 ms flush window)

**Decision.** Per-pair dashboard updates are not streamed individually. The route handler aggregates patches per pair in a 100 ms window and emits one `dashboard_update` event per client with everything that changed in that window.

**Why.**

- A single browser receiving 400+ updates/sec across all visible pairs would burn JS event-loop budget on `JSON.parse` and store mutations.
- Patches that touched the same pair multiple times within the window collapse to one — the consumer sees only the final state, not the intermediate values.
- 100 ms is below the threshold where the UI feels stale, but above the threshold where coalescing has meaningful win.

**FE-side mirror.** The frontend `useScreenerStore` deep-merges incoming patches into the dashboard map in place, preserving object identity of unchanged fields. That keeps React reconciliation cheap.

### 3.11 Ref-counted shared SSE subscription (frontend)

**Decision.** On the FE, `useScreenerStore` opens **exactly one** EventSource for `/stream/dashboard`, and reference-counts subscribers. Header ticker, dashboard table, alert widgets — they all share the same socket. The socket closes when the last subscriber unmounts.

**Why.**

- N components on the same page would otherwise open N EventSources, multiplying server load and burning the browser's per-host connection budget.
- The store is the single source of truth anyway, so there's no semantic reason for components to each maintain their own subscription.

See `src/store/Screener/useScreenerStore.ts` lines 61–108 for the implementation.

### 3.12 Zustand over Redux / React Query for screener state

**Decision.** Two Zustand stores: `useScreenerStore` (dashboard) and `useTerminalStore` (per-chart). No Redux, no React Query for live screener data.

**Why.**

- **Live SSE-driven data doesn't fit React Query's "query/mutation" model.** RQ is for request-response with cache invalidation. The screener has neither.
- **Redux's ceremony isn't worth it** for state that's almost entirely owned by a single subscription. We do not need time-travel debugging on a price stream.
- **Zustand's `subscribeWithSelector` middleware** gives selective re-renders cheaply, and the `persist` middleware handles the localStorage requirements (column widths, indicator visibility, timeframe) declaratively.

**Tradeoff.** Two stores means coordinating their lifecycles (the terminal store's chart subscription is independent of the dashboard store's tick stream). We accept this; the alternative is one giant store with weak boundaries.

### 3.13 lightweight-charts (TradingView) for charting

**Decision.** [`lightweight-charts`](https://github.com/tradingview/lightweight-charts) v5, not the full TradingView Charting Library, not recharts/visx/Highcharts.

**Why.**

- **Built for financial time series.** Candle rendering, multi-pane sync, crosshair, scroll-back are first-class — not bolted on.
- **No license cost or distribution hassle** unlike the full TradingView Charting Library.
- **Plugin API** is good enough to support our custom heatmap overlay (`HeatmapPlugin.ts`) for the footprints layer.
- **Performance** at 1500+ visible bars + 4 indicator panes is acceptable on a mid-range laptop.

**What we gave up.** Tools like drawings (trendlines, fibs), pattern recognition, and "Compare with…" overlays that the full TV library has. These are explicitly out of scope for the screener (see §15 of the screener-service README).

### 3.14 Deterministic mocks during the FE-only era (now deprecated)

**Decision (historical).** Before the backend existed, the screener's OI/CVD/funding columns on the dashboard were filled with **deterministic seeded mocks** (`mulberry32` over the pair symbol).

**Why.** A pure noise/random fill would scroll values every render, hiding bugs and making the page feel broken. A deterministic seed by pair gave stable values per pair across reloads, so the layout looked plausible while the real backend was being built.

**Status.** Being removed pair-by-pair as the BE lands real values. The mock files (`src/lib/screener/mock/`) carry `TODO(real-data)` markers pointing at the target endpoints.

### 3.15 No screener auth (yet)

**Decision.** Screener endpoints are unauthenticated on the backend. The Next.js cabinet wraps the screener pages in `<ProtectedRoute>` for UX consistency, but there is no backend authorization check.

**Why.** Everything the screener serves is **public market data**. There's nothing to protect. Adding auth would impose latency and operational burden on a no-value boundary.

**When this changes.** When we add user-specific features (alerts, favorites, position-aware overlays), per-user state needs auth. The first such feature is the trigger to add it — we don't pre-build the auth layer.

---

## 4. Frontend deep-dive

### 4.1 Stack

- **Next.js 16** with the **app router**. All screener pages live under `src/app/myCabinet/screener/`.
- **React 18**, **TypeScript**, **Tailwind CSS**, **Zustand 5**.
- **lightweight-charts 5** for candles and indicator panes.
- **EventSource** (browser-native) for SSE consumption.

### 4.2 Directory layout

```
src/
  app/
    myCabinet/screener/                       # routed pages
      page.tsx                                  # dashboard
      terminal/[assetId]/page.tsx               # per-pair terminal
    screener-proxy/[...path]/route.ts         # same-origin reverse proxy
    components/Screener/                      # presentational components
      AssetsTable.tsx
      MasterChart.tsx                         # all chart panes + heatmap
      TradesFeed.tsx
      TableRow.tsx
      ...
  store/Screener/
    useScreenerStore.ts                       # dashboard (Zustand)
    useTerminalStore.ts                       # per-chart (Zustand + persist)
  api/Screener/
    client.ts                                 # REST: /dashboard
    streams.ts                                # SSE helpers
    getBinanceKlines.ts                       # legacy direct calls
    getBinanceIndicators.ts                   # legacy direct calls
  lib/screener/
    types.ts                                  # canonical types (source of truth)
    mock/                                     # deprecated; see §3.14
```

### 4.3 Data flow

1. **Dashboard mount.** `useScreenerStore` calls `getDashboard()` once for the initial snapshot, then opens the SSE stream and deep-merges patches as they arrive.
2. **Terminal mount.** `useTerminalStore` fetches the initial ~1500 candles, opens `/stream/chart/:pair?tf=…` for live `tick` / `bar_close` events, and lazily fetches OI / funding / CVD indicator series in parallel.
3. **Scroll-back.** When the user scrolls past the loaded bars, the terminal fetches older history via `/chart/:pair/history?before=…&tf=…` and re-aggregates the indicator series at the same tf granularity.
4. **Component reads.** Components subscribe to slices of the stores via Zustand selectors. Re-renders are limited to the slice that changed.

### 4.4 Persisted UI state

The terminal store persists `indicators` (which panes are visible), `heatmapVisible`, and timeframe selection to localStorage under the key `pantheon-terminal-v1`. Column widths in the dashboard table are persisted separately. **No live data is persisted** — only user preferences. Page reloads always fetch a fresh snapshot.

### 4.5 Error handling philosophy

The current strategy is "fail quiet, never block render." Failed fetches swallow errors and leave the affected pane empty. This is a known limitation tracked in [`screener-known-issues.md`](./screener-known-issues.md); the long-term plan is to surface upstream health via the BE's `/health` and degrade specific panes visibly when their data is stale.

---

## 5. Backend deep-dive (screener-service)

### 5.1 Stack

- **Node 22 LTS** + **TypeScript 5.6** (matches the FE for shared type vocabulary).
- **Fastify v5** as the HTTP framework — chosen for its async-first design and clean SSE support via `reply.raw.hijack()`.
- **`ws` v8** for upstream WebSocket clients, wrapped in a custom reconnect layer.
- **`pg` v8** for Postgres.
- **Pino** for structured JSON logs.
- **Zod** for env validation — fail fast at boot if config is wrong.

No ORM, no DI container, no codegen. Total ~5800 LOC across ~50 modules.

### 5.2 Layer responsibilities

#### Upstream (`src/upstream/`)

Owns all knowledge of Binance and Coinank wire formats and connection semantics. Modules:

- `binance.ts` — ticker / markPrice / forceOrder WS streams.
- `binance-oi.ts` — REST pollers for `/openInterest` (30 s) and `/openInterestHist` (5 min).
- `binance-cvd-hist.ts` — REST poller for klines used to compute the dashboard's CVD columns.
- `exchange-info.ts` — REST cache (6 h) for the pair universe and tick sizes.
- `coinank.ts` — alternative liquidation source (currently quiet; default is Binance `forceOrder`).
- `reconnect.ts` — generic exponential-backoff reconnect wrapper around `ws`.
- `large-trade-detector.ts` — the EMA filter described in §3.5.

Each WS source registers itself with a health contributor so `/health` knows when frames last arrived.

#### State (`src/state/`)

Exchange-agnostic in-memory aggregations:

- `dashboard.ts` — the canonical per-pair record (close, OI in USD, funding, CVD references, etc.). Emits patch events.
- `liquidations.ts` — the 48 h / 2 000-event ring buffer per pair.
- `large-trades.ts` — sparse ring for detected significant trades.
- `funding.ts` — latest funding only (history is fetched on demand from upstream).
- `liquidations-bars.ts`, `oi-bars.ts` — on-demand bar aggregation for chart panes.
- `trades-subscription-manager.ts` — ref-count + linger logic for §3.4.

#### Fanout (`src/fanout/sse.ts`)

A simple per-channel broker. Channels are named:

- `dashboard`
- `chart:PAIR:TF`
- `trades:PAIR`
- `liquidations:PAIR`

Each channel maintains a `Set<ServerResponse>` of subscribers. Patches arrive from `state/`, get JSON-serialized once, and are written to every subscriber. The dashboard channel additionally coalesces (§3.10).

#### Routes (`src/app.ts`, route modules)

Thin glue. Each route handler resolves the relevant snapshot from `state/`, writes the initial payload, then attaches the response to the appropriate fanout channel. CORS headers are written explicitly inside SSE handlers because `reply.hijack()` bypasses Fastify's hook chain.

### 5.3 Persistence

See §3.6 and §3.7. The schema lives in `src/db/schema.ts`; migrations are applied at boot. Three tables:

| Table | Purpose |
|---|---|
| `liquidations` | Cold history; PK `(ts, pair, exchange, side, price)`; index on `(pair, ts DESC)`. |
| `trades` | Detected large trades (cold). |
| `pair_indicators` | Per-pair cached rolls — OI refs, CVD refs, 1 h liq turnover — used to warm `/dashboard` on a cold start before live updates arrive. |

Retention sweep runs hourly; rows older than `LIQUIDATIONS_RETENTION_DAYS` (default 60) are deleted.

### 5.4 Health and observability

`GET /health` returns:

- Liveness (`status: "ok" | "degraded"`), uptime, RSS.
- SSE client count.
- Per-upstream `last_msg_ms_ago`. If any of them exceeds 30 s, status flips to `degraded` and HTTP returns 503 (so platform health checks can restart the process).
- DB row counts and size.
- Active large-trade pair subscription count.

Logs are structured JSON via Pino with stable `code` fields (`WS_RECONNECT`, `SNAPSHOT_TICK_FAILED`, `BINANCE_TICKER_BAD_PAYLOAD`, …) so filtering and alerting can key off the code, not the message.

### 5.5 Configuration

All via env vars, validated by Zod at boot. The important ones:

- `DATABASE_URL` — Postgres connection (required at runtime).
- `PORT` — default 4000.
- `LIQUIDATION_SOURCE` — `binance` (default) or `coinank`.
- `LARGE_TRADE_EMA_ALPHA`, `LARGE_TRADE_EMA_MULTIPLIER`, `LARGE_TRADE_MIN_NOTIONAL_USD` — detector knobs.
- `SNAPSHOT_INTERVAL_MS` — default 60 000.
- `LIQUIDATIONS_RING_HOURS`, `LIQUIDATIONS_RETENTION_DAYS` — memory and DB windows.
- `*_MOCK` flags — synthesize data offline for local dev when the network is unreachable.

### 5.6 Deployment

One container, `node:22-alpine`, runs via `tsx`. Target hosts: Railway, Render, Fly.io. Health check hits `/health` every 30 s; three failures restart the process. Cost target <$10/month, currently met.

There is **no horizontal scaling**. If we hit a scaling wall, the order of escalation is:

1. Vertical scale (more CPU / RAM on the same instance).
2. Move SSE fanout behind a CDN edge function while keeping the aggregator single-instance.
3. Introduce Redis and run two instances (this is the moment the §3.1 simplicity tax expires).

---

## 6. Cross-cutting concerns

### 6.1 Type sharing

The canonical types live in `PhanteonNext/src/lib/screener/types.ts` (`DashboardEntry`, `Candle`, `TradeEvent`, etc.). The backend mirrors these by hand — there is no shared package. This is a deliberate choice: a monorepo or shared package would couple deploy cycles between two repos that otherwise stay independent. The contract is small enough that hand-mirroring + the contract doc ([`screener-contract.md`](./screener-contract.md)) is cheaper than the tooling overhead of a shared package.

When the FE/BE drift on a field name or shape, the symptom is usually a runtime `undefined` in the FE store — caught quickly in dev. We accept this tradeoff.

### 6.2 Pair universe

The pair list is the **6 h-cached `exchangeInfo` result on the backend**, filtered to `contractType === 'PERPETUAL' && status === 'TRADING' && quoteAsset === 'USDT'`. The FE consumes this via `GET /pairs` and never refreshes within a session. New Binance listings appear in the screener after a page reload (or, at most, 6 h after the BE picks them up).

### 6.3 Time

All timestamps are **Unix milliseconds (numbers)**, end to end. The frontend converts to seconds only at the lightweight-charts boundary because that library uses seconds for its time axis. No `Date` objects cross any network boundary.

### 6.4 Precision and formatting

`tickSize` and `precision` from `exchangeInfo` ride alongside every `DashboardEntry` so the FE can format prices correctly per pair without hard-coding decimals. The BE never formats prices — that's a presentation concern.

### 6.5 Failure modes and recovery

| Failure | Recovery |
|---|---|
| Binance WS disconnect | `reconnect.ts` exponential backoff, 1 s → 30 s cap; backoff resets after 5 min healthy. |
| Binance silently drops frames | `/health` flips to 503 after 30 s of no frames; platform restarts the process. |
| Postgres unavailable at boot | Process exits; platform restarts. (No degraded-mode boot — we'd rather fail loud.) |
| Postgres unavailable mid-run | Snapshot tick fails; next tick retries. In-memory state continues; rings absorb the gap up to their window. |
| Service crash | Up to 60 s of in-memory data may be lost. Rings re-hydrate from Postgres on the next boot. |
| FE → BE SSE drop | Browser `EventSource` auto-reconnects. Dashboard re-syncs via the next snapshot push. |
| Browser tab backgrounded | SSE stays open; browser may throttle render but data continues to arrive. |

---

## 7. What's deliberately out of scope

Listed here so that "why isn't there X" gets answered without spelunking:

- **Order placement.** The screener observes; it doesn't trade. Order plumbing lives in other cabinet modules.
- **L2 order books / depth charts.** Out of scope for v1.
- **On-chain events.** Out of scope; would require an entirely different ingestion stack.
- **Drawings, pattern recognition, multi-pair comparison overlays.** TradingView-CL features we explicitly declined to take on.
- **Per-user state on the backend.** No favorites, no saved layouts on the server. Local-only via Zustand `persist`.
- **Multi-exchange.** Binance only at present. The upstream layer is structured to admit a Bybit sibling, but we're not building it yet — see priority (4) in §1.
- **HA / multi-instance.** Single-process, single-instance. See §3.1.

---

## 8. Where to look next

- **API shapes:** [`screener-contract.md`](./screener-contract.md).
- **Migration history (FE direct-Binance → BE):** [`screener-integration-plan.md`](./screener-integration-plan.md).
- **Known limitations and TODOs:** [`screener-known-issues.md`](./screener-known-issues.md).
- **Scaling rules and "when to add X":** [`screener-lightweight-limits.md`](./screener-lightweight-limits.md).
- **Source of truth for FE types:** `src/lib/screener/types.ts`.
- **Backend entry point:** `screener-service/src/index.ts` → `app.ts`.
- **Reconnect wrapper:** `screener-service/src/upstream/reconnect.ts`.
- **EMA detector:** `screener-service/src/upstream/large-trade-detector.ts`.
- **SSE broker:** `screener-service/src/fanout/sse.ts`.
- **Snapshot task:** `screener-service/src/snapshot/index.ts`.
