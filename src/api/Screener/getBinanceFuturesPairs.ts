import { AssetPair } from '@/lib/screener/types'

const EXCHANGE_INFO_URL = 'https://fapi.binance.com/fapi/v1/exchangeInfo'

interface BinanceSymbol {
	symbol: string
	contractType: string
	status: string
	baseAsset: string
	quoteAsset: string
	pricePrecision: number
	filters: { filterType: string; tickSize?: string }[]
}

function precisionFromTick(tickStr: string): number {
	const dot = tickStr.indexOf('.')
	if (dot < 0) return 0
	const trimmed = tickStr.replace(/0+$/, '')
	return trimmed.length - dot - 1
}

let cached: AssetPair[] | null = null

export async function getBinanceFuturesPairs(): Promise<AssetPair[]> {
	if (cached) return cached

	const res = await fetch(EXCHANGE_INFO_URL)
	if (!res.ok) {
		throw new Error(`Binance exchangeInfo ${res.status}: ${res.statusText}`)
	}

	const data: { symbols: BinanceSymbol[] } = await res.json()

	const pairs: AssetPair[] = data.symbols
		.filter(
			s =>
				s.contractType === 'PERPETUAL' &&
				s.status === 'TRADING' &&
				s.quoteAsset === 'USDT'
		)
		.map((s, i) => {
			const priceFilter = s.filters.find(f => f.filterType === 'PRICE_FILTER')
			const tickStr = priceFilter?.tickSize ?? '0.01'
			const tickSize = parseFloat(tickStr)
			const precision = precisionFromTick(tickStr)

			return {
				id: i + 1,
				code: s.symbol,
				coin: s.baseAsset,
				type: 'USDT' as const,
				tick: tickSize,
				precision,
				iconUrl: '',
			}
		})

	cached = pairs
	return pairs
}

export async function getFuturesPairByCode(code: string): Promise<AssetPair | undefined> {
	const pairs = await getBinanceFuturesPairs()
	return pairs.find(p => p.code === code)
}

export function clearPairsCache(): void {
	cached = null
}
