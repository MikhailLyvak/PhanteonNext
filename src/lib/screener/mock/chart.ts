import {
	Candle,
	ChartInitPayload,
	CvdPoint,
	FootprintFrame,
	FundingBar,
	LiquidationBar,
	OIPoint,
	Timeframe,
} from '../types'
import { hashString, mulberry32 } from './rng'

// Inlined from former mock/pairs.ts (scheduled for deletion in steps 4-8).
const COIN_BASE_PRICE: Record<string, number> = {
	BTC: 96500,
	ETH: 3400,
	SOL: 215,
	XRP: 2.4,
	BNB: 690,
	DOGE: 0.38,
	ADA: 1.05,
	AVAX: 42,
	TRX: 0.26,
	LINK: 22.5,
	DOT: 8.2,
	MATIC: 0.58,
	LTC: 115,
	BCH: 525,
	NEAR: 6.3,
	ARB: 0.92,
}

function getBasePrice(coin: string): number {
	return COIN_BASE_PRICE[coin] ?? 1
}

const TF_SECONDS: Record<Timeframe, number> = {
	'1m': 60,
	'5m': 300,
	'15m': 900,
	'30m': 1800,
	'1h': 3600,
	'2h': 7200,
	'4h': 14400,
	'8h': 28800,
	'12h': 43200,
	'1d': 86400,
	'1w': 604800,
	'1M': 2592000,
}

const cache = new Map<string, ChartInitPayload>()

function buildPayload(pairCode: string, tf: Timeframe): ChartInitPayload {
	const coin = pairCode.replace('USDT', '')
	const base = getBasePrice(coin)
	const rand = mulberry32(hashString(`${pairCode}|${tf}`))
	const step = TF_SECONDS[tf]
	const now = Math.floor(Date.now() / 1000)
	const alignedNow = now - (now % step)

	const N = 200
	const candles: Candle[] = []
	const footprints: FootprintFrame[] = []
	const cvdSeries: CvdPoint[] = []
	const liquidations: LiquidationBar[] = []
	const funding: FundingBar[] = []
	const oi: OIPoint[] = []

	let price = base * (0.95 + rand() * 0.1)
	let cvdAcc = 0
	let oiVal = base * 1_000_000 * (0.5 + rand() * 2)
	const tickSize = Math.max(base * 0.0005, 0.0001)

	for (let i = 0; i < N; i++) {
		const time = alignedNow - (N - 1 - i) * step
		const volatility = base * 0.005
		const open = price
		const drift = (rand() - 0.5) * volatility * 2
		const close = Math.max(0.0001, open + drift)
		const high = Math.max(open, close) + rand() * volatility
		const low = Math.min(open, close) - rand() * volatility
		const volume = base * (200 + rand() * 1500)

		const takerBuyVolume = volume * (0.4 + rand() * 0.2)
		candles.push({ time, open, high, low, close, volume, takerBuyVolume })

		const levels = 10 + Math.floor(rand() * 9)
		const data: Record<string, { b: number; s: number }> = {}
		const range = high - low
		for (let l = 0; l < levels; l++) {
			const p = low + (range * l) / Math.max(1, levels - 1)
			const key = Math.round(p / tickSize) * tickSize
			const b = rand() * volume * 0.2
			const s = rand() * volume * 0.2
			data[key.toFixed(8)] = { b, s }
		}
		footprints.push({ time, data })

		cvdAcc += (rand() - 0.5) * volume * 0.15
		cvdSeries.push({ time, value: cvdAcc })

		liquidations.push({
			time,
			buy_volume: rand() < 0.6 ? rand() * volume * 0.08 : 0,
			sell_volume: rand() < 0.6 ? rand() * volume * 0.08 : 0,
		})

		funding.push({ time, value: (rand() - 0.5) * 0.0006 })

		oiVal *= 1 + (rand() - 0.5) * 0.01
		oi.push({ time, value: oiVal })

		price = close
	}

	return { candles, footprints, cvd: cvdSeries, liquidations, funding, oi }
}

// TODO(real-data): replace with WS /ws/chart/{pair}?tf={tf} init payload + incremental updates.
export async function getChartInit(pairCode: string, tf: Timeframe): Promise<ChartInitPayload> {
	const key = `${pairCode}|${tf}`
	const cached = cache.get(key)
	if (cached) return cached
	const payload = buildPayload(pairCode, tf)
	cache.set(key, payload)
	return payload
}
