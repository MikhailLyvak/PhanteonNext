import type {
	ChartInitPayload,
	DashboardUpdateMessage,
	TickPayload,
	Timeframe,
	TradeEvent,
} from '@/lib/screener/types'

const BASE = '/api/screener'

export type SseHandlers<T> = {
	onEvent: (data: T) => void
	onError?: (e: Event) => void
}

export type ChartStreamHandlers = {
	onInit: (data: ChartInitPayload) => void
	onTick: (data: TickPayload) => void
	onBarClose: (data: TickPayload) => void
	onError?: (e: Event) => void
}

export type TradesStreamHandlers = {
	onSeed: (events: TradeEvent[]) => void
	onEvent: (event: TradeEvent) => void
	onError?: (e: Event) => void
}

function parse<T>(ev: Event): T {
	return JSON.parse((ev as MessageEvent).data) as T
}

export function openDashboardStream(h: SseHandlers<DashboardUpdateMessage>): () => void {
	const es = new EventSource(`${BASE}/stream/dashboard`)
	es.addEventListener('dashboard_update', ev => h.onEvent(parse<DashboardUpdateMessage>(ev)))
	es.onerror = h.onError ?? null
	return () => es.close()
}

export function openChartStream(pair: string, tf: Timeframe, h: ChartStreamHandlers): () => void {
	const q = new URLSearchParams({ tf })
	const es = new EventSource(`${BASE}/stream/chart/${encodeURIComponent(pair)}?${q.toString()}`)
	es.addEventListener('init', ev => h.onInit(parse<ChartInitPayload>(ev)))
	es.addEventListener('tick', ev => h.onTick(parse<TickPayload>(ev)))
	es.addEventListener('bar_close', ev => h.onBarClose(parse<TickPayload>(ev)))
	es.onerror = h.onError ?? null
	return () => es.close()
}

export function openTradesStream(pair: string, h: TradesStreamHandlers): () => void {
	const es = new EventSource(`${BASE}/stream/trades/${encodeURIComponent(pair)}`)
	es.addEventListener('seed', ev => {
		const payload = parse<{ events: TradeEvent[] }>(ev)
		h.onSeed(payload.events)
	})
	es.addEventListener('event', ev => h.onEvent(parse<TradeEvent>(ev)))
	es.onerror = h.onError ?? null
	return () => es.close()
}
