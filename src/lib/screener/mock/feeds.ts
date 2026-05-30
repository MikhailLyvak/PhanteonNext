import { LiquidationEvent, TradeEvent } from '../types'
import { getBasePrice } from './pairs'
import { hashString, mulberry32 } from './rng'

function seedEvents<T extends LiquidationEvent | TradeEvent>(
	pairCode: string,
	kind: 'liq' | 'trade'
): T[] {
	const coin = pairCode.replace('USDT', '')
	const base = getBasePrice(coin)
	const rand = mulberry32(hashString(`${pairCode}|seed|${kind}`))
	const now = Date.now()
	const out: T[] = []
	for (let i = 0; i < 50; i++) {
		const ts = now - i * (1500 + Math.floor(rand() * 5000))
		const price = base * (0.995 + rand() * 0.01)
		const volume = base * (5 + rand() * 200)
		const side = rand() > 0.5 ? 'buy' : 'sell'
		if (kind === 'trade') {
			out.push({
				ts,
				symbol: pairCode,
				side,
				price,
				volume,
				isLarge: true,
			} as TradeEvent as T)
		} else {
			out.push({ ts, symbol: pairCode, side, price, volume } as LiquidationEvent as T)
		}
	}
	return out
}

type LiqHandler = (evt: LiquidationEvent) => void
type TradeHandler = (evt: TradeEvent) => void

function startEmitter(
	pairCode: string,
	kind: 'liq' | 'trade',
	push: (e: LiquidationEvent | TradeEvent) => void
): () => void {
	const coin = pairCode.replace('USDT', '')
	const base = getBasePrice(coin)
	let cancelled = false
	const rand = mulberry32(hashString(`${pairCode}|live|${kind}`) ^ Date.now())

	const tick = () => {
		if (cancelled) return
		const price = base * (0.995 + rand() * 0.01)
		const volume = base * (5 + rand() * 250)
		const side: 'buy' | 'sell' = rand() > 0.5 ? 'buy' : 'sell'
		if (kind === 'trade') {
			push({ ts: Date.now(), symbol: pairCode, side, price, volume, isLarge: true })
		} else {
			push({ ts: Date.now(), symbol: pairCode, side, price, volume })
		}
		const delay = 1500 + rand() * 2500
		setTimeout(tick, delay)
	}
	const initialDelay = 1000 + rand() * 1500
	const id = setTimeout(tick, initialDelay)
	return () => {
		cancelled = true
		clearTimeout(id)
	}
}

// TODO(real-data): swap setInterval emitter for new WebSocket(WS_BASE + '/ws/liquidations-stream/' + pair).
export function subscribeLiquidations(
	pairCode: string,
	handler: LiqHandler
): { seed: LiquidationEvent[]; unsubscribe: () => void } {
	const seed = seedEvents<LiquidationEvent>(pairCode, 'liq')
	const unsubscribe = startEmitter(pairCode, 'liq', e => handler(e as LiquidationEvent))
	return { seed, unsubscribe }
}

// TODO(real-data): swap setInterval emitter for new WebSocket(WS_BASE + '/ws/trades-stream/' + pair).
export function subscribeTrades(
	pairCode: string,
	handler: TradeHandler
): { seed: TradeEvent[]; unsubscribe: () => void } {
	const seed = seedEvents<TradeEvent>(pairCode, 'trade')
	const unsubscribe = startEmitter(pairCode, 'trade', e => handler(e as TradeEvent))
	return { seed, unsubscribe }
}
