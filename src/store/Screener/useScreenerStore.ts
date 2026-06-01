import { create } from 'zustand'

export type SortKey =
	| 'pair'
	| 'price'
	| 'volume24h'
	| 'oi_1h'
	| 'oi_4h'
	| 'oi_24h'
	| 'cvd_1h'
	| 'cvd_4h'
	| 'liq_total_1h'
	| 'funding'

export type SortDir = 'asc' | 'desc'

export type Preset = 'all'

interface ScreenerState {
	searchTerm: string
	sortKey: SortKey | null
	sortDir: SortDir
	preset: Preset
	currentPage: number
	pageSize: number
	setSearchTerm: (s: string) => void
	setSort: (key: SortKey) => void
	setPreset: (p: Preset) => void
	setPage: (p: number) => void
}

export const useScreenerStore = create<ScreenerState>(set => ({
	searchTerm: '',
	sortKey: null,
	sortDir: 'desc',
	preset: 'all',
	currentPage: 1,
	pageSize: 25,
	setSearchTerm: searchTerm => set({ searchTerm, currentPage: 1 }),
	setPreset: preset => set({ preset, currentPage: 1 }),
	setPage: currentPage => set({ currentPage }),
	setSort: key =>
		set(state => {
			if (state.sortKey === key) {
				if (state.sortDir === 'asc') {
					return { sortKey: null, sortDir: 'desc', currentPage: 1 }
				}
				return { sortDir: 'asc', currentPage: 1 }
			}
			return { sortKey: key, sortDir: 'desc', currentPage: 1 }
		}),
}))
