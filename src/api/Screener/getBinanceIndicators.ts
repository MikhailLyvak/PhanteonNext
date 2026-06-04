import { OIPoint, FundingBar, CvdPoint, Candle, Timeframe } from '@/lib/screener/types'

export type IndicatorPeriod = '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '12h' | '1d'

export const TF_TO_INDICATOR_PERIOD: Record<Timeframe, IndicatorPeriod> = {
	'1m': '5m',
	'5m': '5m',
	'15m': '15m',
	'30m': '30m',
	'1h': '1h',
	'2h': '2h',
	'4h': '4h',
	'8h': '12h',
	'12h': '12h',
	'1d': '1d',
	'1w': '1d',
	'1M': '1d',
}

export const PERIOD_MS: Record<IndicatorPeriod, number> = {
	'5m': 300_000,
	'15m': 900_000,
	'30m': 1_800_000,
	'1h': 3_600_000,
	'2h': 7_200_000,
	'4h': 14_400_000,
	'6h': 21_600_000,
	'12h': 43_200_000,
	'1d': 86_400_000,
}

export async function fetchOIHistory(
	symbol: string,
	period: IndicatorPeriod,
	limit = 500,
	opts?: { startTime?: number; endTime?: number }
): Promise<OIPoint[]> {
	let url = `https://fapi.binance.com/futures/data/openInterestHist?symbol=${symbol}&period=${period}&limit=${limit}`
	if (opts?.startTime) url += `&startTime=${opts.startTime}`
	if (opts?.endTime) url += `&endTime=${opts.endTime}`
	const res = await fetch(url)
	if (!res.ok) throw new Error(`OI history ${res.status}`)
	const json = await res.json()
	if (!Array.isArray(json)) throw new Error('OI history: no data')
	const data: { sumOpenInterestValue: string; timestamp: number }[] = json
	return data.map(d => ({
		time: Math.floor(d.timestamp / 1000),
		value: parseFloat(d.sumOpenInterestValue),
	}))
}

export async function fetchCurrentOI(symbol: string): Promise<{ oi: number; time: number }> {
	const [oiRes, priceRes] = await Promise.all([
		fetch(`https://fapi.binance.com/fapi/v1/openInterest?symbol=${symbol}`),
		fetch(`https://fapi.binance.com/fapi/v1/ticker/price?symbol=${symbol}`),
	])
	if (!oiRes.ok || !priceRes.ok) throw new Error('OI fetch failed')
	const oiData = await oiRes.json()
	const priceData = await priceRes.json()
	const oi = parseFloat(oiData.openInterest) * parseFloat(priceData.price)
	return { oi, time: Math.floor(oiData.time / 1000) }
}

export async function fetchFundingHistory(
	symbol: string,
	limit = 1000,
	startTime?: number,
	endTime?: number
): Promise<FundingBar[]> {
	let url = `https://fapi.binance.com/fapi/v1/fundingRate?symbol=${symbol}&limit=${limit}`
	if (startTime) url += `&startTime=${startTime}`
	if (endTime) url += `&endTime=${endTime}`
	const res = await fetch(url)
	if (!res.ok) throw new Error(`Funding rate ${res.status}`)
	const json = await res.json()
	if (!Array.isArray(json)) throw new Error('Funding rate: no data')
	const data: { fundingRate: string; fundingTime: number }[] = json
	return data.map(d => ({
		time: Math.floor(d.fundingTime / 1000),
		value: parseFloat(d.fundingRate),
	}))
}

const CANDLE_SECONDS: Record<Timeframe, number> = {
	'1m': 60, '5m': 300, '15m': 900, '30m': 1800,
	'1h': 3600, '2h': 7200, '4h': 14400, '8h': 28800,
	'12h': 43200, '1d': 86400, '1w': 604800, '1M': 2592000,
}

const FUNDING_PERIOD_S = 28800 // 8h

// Picks the smallest OI period such that one `limit=500` page covers the given
// candle window in seconds. Binance's openInterestHist endpoint caps `limit` at
// 500, so the only knob to cover a longer history is increasing the period.
export function pickOIPeriod(candleWindowSec: number): IndicatorPeriod {
	const minSec = candleWindowSec / 500
	const ordered: IndicatorPeriod[] = ['5m', '15m', '30m', '1h', '2h', '4h', '6h', '12h', '1d']
	for (const p of ordered) {
		if (PERIOD_MS[p] / 1000 >= minSec) return p
	}
	return '1d'
}

/** Aggregate OI to candle resolution — take last value per candle period */
export function aggregateOI(oi: OIPoint[], candles: Candle[], tf: Timeframe, indicatorPeriod: IndicatorPeriod): OIPoint[] {
	const candleDur = CANDLE_SECONDS[tf]
	const indicatorDur = PERIOD_MS[indicatorPeriod] / 1000
	if (candleDur <= indicatorDur || candles.length === 0 || oi.length === 0) return oi
	const result: OIPoint[] = []
	let j = 0
	for (const c of candles) {
		const end = c.time + candleDur
		while (j < oi.length && oi[j].time < c.time) j++
		let last: OIPoint | null = null
		let k = j
		while (k < oi.length && oi[k].time < end) {
			last = oi[k]
			k++
		}
		if (last) result.push({ time: c.time, value: last.value })
		j = k
	}
	return result
}

// Project funding to candle resolution with forward-fill: every candle gets a
// bar carrying the most recent funding rate. When multiple funding events fall
// inside one candle (higher timeframes), they're summed so the bar reflects
// total funding paid during that bar. Candles before the first funding event
// are skipped (no value to carry yet).
export function aggregateFunding(funding: FundingBar[], candles: Candle[], tf: Timeframe): FundingBar[] {
	if (candles.length === 0 || funding.length === 0) return funding
	const candleDur = CANDLE_SECONDS[tf]
	const sorted = funding.slice().sort((a, b) => a.time - b.time)
	const result: FundingBar[] = []
	let lastValue: number | null = null
	let j = 0
	for (const c of candles) {
		const end = c.time + candleDur
		while (j < sorted.length && sorted[j].time < c.time) {
			lastValue = sorted[j].value
			j++
		}
		let sum = 0
		let found = false
		let k = j
		while (k < sorted.length && sorted[k].time < end) {
			sum += sorted[k].value
			lastValue = sorted[k].value
			found = true
			k++
		}
		if (found) {
			result.push({ time: c.time, value: sum })
		} else if (lastValue !== null) {
			result.push({ time: c.time, value: lastValue })
		}
		j = k
	}
	return result
}

export function computeCVDFromCandles(candles: Candle[]): CvdPoint[] {
	let cumulative = 0
	return candles.map(c => {
		const delta = c.takerBuyVolume - (c.volume - c.takerBuyVolume)
		cumulative += delta
		return { time: c.time, value: cumulative }
	})
}
