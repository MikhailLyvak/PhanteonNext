import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import {
	Candle,
	CvdPoint,
	FootprintFrame,
	FundingBar,
	LiquidationBar,
	OIPoint,
	Timeframe,
} from '@/lib/screener/types'
import { fetchKlines } from '@/api/Screener/getBinanceKlines'
import {
	IndicatorPeriod,
	aggregateFunding,
	aggregateOI,
	computeCVDFromCandles,
	fetchFundingHistory,
	fetchOIHistory,
	pickOIPeriod,
} from '@/api/Screener/getBinanceIndicators'

const LIVE_TAIL_INTERVAL_MS = 1000

export type IndicatorKey = 'volume' | 'cvd' | 'liq' | 'funding' | 'oi'

// `liq` is intentionally excluded from the visible toggle row for now — the
// liquidations stream is not yet reliable enough to surface. The full pipeline
// (types, store slice, chart pane) is left in place for easy re-enable.
export const INDICATOR_ORDER: IndicatorKey[] = ['volume', 'cvd', 'funding', 'oi']

export const INDICATOR_LABELS: Record<IndicatorKey, string> = {
	volume: 'Volume',
	cvd: 'CVD',
	liq: 'Liq',
	funding: 'Funding',
	oi: 'OI',
}

interface TerminalState {
	// UI / persisted state
	timeframe: Timeframe
	heatmapVisible: boolean
	indicators: Record<IndicatorKey, boolean>
	setTimeframe: (tf: Timeframe) => void
	toggleHeatmap: () => void
	setHeatmapVisible: (v: boolean) => void
	toggleIndicator: (key: IndicatorKey) => void

	// Chart data slice (not persisted)
	currentPair: string | null
	loading: boolean
	candles: Candle[]
	footprints: FootprintFrame[]
	cvd: CvdPoint[]
	liquidations: LiquidationBar[]
	funding: FundingBar[]
	// Raw funding events (every 8h, sparse). Kept alongside the aggregated
	// `funding` series so scroll-back can extend backward and re-aggregate the
	// forward-filled bars over the wider candle window.
	fundingRaw: FundingBar[]
	oi: OIPoint[]
	// Binance OI period chosen at init based on the candle window. Kept so
	// scroll-back can fetch older OI with the same resolution.
	oiPeriod: IndicatorPeriod | null

	subscribe: (pair: string, tf: Timeframe) => () => void
	loadOlder: (before: number, tf: Timeframe, limit?: number) => Promise<void>
	clear: () => void
}

const DEFAULT_INDICATORS: Record<IndicatorKey, boolean> = {
	volume: true,
	cvd: true,
	liq: true,
	funding: true,
	oi: true,
}

const EMPTY_DATA = {
	currentPair: null as string | null,
	loading: false,
	candles: [] as Candle[],
	footprints: [] as FootprintFrame[],
	cvd: [] as CvdPoint[],
	liquidations: [] as LiquidationBar[],
	funding: [] as FundingBar[],
	fundingRaw: [] as FundingBar[],
	oi: [] as OIPoint[],
	oiPeriod: null as IndicatorPeriod | null,
}

// Generic helper: update the last element of `series` if `incoming.time` matches
// the last bucket; otherwise append a new bucket. If `incoming.time` is older
// than the last bucket, drop it (out-of-order tick).
function upsertLastByTime<T extends { time: number }>(series: T[], incoming: T): T[] {
	if (series.length === 0) return [incoming]
	const last = series[series.length - 1]
	if (incoming.time === last.time) {
		const next = series.slice(0, -1)
		next.push(incoming)
		return next
	}
	if (incoming.time > last.time) {
		return [...series, incoming]
	}
	return series
}

function dedupeAndPrepend<T extends { time: number }>(older: T[], existing: T[]): T[] {
	if (older.length === 0) return existing
	const seen = new Set(existing.map(e => e.time))
	const filtered = older.filter(o => !seen.has(o.time))
	if (filtered.length === 0) return existing
	filtered.sort((a, b) => a.time - b.time)
	return [...filtered, ...existing]
}

