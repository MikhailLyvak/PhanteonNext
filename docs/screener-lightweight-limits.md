# Screener — Lightweight Architecture Limits

Companion to `screener-contract.md` and `screener-known-issues.md`.

This document defines the **operational ceiling** of the lightweight backend we are building for the screener (one Node.js process + SQLite, no Kafka / Redis / Timescale / microservices). It exists so future architecture decisions can be measured against concrete numbers instead of vibes.

The rule we operate by: **do not upgrade until a measured signal crosses a threshold below.** Premature scaling work is the second-most-common way this codebase wastes time, after silent error swallowing.

---

## The architecture this doc describes

```
┌──────────────────────────────────────────────────────────────┐
│              Single Node.js service (collector + API)         │
│                                                                │
│   Upstream WS                Logic                  Downstream │
│   ────────────────           ─────────              ────────── │
│   Binance aggTrade      →    EMA detector      →    REST       │
│   Binance markPrice     →    footprint agg     →    SSE        │
│   Binance ticker        →    CVD                                │
│   Coinank forceOrder    →    24–48h ring buffers                │
│                                                                │
│   In-memory state (Maps)   +   SQLite (WAL) for history       │
└──────────────────────────────────────────────────────────────┘
                                ↓
        Next.js rewrites /api/screener/* → this service
```

- One process, one host, one SQLite file.
- No message broker, no separate cache, no separate DB process.
- Next.js front-end consumes via SSE + REST through same-origin rewrites.

The features this carries:
- Real liquidations (Coinank WS) — bars on chart + right-side feed
- Large trades (Binance aggTrade) — right-side feed
- Footprints / CVD (same Binance aggTrade) — chart heatmap + indicator pane
- Open interest, funding (Binance markPrice / fundingRate streams)
- Dashboard tickers (Binance !ticker@arr)

---

## Concrete capacity numbers

### 1. Upstream event throughput

| Source | Typical | Peak (volatility / cascade) |
| --- | --- | --- |
| Binance `aggTrade` (~400 USDT perps, multiplex) | 3–8k events/s | 30–50k events/s |
| Coinank `liqOrder@All@All@1m` | 10–100/s | 1000+/s during a cascade |
| Binance `markPrice@arr@1s` | ~400/s | flat |
| Binance `!ticker@arr` | ~400/s | flat |
| **Aggregate ingest** | **~5–10k/s** | **~50k/s** |

**Process throughput**: a modern CPU core parses JSON + dispatches at >100k events/s. **Ingest is not the bottleneck** at these volumes.

### 2. Memory

| Component | Footprint |
| --- | --- |
| Footprint state in memory `Map<pair, Map<candleTime, Map<price, {b,s}>>>` — ~60 candles × 400 pairs × ~50 levels × ~30B | ~36 MB |
| Liquidations ring buffer (48h × 400 pairs × ~20 events/h × ~200B) | ~150 MB |
| Large trades ring buffer (last 100 events × 400 pairs × ~200B) | ~8 MB |
| Per-pair EMA states, CVD running totals, last tickers | ~10 MB |
| SSE open connections (~50 KB per client incl. backpressure buffer) | 50 KB × N clients |
| **Process baseline at 0 clients** | **~200–250 MB** |
| **At 1 000 concurrent SSE clients** | **~300 MB** |
| **At 5 000 concurrent SSE clients** | **~500 MB** |

**Realistic ceiling for one process: ~800 MB RAM.** That's where a 1 GB VPS starts swapping and a 2 GB VPS still has headroom.

### 3. SQLite (history)

| Metric | Comfortable | Pushing it |
| --- | --- | --- |
| Write rate (WAL + batched transactions) | 10–30k inserts/s | beyond ~50k/s use Postgres |
| Total DB size before query slowdown | 5–10 GB with right indexes | 50 GB doable, 100 GB+ is Postgres territory |
| Concurrency | single writer, many readers (our exact case) | multi-writer = use Postgres |
| Liquidation history depth at our event rate | **30–60 days** | **90 days is the soft ceiling** |

### 4. SSE fan-out to browser clients

| Hardware | Concurrent active clients |
| --- | --- |
| 1 vCPU / 2 GB RAM VPS | 5 000–8 000 |
| 4 vCPU / 8 GB RAM | ~15–20 000 |
| Beyond that | multiple Node processes + Redis pub/sub for sync (no longer "lightweight") |

"Active" here means an open terminal or open dashboard tab actually receiving live events.

### 5. Binance per-IP WebSocket limits

- Binance Futures public WS: **300 connections per IP per 5 minutes**, up to **200 streams per multiplexed connection**.
- What we need: 1 for `aggTrade`, 1 for `markPrice`, 1 for `!ticker@arr` (+ 1 Coinank). **Total: 4.**
- Headroom: **75× the connection limit, 200× the stream limit.** Not a constraint in any foreseeable scenario.

---

## Upgrade triggers

Sorted by likelihood of being hit. Each names the specific signal and the minimum change required.

### A. >3 000 concurrent active SSE clients (most likely to bite eventually)

**Signal**: peak concurrent SSE connection count grows past 3 000 sustained, or RAM crosses 600 MB during peaks.

