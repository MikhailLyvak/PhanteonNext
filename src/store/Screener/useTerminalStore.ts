import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import {
	Candle,
	ChartInitPayload,
	CvdPoint,
	FootprintFrame,
	FundingBar,
	LiquidationBar,
	OIPoint,
	TickPayload,
	Timeframe,
} from '@/lib/screener/types'
import { openChartStream } from '@/api/Screener/streams'
import { getChartHistory } from '@/api/Screener/client'

export type IndicatorKey = 'volume' | 'cvd' | 'liq' | 'funding' | 'oi'

export const INDICATOR_ORDER: IndicatorKey[] = ['volume', 'cvd', 'funding', 'liq', 'oi']

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
	oi: OIPoint[]

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
	oi: [] as OIPoint[],
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
	// Older arrives sorted ascending by time per contract; if not, sort defensively.
	filtered.sort((a, b) => a.time - b.time)
	return [...filtered, ...existing]
}

export const useTerminalStore = create<TerminalState>()(
	subscribeWithSelector(
		persist(
			(set, get) => ({
				timeframe: '15m',
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

					const applyInit = (p: ChartInitPayload) => {
						set({
							currentPair: pair,
							loading: false,
							candles: p.candles,
							footprints: p.footprints,
							cvd: p.cvd,
							liquidations: p.liquidations,
							funding: p.funding,
							oi: p.oi,
						})
					}

					const applyTick = (t: TickPayload) => {
						// Only apply if we still own this pair (avoid races on rapid resubscribe).
						if (get().currentPair !== pair) return
						const s = get()
						const patch: Partial<TerminalState> = {}
						if (t.candle) patch.candles = upsertLastByTime(s.candles, t.candle)
						if (t.footprint) patch.footprints = upsertLastByTime(s.footprints, t.footprint)
						if (t.cvd) patch.cvd = upsertLastByTime(s.cvd, t.cvd)
						if (t.liquidations) patch.liquidations = upsertLastByTime(s.liquidations, t.liquidations)
						if (t.funding) patch.funding = upsertLastByTime(s.funding, t.funding)
						if (t.oi) patch.oi = upsertLastByTime(s.oi, t.oi)
						if (Object.keys(patch).length > 0) set(patch)
					}

					const unsubscribe = openChartStream(pair, tf, {
						onInit: applyInit,
						onTick: applyTick,
						onBarClose: applyTick,
						onError: () => {
							// EventSource auto-reconnects — surface nothing transient.
						},
					})

					return () => {
						unsubscribe()
						// Reset if no resubscribe has happened in between (handled by next subscribe call).
						if (get().currentPair === pair) {
							set({ ...EMPTY_DATA })
						}
					}
				},

				loadOlder: async (before, tf, limit = 500) => {
					const pair = get().currentPair
					if (!pair) return
					const res = await getChartHistory(pair, { before, tf, limit })
					// Bail if pair changed mid-flight.
					if (get().currentPair !== pair) return
					const s = get()
					set({
						candles: dedupeAndPrepend(res.candles, s.candles),
						footprints: dedupeAndPrepend(res.footprints, s.footprints),
					})
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
