import type {
	AssetPair,
	DashboardEntry,
	DashboardSnapshot,
} from '@/lib/screener/types'

const BASE = '/screener-proxy'

export class ScreenerHttpError extends Error {
	readonly status: number
	readonly body: string

	constructor(status: number, body: string) {
		super(`screener-service ${status}: ${body || '<empty body>'}`)
		this.name = 'ScreenerHttpError'
		this.status = status
		this.body = body
	}
}

async function request<T>(path: string): Promise<T> {
	const r = await fetch(`${BASE}${path}`, { cache: 'no-store' })
	if (!r.ok) throw new ScreenerHttpError(r.status, await r.text())
	return (await r.json()) as T
}

export function getDashboard(): Promise<DashboardSnapshot> {
	return request<DashboardSnapshot>('/dashboard')
}

// Derives the AssetPair[] used by selectors / lookups from the merged
// /dashboard response. Sorted by id so the order is stable across renders.
export function extractPairs(snapshot: DashboardSnapshot): AssetPair[] {
	const out: AssetPair[] = []
	for (const code of Object.keys(snapshot)) {
		const e = snapshot[code] as DashboardEntry
		out.push({
			id: e.id,
			code,
			coin: e.coin,
			type: e.type,
			tick: e.tick,
			precision: e.precision,
			iconUrl: e.iconUrl,
		})
	}
	out.sort((a, b) => a.id - b.id)
	return out
}
