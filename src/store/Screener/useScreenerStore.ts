import { create } from 'zustand'
import type { AssetPair, DashboardSnapshot, DashboardUpdateMessage, DeepPartial, DashboardEntry } from '@/lib/screener/types'
import { extractPairs, getDashboard } from '@/api/Screener/client'
import { openDashboardStream } from '@/api/Screener/streams'

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
	pairs: AssetPair[]
	data: DashboardSnapshot
	setSearchTerm: (s: string) => void
	setSort: (key: SortKey) => void
	setPreset: (p: Preset) => void
	setPage: (p: number) => void
	subscribe: () => () => void
}

// Deep merge `patch` into `target`. Plain objects are merged recursively; arrays
// and primitives replace. Returns a new object (does not mutate target).
function deepMerge<T>(target: T, patch: DeepPartial<T>): T {
	if (target === null || typeof target !== 'object' || Array.isArray(target)) {
		return (patch as unknown as T) ?? target
	}
	const out: Record<string, unknown> = { ...(target as Record<string, unknown>) }
	for (const key of Object.keys(patch as Record<string, unknown>)) {
		const pv = (patch as Record<string, unknown>)[key]
		const tv = out[key]
		if (pv !== null && typeof pv === 'object' && !Array.isArray(pv) && tv !== null && typeof tv === 'object' && !Array.isArray(tv)) {
			out[key] = deepMerge(tv, pv as DeepPartial<typeof tv>)
		} else {
			out[key] = pv
		}
	}
	return out as T
}

// Ref-counted shared SSE subscription. Multiple components (CryptoTicker in the
// header, AssetsTable on /screener, etc.) call subscribe() — only the first
// fetches /dashboard and opens the SSE stream; the rest piggyback on the same
// snapshot. When the last subscriber unmounts, the stream closes.
let refCount = 0
let closeShared: (() => void) | null = null

function startShared() {
	let cancelled = false
	let stream: (() => void) | null = null

	;(async () => {
		let snapshot: DashboardSnapshot
		try {
			snapshot = await getDashboard()
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error('[screener] /dashboard failed:', err)
			return
		}
		if (cancelled) return

		const pairs = extractPairs(snapshot)
		useScreenerStore.setState({ pairs, data: snapshot })

		stream = openDashboardStream({
			onEvent: (msg: DashboardUpdateMessage) => {
				const current = useScreenerStore.getState().data
				const next: DashboardSnapshot = { ...current }
				for (const u of msg.updates) {
					const existing = next[u.code]
					if (existing) {
						// Patches only touch DashboardAssetData fields; metadata (id,
						// coin, iconUrl, type) on the existing entry stays put.
						next[u.code] = deepMerge(existing, u.patch as DeepPartial<DashboardEntry>)
					}
				}
				useScreenerStore.setState({ data: next })
			},
			onError: () => {
				// EventSource auto-reconnects — transient SSE errors are not surfaced.
			},
		})
	})()

	closeShared = () => {
		cancelled = true
		if (stream) stream()
		stream = null
		closeShared = null
	}
}

export const useScreenerStore = create<ScreenerState>(set => ({
	searchTerm: '',
	sortKey: null,
	sortDir: 'desc',
	preset: 'all',
	currentPage: 1,
	pageSize: 25,
	pairs: [],
	data: {},
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
	subscribe: () => {
		refCount++
		if (refCount === 1) startShared()
		return () => {
			refCount--
			if (refCount === 0 && closeShared) closeShared()
		}
	},
}))
