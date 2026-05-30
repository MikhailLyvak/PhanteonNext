import { create } from 'zustand'

export type SortKey =
	| 'pair'
	| 'price'
	| 'oi_1h'
	| 'oi_4h'
	| 'oi_24h'
	| 'cvd_1h'
	| 'cvd_4h'
	| 'liq_total_1h'
	| 'funding'

export type SortDir = 'asc' | 'desc'

export type Preset = 'all' | 'oi_spike' | 'negative_funding'

interface ScreenerState {
	searchTerm: string
	sortKey: SortKey
	sortDir: SortDir
	preset: Preset
	setSearchTerm: (s: string) => void
	setSort: (key: SortKey) => void
	setPreset: (p: Preset) => void
}

export const useScreenerStore = create<ScreenerState>(set => ({
	searchTerm: '',
	sortKey: 'pair',
	sortDir: 'asc',
	preset: 'all',
	setSearchTerm: searchTerm => set({ searchTerm }),
	setPreset: preset => set({ preset }),
	setSort: key =>
		set(state => {
			if (state.sortKey === key) {
				return { sortDir: state.sortDir === 'asc' ? 'desc' : 'asc' }
			}
			return { sortKey: key, sortDir: 'desc' }
		}),
}))
