import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Timeframe } from '@/lib/screener/types'

export type IndicatorKey = 'volume' | 'cvd' | 'liq' | 'funding' | 'oi'

export const INDICATOR_ORDER: IndicatorKey[] = ['volume', 'cvd', 'liq', 'funding', 'oi']

export const INDICATOR_LABELS: Record<IndicatorKey, string> = {
	volume: 'Volume',
	cvd: 'CVD',
	liq: 'Liq',
	funding: 'Funding',
	oi: 'OI',
}

interface TerminalState {
	timeframe: Timeframe
	heatmapVisible: boolean
	indicators: Record<IndicatorKey, boolean>
	setTimeframe: (tf: Timeframe) => void
	toggleHeatmap: () => void
	setHeatmapVisible: (v: boolean) => void
	toggleIndicator: (key: IndicatorKey) => void
}

const DEFAULT_INDICATORS: Record<IndicatorKey, boolean> = {
	volume: true,
	cvd: true,
	liq: true,
	funding: true,
	oi: true,
}

export const useTerminalStore = create<TerminalState>()(
	persist(
		set => ({
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
