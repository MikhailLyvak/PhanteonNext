import type {
	DashboardUpdateMessage,
	TradeEvent,
} from '@/lib/screener/types'

const BASE = '/screener-proxy'

export type SseHandlers<T> = {
	onEvent: (data: T) => void
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
