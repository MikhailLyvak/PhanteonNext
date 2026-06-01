import { Candle, ChartInitPayload, Timeframe } from '@/lib/screener/types'

const BINANCE_KLINES = 'https://fapi.binance.com/fapi/v1/klines'

const TF_MS: Record<Timeframe, number> = {
	'1m': 60_000,
	'5m': 300_000,
	'15m': 900_000,
	'30m': 1_800_000,
	'1h': 3_600_000,
	'2h': 7_200_000,
	'4h': 14_400_000,
	'8h': 28_800_000,
	'12h': 43_200_000,
	'1d': 86_400_000,
	'1w': 604_800_000,
	'1M': 2_592_000_000,
}

export async function fetchKlines(
	symbol: string,
	interval: Timeframe,
	limit: number,
	opts?: { startTime?: number; endTime?: number }
): Promise<Candle[]> {
	const params = new URLSearchParams({
		symbol,
		interval,
		limit: String(limit),
	})
	if (opts?.startTime !== undefined) {
		params.set('startTime', String(opts.startTime))
	}
	if (opts?.endTime !== undefined) {
		params.set('endTime', String(opts.endTime))
	}

	const res = await fetch(`${BINANCE_KLINES}?${params}`)
	if (!res.ok) {
		throw new Error(`Binance klines ${res.status}: ${res.statusText}`)
	}

	const raw: unknown[][] = await res.json()

	return raw.map(k => ({
		time: Math.floor((k[0] as number) / 1000),
		open: parseFloat(k[1] as string),
		high: parseFloat(k[2] as string),
		low: parseFloat(k[3] as string),
		close: parseFloat(k[4] as string),
		volume: parseFloat(k[5] as string),
		takerBuyVolume: parseFloat(k[9] as string),
	}))
}

const INIT_WINDOW_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

export async function getChartInitFromBinance(
	pairCode: string,
	tf: Timeframe
): Promise<ChartInitPayload> {
	const now = Date.now()
	const intervalMs = TF_MS[tf]
	// Cap at 5000 candles to avoid too many requests on very small timeframes
	const maxCandles = Math.min(Math.ceil(INIT_WINDOW_MS / intervalMs), 5000)

	let candles: Candle[] = []
	let startTime = now - maxCandles * intervalMs

	while (candles.length < maxCandles) {
		const batch = await fetchKlines(pairCode, tf, 1500, { startTime })
		if (batch.length === 0) break
		const lastTime = candles.length > 0 ? candles[candles.length - 1].time : -1
		const deduped = batch.filter(c => c.time > lastTime)
		candles = [...candles, ...deduped]
		// Move startTime forward past the last fetched candle
		startTime = batch[batch.length - 1].time * 1000 + intervalMs
		if (batch.length < 1500) break
	}

	return {
		candles,
		footprints: [],
		cvd: [],
		liquidations: [],
		funding: [],
		oi: [],
	}
}
