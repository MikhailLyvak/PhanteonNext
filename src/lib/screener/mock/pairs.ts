import { AssetPair } from '../types'

const COIN_ICON: Record<string, string> = {
	BTC: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
	ETH: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
	SOL: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
	XRP: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
	BNB: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
	DOGE: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
	ADA: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
	AVAX: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
	TRX: 'https://assets.coingecko.com/coins/images/1094/large/tron-logo.png',
	LINK: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
	DOT: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png',
	MATIC: 'https://assets.coingecko.com/coins/images/4713/large/polygon.png',
	LTC: 'https://assets.coingecko.com/coins/images/2/large/litecoin.png',
	BCH: 'https://assets.coingecko.com/coins/images/780/large/bitcoin-cash-circle.png',
	NEAR: 'https://assets.coingecko.com/coins/images/10365/large/near.jpg',
	ARB: 'https://assets.coingecko.com/coins/images/16547/large/arb.jpg',
}

const COIN_BASE_PRICE: Record<string, { price: number; tick: number; precision: number }> = {
	BTC: { price: 96500, tick: 0.1, precision: 1 },
	ETH: { price: 3400, tick: 0.01, precision: 2 },
	SOL: { price: 215, tick: 0.01, precision: 2 },
	XRP: { price: 2.4, tick: 0.0001, precision: 4 },
	BNB: { price: 690, tick: 0.01, precision: 2 },
	DOGE: { price: 0.38, tick: 0.00001, precision: 5 },
	ADA: { price: 1.05, tick: 0.0001, precision: 4 },
	AVAX: { price: 42, tick: 0.001, precision: 3 },
	TRX: { price: 0.26, tick: 0.00001, precision: 5 },
	LINK: { price: 22.5, tick: 0.001, precision: 3 },
	DOT: { price: 8.2, tick: 0.001, precision: 3 },
	MATIC: { price: 0.58, tick: 0.00001, precision: 5 },
	LTC: { price: 115, tick: 0.01, precision: 2 },
	BCH: { price: 525, tick: 0.01, precision: 2 },
	NEAR: { price: 6.3, tick: 0.001, precision: 3 },
	ARB: { price: 0.92, tick: 0.0001, precision: 4 },
}

export const PAIRS: AssetPair[] = Object.keys(COIN_ICON).map((coin, i) => {
	const meta = COIN_BASE_PRICE[coin]
	return {
		id: i + 1,
		code: `${coin}USDT`,
		coin,
		type: 'USDT',
		tick: meta.tick,
		precision: meta.precision,
		iconUrl: COIN_ICON[coin],
	}
})

export function getBasePrice(coin: string): number {
	return COIN_BASE_PRICE[coin]?.price ?? 1
}

export function getPairByCode(code: string): AssetPair | undefined {
	return PAIRS.find(p => p.code === code)
}
