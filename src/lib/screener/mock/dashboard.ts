import { AssetPair, DashboardAssetData } from '../types'
import { hashString, mulberry32 } from './rng'

interface BinanceTicker24hr {
	symbol: string
	lastPrice: string
	openPrice: string
	quoteVolume: string
}

interface TickerData {
	lastPrice: number
	openPrice: number
	quoteVolume: number
}

async function fetchTickers(): Promise<Map<string, TickerData>> {
	const res = await fetch('https://fapi.binance.com/fapi/v1/ticker/24hr')
	if (!res.ok) throw new Error(`Binance ticker/24hr ${res.status}`)
	const data: BinanceTicker24hr[] = await res.json()
	const map = new Map<string, TickerData>()
	for (const t of data) {
		map.set(t.symbol, {
			lastPrice: parseFloat(t.lastPrice),
			openPrice: parseFloat(t.openPrice),
			quoteVolume: parseFloat(t.quoteVolume),
		})
	}
	return map
}

// TODO(real-data): replace with Axios GET /api/screener/dashboard (NEXT_PUBLIC_SCREENER_API_BASE_URL).
export async function getDashboardSnapshot(pairs: AssetPair[]): Promise<Record<string, DashboardAssetData>> {
	const tickers = await fetchTickers()
	const out: Record<string, DashboardAssetData> = {}
	for (const pair of pairs) {
		const rand = mulberry32(hashString(pair.code))
		const ticker = tickers.get(pair.code)
		const close_latest = ticker?.lastPrice ?? 0
		const close_24h = ticker?.openPrice ?? 0
		const quoteVolume24h = ticker?.quoteVolume ?? 0
		const base = close_latest || 100 + rand() * 50000
		const drift = (v: number) => v * (1 + (rand() - 0.5) * 0.04)
		const close_1h = drift(base)
		const close_4h = drift(base)

		const oiBase = base * 1_000_000 * (0.4 + rand() * 2.5)
		const liqScale = base * 800 * (0.5 + rand() * 3)
		const cvdScale = base * 1500 * (rand() - 0.4)

		out[pair.code] = {
			ohlcv: { close_latest, close_1h, close_4h, close_24h },
			oi: {
				ointerest_latest: oiBase,
				ointerest_1h: oiBase * (1 + (rand() - 0.5) * 0.05),
				ointerest_4h: oiBase * (1 + (rand() - 0.5) * 0.1),
				ointerest_24h: oiBase * (1 + (rand() - 0.5) * 0.2),
			},
			liquidations: {
				buy_turnover_1h: liqScale * rand(),
				sell_turnover_1h: liqScale * rand(),
				total_turnover_1h: liqScale * (1 + rand()),
				buy_turnover_4h: liqScale * 3 * rand(),
				sell_turnover_4h: liqScale * 3 * rand(),
				total_turnover_4h: liqScale * 4 * (1 + rand()),
				buy_turnover_24h: liqScale * 12 * rand(),
				sell_turnover_24h: liqScale * 12 * rand(),
				total_turnover_24h: liqScale * 18 * (1 + rand()),
			},
			cvd: {
				cvd_1h: cvdScale,
				cvd_4h: cvdScale * 2 * (rand() - 0.3),
				cvd_24h: cvdScale * 4 * (rand() - 0.3),
			},
			funding: { close_latest: (rand() - 0.5) * 0.0008 },
			quoteVolume24h,
			tick: pair.tick,
			precision: pair.precision,
		}
	}
	return out
}