**Why this is the real wall**: SSE fan-out load scales linearly with users, and a single Node process keeps everything in one event loop. Past this point each new connection competes with all the others for CPU.

**Upgrade path**:
1. Split the service into `collector` (holds upstream WS, maintains state) and `api` (handles HTTP/SSE).
2. Introduce **Redis pub/sub** for collector→api fan-out. This is the first moment Redis earns its keep.
3. Run multiple `api` replicas behind a load balancer.

This stays small (~3 containers), but it's the end of "single process" simplicity.

### B. Users want >90 days of liquidation / footprint history

**Signal**: customer requests, or product decision to expose multi-month liquidation analytics.

**Upgrade path**: replace SQLite with **Postgres + TimescaleDB extension**. The schema is unchanged; only the connection string and a few SQL dialect tweaks differ. One-day migration. Don't do it sooner — SQLite genuinely handles 30–60 days at our event rate.

### C. Service crash causes visible UX degradation

**Signal**: business stakeholders or users flag missing data after restarts.

**Upgrade path** — do these *immediately*, they are not real architecture changes:
1. systemd / Docker auto-restart on crash.
2. SQLite snapshot of in-memory state every 60 s (so a restart loses ≤1 minute of accumulated buffer).
3. Health check endpoint + Telegram / Sentry alert on crash.

Only if a hard uptime SLA appears later: add a passive standby instance, automate failover. Don't do this proactively.

### D. Multi-region deploy required (US users on US server, EU on EU)

**Signal**: clear regional latency complaints or a regulatory requirement.

**Upgrade path**: this is a full re-architecture, not a tweak. Postgres with replication, sticky-session routing, cross-region pub/sub. Months of work. **Not on the roadmap.** Document it as a future-only concern.

### E. Upstream APIs change or close

**Signal**: Coinank starts rate-limiting or rejecting unauthenticated WS; Binance changes message schema.

**Upgrade path**: not architectural. Either swap the upstream (Coinglass paid API at $30–$299/month), refresh the parser, or fall back to direct Binance `!forceOrder@arr`. Operational risk, not a design problem.

---

## Do-not-do list (for this iteration)

| Don't add | Why not |
| --- | --- |
| **Kafka** | Solves scale problems we will not hit for at least a year. Adds 3 containers, a JVM, operational overhead. |
| **Redis as primary storage** | An in-memory `Map` in the Node process is the same thing for free. Redis only earns its keep when you have multiple processes (see Trigger A). |
| **Bytewax / Quix Streams / any stream framework** | Our transformations (EMA, tick-level aggregation, CVD) are 50–100 lines of plain JS. A framework adds more abstraction than it saves. |
| **TimescaleDB / Postgres before measured pain** | SQLite WAL handles 30–60 days at our rate. Postgres = another container, migrations, backups, monitoring. Defer. |
| **One process per metric** (the panscreen pattern of `trades_processor` / `liq_processor` / `general_processor`) | At our volumes everything runs in one Node process using single-digit % of one CPU core. Splitting = more RAM, IPC, more failure modes. |
| **Microservices** | One service, one deploy, one log stream until we exceed Trigger A. |
| **Custom binary protocols** | JSON parsing is a fraction of a % of CPU at these volumes. Optimizing for its own sake. |
| **HA / clustering proactively** | Establish the SLA need first, then design to it. Pre-building HA without a stated requirement guarantees overdesign. |
| **Per-pair config tables for thresholds, intervals, etc.** | Adaptive computation (EMA-based "large trade" detection, derived OI windows) self-tunes. Per-pair config is a maintenance burden that outlives whoever wrote it. |

---

## Trigger summary table

The concrete numbers to watch. When a signal column crosses its threshold *sustainably* (not a spike), start designing the corresponding upgrade.

| Metric | Current ceiling | Upgrade signal | Next step |
| --- | --- | --- | --- |
| Concurrent active SSE clients | ~5 000 | >3 000 in peak | Trigger A — split collector/api + Redis pub/sub |
| Process RAM | ~800 MB | >600 MB sustained | Trigger A |
| Liquidation history depth | 30–60 days | users ask for 90+ | Trigger B — SQLite → Postgres+Timescale |
| SSE fan-out latency p99 | <100 ms | >500 ms | Trigger A |
| Collector CPU (single core) | ~20–30 % | >70 % sustained | Trigger A |
| Uptime requirement | best-effort | hard SLA appears | Trigger C — standby + failover |
| Geographic latency complaints | none | structural pattern | Trigger D — multi-region re-architecture |

Below all of these: **one process, one SQLite file, one deployment**. That is the deal.

---

## Implementation note

When implementing, treat the limits above as boundary tests. Specifically:

- Cap in-memory ring buffers (liquidations 48 h, large trades last 100, footprints 60 candles) explicitly. Do not let them grow unbounded "just in case".
- Snapshot to SQLite every 60 s so a process restart loses at most 60 s of accumulated state.
- Expose `/health` returning current SSE client count + process RSS — these are the two numbers worth watching.
- Wrap every fetch / WS handler in a real error path (Sentry breadcrumb, log line). The current "silent catch" pattern (see `screener-known-issues.md` §5) is the single biggest blocker to recognising any of the upgrade signals above when they happen.
