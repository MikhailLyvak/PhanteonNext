import { create } from 'zustand'
import type { AssetPair, DashboardSnapshot, DashboardUpdateMessage, DeepPartial } from '@/lib/screener/types'
import { getDashboard, getHealth, getPairs } from '@/api/Screener/client'
import { openDashboardStream } from '@/api/Screener/streams'

const HEALTH_POLL_MS = 30_000
const SILENCE_TICK_MS = 5_000
const SILENCE_THRESHOLD_MS = 15_000
const HEALTH_FAILURE_THRESHOLD = 2

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

export type HealthStatus = 'live' | 'stale' | 'disconnected'

interface ScreenerState {
	searchTerm: string
	sortKey: SortKey | null
	sortDir: SortDir
	preset: Preset
	currentPage: number
	pageSize: number
	pairs: AssetPair[]
	data: DashboardSnapshot
	healthStatus: HealthStatus
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

export const useScreenerStore = create<ScreenerState>((set, get) => ({
	searchTerm: '',
	sortKey: null,
	sortDir: 'desc',
	preset: 'all',
	currentPage: 1,
	pageSize: 25,
	pairs: [],
	data: {},
	healthStatus: 'disconnected',
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
		let cancelled = false
		let close: (() => void) | null = null
		let lastEventTs = Date.now()
		let consecutiveFailures = 0

		const handleEvent = (msg: DashboardUpdateMessage) => {
			lastEventTs = Date.now()
			const current = get().data
			const next: DashboardSnapshot = { ...current }
			for (const u of msg.updates) {
				const existing = next[u.code]
				if (existing) {
					next[u.code] = deepMerge(existing, u.patch)
				}
			}
			set({ data: next, healthStatus: 'live' })
		}

		const probeHealth = async () => {
			try {
				const h = await getHealth()
				if (cancelled) return
				if (h.status === 'degraded') {
					consecutiveFailures = 0
					set({ healthStatus: 'disconnected' })
					return
				}
				consecutiveFailures = 0
				// Only flip to 'live' if we are not currently 'stale' — the silence
				// watchdog owns the stale->live transition (which happens on next event).
				if (get().healthStatus !== 'stale') {
					set({ healthStatus: 'live' })
				}
			} catch {
				if (cancelled) return
				consecutiveFailures += 1
				if (consecutiveFailures >= HEALTH_FAILURE_THRESHOLD) {
					set({ healthStatus: 'disconnected' })
				}
			}
		}

		const healthInterval: ReturnType<typeof setInterval> = setInterval(probeHealth, HEALTH_POLL_MS)
		const silenceInterval: ReturnType<typeof setInterval> = setInterval(() => {
			if (cancelled) return
			const silentFor = Date.now() - lastEventTs
			if (silentFor > SILENCE_THRESHOLD_MS && get().healthStatus === 'live') {
				set({ healthStatus: 'stale' })
			}
		}, SILENCE_TICK_MS)

		// Fire an immediate health probe so the badge has signal before the first poll tick.
		void probeHealth()

		;(async () => {
			try {
				const [pairs, snapshot] = await Promise.all([getPairs(), getDashboard()])
				if (cancelled) return
				set({ pairs, data: snapshot })
				lastEventTs = Date.now()
				close = openDashboardStream({
					onEvent: handleEvent,
					onError: () => {
						// Chart and trades streams auto-reconnect; transient SSE errors
						// for the dashboard stream are NOT surfaced as a status change.
						// The /health poll + silence watchdog drive healthStatus.
					},
				})
			} catch (err) {
				if (!cancelled) {
					// eslint-disable-next-line no-console
					console.error('[screener] subscribe failed:', err)
				}
			}
		})()

		return () => {
			cancelled = true
			clearInterval(healthInterval)
			clearInterval(silenceInterval)
			if (close) close()
		}
	},
}))