export const useTerminalStore = create<TerminalState>()(
	subscribeWithSelector(
		persist(
			(set, get) => ({
				timeframe: '1h',
				heatmapVisible: true,
				indicators: DEFAULT_INDICATORS,
				setTimeframe: timeframe => set({ timeframe }),
				toggleHeatmap: () => set(s => ({ heatmapVisible: !s.heatmapVisible })),
				setHeatmapVisible: heatmapVisible => set({ heatmapVisible }),
				toggleIndicator: key =>
					set(s => ({
						indicators: { ...s.indicators, [key]: !s.indicators[key] },
					})),

				...EMPTY_DATA,

				subscribe: (pair, tf) => {
					set({ ...EMPTY_DATA, currentPair: pair, loading: true })

					let cancelled = false
					let pollInterval: ReturnType<typeof setInterval> | null = null

					;(async () => {
						try {
							// 1. Most-recent batch only (~1 Binance call, ~300ms). The chart
							//    appears immediately; older history is pulled on scroll-back
							//    via loadOlder, indicators arrive in step 3 below without
							//    blocking the first paint.
							const candles = await fetchKlines(pair, tf, 1500)
							if (cancelled || get().currentPair !== pair) return
							set({
								currentPair: pair,
								loading: false,
								candles,
								footprints: [],
								cvd: computeCVDFromCandles(candles),
								liquidations: [],
								funding: [],
								oi: [],
							})

							// 2. Live tail: poll the last 2 klines every 1s and upsert.
							//    Started only after init so the polled bar can never land
							//    before the historical window does.
							pollInterval = setInterval(async () => {
								if (cancelled || get().currentPair !== pair) return
								try {
									const tail = await fetchKlines(pair, tf, 2)
									if (cancelled || get().currentPair !== pair) return
									const s = get()
									let next = s.candles
									for (const c of tail) {
										next = upsertLastByTime(next, c)
									}
									if (next === s.candles) return
									const update: Partial<TerminalState> = {
										candles: next,
										cvd: computeCVDFromCandles(next),
									}
									// Forward-fill funding into freshly opened candle slots so
									// the histogram keeps painting columns past the last raw
									// funding event (which only arrives every 8h).
									if (s.funding.length > 0) {
										const last = s.funding[s.funding.length - 1]
										const newestCandleTime = next[next.length - 1].time
										if (newestCandleTime > last.time) {
											update.funding = [
												...s.funding,
												{ time: newestCandleTime, value: last.value },
											]
										}
									}
									set(update)
								} catch {
									// Transient Binance error — next interval retries.
								}
							}, LIVE_TAIL_INTERVAL_MS)

							// 3. Indicators in parallel; each failure swallowed → keeps empty.
							//    Liquidations are not fetched — Binance public API only exposes
							//    taker buy/sell ratio (a misleading proxy), not real liquidation flow.
							//    OI period is picked to cover the candle window in a single
							//    500-row request, since Binance caps `limit` at 500.
							const candleWindowSec =
								candles.length > 1 ? candles[candles.length - 1].time - candles[0].time : 0
							const oiPeriod = pickOIPeriod(candleWindowSec)
							const [oiRes, fundingRes] = await Promise.all([
								fetchOIHistory(pair, oiPeriod, 500).catch(() => [] as OIPoint[]),
								fetchFundingHistory(pair, 1000).catch(() => [] as FundingBar[]),
							])
							if (cancelled || get().currentPair !== pair) return
							set({
								oi: aggregateOI(oiRes, candles, tf, oiPeriod),
								funding: aggregateFunding(fundingRes, candles, tf),
								fundingRaw: fundingRes,
								oiPeriod,
							})
						} catch (err) {
							// eslint-disable-next-line no-console
							console.error('[screener] chart init failed:', err)
							if (!cancelled && get().currentPair === pair) {
								set({ loading: false })
							}
						}
					})()

					return () => {
						cancelled = true
						if (pollInterval) clearInterval(pollInterval)
						if (get().currentPair === pair) {
							set({ ...EMPTY_DATA })
						}
					}
				},

				loadOlder: async (before, tf, limit = 500) => {
					const pair = get().currentPair
					if (!pair) return

					const s = get()
					const oiPeriod = s.oiPeriod
					const earliestOiMs = s.oi.length > 0 ? s.oi[0].time * 1000 : null
					const earliestFundingMs =
						s.fundingRaw.length > 0 ? s.fundingRaw[0].time * 1000 : null

					// Fetch older candles, older OI (when we have a known period), and
					// older raw funding events in parallel so scroll-back latency is
					// max(fetch), not sum.
					const candlesPromise = fetchKlines(pair, tf, limit, {
						endTime: before * 1000 - 1,
					})
					const oiPromise: Promise<OIPoint[]> =
						oiPeriod && earliestOiMs !== null
							? fetchOIHistory(pair, oiPeriod, 500, { endTime: earliestOiMs - 1 }).catch(
									() => [] as OIPoint[],
								)
							: Promise.resolve([])
					const fundingPromise: Promise<FundingBar[]> =
						earliestFundingMs !== null
							? fetchFundingHistory(pair, 1000, undefined, earliestFundingMs - 1).catch(
									() => [] as FundingBar[],
								)
							: Promise.resolve([])
					const [olderCandles, olderOi, olderFunding] = await Promise.all([
						candlesPromise,
						oiPromise,
						fundingPromise,
					])

					if (get().currentPair !== pair) return
					const sNow = get()
					const candlesMerged = dedupeAndPrepend(olderCandles, sNow.candles)
					const update: Partial<TerminalState> = {
						candles: candlesMerged,
						// Recompute CVD over the extended window so the curve is continuous.
						cvd: computeCVDFromCandles(candlesMerged),
					}
					if (olderOi.length > 0 && oiPeriod) {
						const oiMerged = dedupeAndPrepend(olderOi, sNow.oi)
						update.oi = aggregateOI(oiMerged, candlesMerged, tf, oiPeriod)
					}
					// Re-aggregate funding over the (now larger) candle window so the
					// forward-filled histogram extends across the freshly-prepended
					// bars. Merge older raw funding events when present.
					const fundingRawMerged =
						olderFunding.length > 0
							? dedupeAndPrepend(olderFunding, sNow.fundingRaw)
							: sNow.fundingRaw
					if (fundingRawMerged.length > 0) {
						update.fundingRaw = fundingRawMerged
						update.funding = aggregateFunding(fundingRawMerged, candlesMerged, tf)
					}
					set(update)
				},

				clear: () => set({ ...EMPTY_DATA }),
			}),
			{
				name: 'pantheon-terminal-v1',
				partialize: state => ({
					indicators: state.indicators,
					heatmapVisible: state.heatmapVisible,
				}),
			}
		)
	)
)
