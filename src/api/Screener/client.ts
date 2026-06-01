import type {
	AssetPair,
	ChartHistoryResponse,
	DashboardSnapshot,
	ScreenerHealth,
	Timeframe,
} from '@/lib/screener/types'

const BASE = '/api/screener'

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

export function getHealth(): Promise<ScreenerHealth> {
	return request<ScreenerHealth>('/health')
}

export function getPairs(): Promise<AssetPair[]> {
	return request<AssetPair[]>('/pairs')
}

export function getDashboard(): Promise<DashboardSnapshot> {
	return request<DashboardSnapshot>('/dashboard')
}

export function getChartHistory(
	pair: string,
	params: { before: number; tf: Timeframe; limit?: number },
): Promise<ChartHistoryResponse> {
	const q = new URLSearchParams({
		before: String(params.before),
		tf: params.tf,
	})
	if (params.limit !== undefined) q.set('limit', String(params.limit))
	return request<ChartHistoryResponse>(`/chart/${encodeURIComponent(pair)}/history?${q.toString()}`)
}
