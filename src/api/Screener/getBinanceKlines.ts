import { Candle, Timeframe } from '@/lib/screener/types'

const BINANCE_KLINES = 'https://fapi.binance.com/fapi/v1/klines'

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
