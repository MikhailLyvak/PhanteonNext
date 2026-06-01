import { OIPoint, LiquidationBar, FundingBar, CvdPoint, Candle, Timeframe } from '@/lib/screener/types'

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

export async function fetchTakerHistory(
	symbol: string,
	period: IndicatorPeriod,
	limit = 500,
	opts?: { startTime?: number; endTime?: number }
): Promise<LiquidationBar[]> {
	let url = `https://fapi.binance.com/futures/data/takerlongshortRatio?symbol=${symbol}&period=${period}&limit=${limit}`
	if (opts?.startTime) url += `&startTime=${opts.startTime}`
	if (opts?.endTime) url += `&endTime=${opts.endTime}`
	const res = await fetch(url)
	if (!res.ok) throw new Error(`Taker ratio ${res.status}`)
	const json = await res.json()
	if (!Array.isArray(json)) throw new Error('Taker ratio: no data')
	const data: { buyVol: string; sellVol: string; timestamp: number }[] = json

	// Fetch current price to convert ratio volumes to USD
	const priceRes = await fetch(`https://fapi.binance.com/fapi/v1/ticker/price?symbol=${symbol}`)
	const price = priceRes.ok ? parseFloat((await priceRes.json()).price) : 1

	return data.map(d => ({
		time: Math.floor(d.timestamp / 1000),
		buy_volume: parseFloat(d.buyVol) * price,
		sell_volume: parseFloat(d.sellVol) * price,
	}))
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

/** Aggregate OI to candle resolution — take last value per candle period */
export function aggregateOI(oi: OIPoint[], candles: Candle[], tf: Timeframe): OIPoint[] {
	const candleDur = CANDLE_SECONDS[tf]
	const indicatorDur = PERIOD_MS[TF_TO_INDICATOR_PERIOD[tf]] / 1000
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

/** Aggregate liquidations to candle resolution — sum buy/sell volumes per candle period */
export function aggregateLiquidations(liq: LiquidationBar[], candles: Candle[], tf: Timeframe): LiquidationBar[] {
	const candleDur = CANDLE_SECONDS[tf]
	const indicatorDur = PERIOD_MS[TF_TO_INDICATOR_PERIOD[tf]] / 1000
	if (candleDur <= indicatorDur || candles.length === 0 || liq.length === 0) return liq
	const result: LiquidationBar[] = []
	let j = 0
	for (const c of candles) {
		const end = c.time + candleDur
		while (j < liq.length && liq[j].time < c.time) j++
		let buySum = 0, sellSum = 0, found = false
		let k = j
		while (k < liq.length && liq[k].time < end) {
			buySum += liq[k].buy_volume
			sellSum += liq[k].sell_volume
			found = true
			k++
		}
		if (found) result.push({ time: c.time, buy_volume: buySum, sell_volume: sellSum })
		j = k
	}
	return result
}

/** Aggregate funding to candle resolution — sum funding rates per candle period */
export function aggregateFunding(funding: FundingBar[], candles: Candle[], tf: Timeframe): FundingBar[] {
	const candleDur = CANDLE_SECONDS[tf]
	if (candleDur <= FUNDING_PERIOD_S || candles.length === 0 || funding.length === 0) return funding
	const result: FundingBar[] = []
	let j = 0
	for (const c of candles) {
		const end = c.time + candleDur
		while (j < funding.length && funding[j].time < c.time) j++
		let sum = 0, found = false
		let k = j
		while (k < funding.length && funding[k].time < end) {
			sum += funding[k].value
			found = true
			k++
		}
		if (found) result.push({ time: c.time, value: sum })
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
