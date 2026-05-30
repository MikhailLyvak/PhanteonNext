export interface AssetPair {
	id: number
	code: string
	coin: string
	type: 'USDT'
	tick: number
	precision: number
	iconUrl: string
}

export type Period = '1h' | '4h' | '24h'
export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d'

export interface DashboardAssetData {
	ohlcv: {
		close_latest: number
		close_1h?: number
		close_4h?: number
		close_24h?: number
	}
	oi: {
		ointerest_latest: number
		ointerest_1h?: number
		ointerest_4h?: number
		ointerest_24h?: number
	}
	liquidations: {
		buy_turnover_1h?: number
		sell_turnover_1h?: number
		total_turnover_1h?: number
		buy_turnover_4h?: number
		sell_turnover_4h?: number
		total_turnover_4h?: number
		buy_turnover_24h?: number
		sell_turnover_24h?: number
		total_turnover_24h?: number
	}
	cvd: {
		cvd_1h?: number
		cvd_4h?: number
		cvd_24h?: number
	}
	funding?: { close_latest: number }
	tick: number
	precision: number
}

export interface Candle {
	time: number
	open: number
	high: number
	low: number
	close: number
	volume: number
}

export interface FootprintFrame {
	time: number
	data: Record<string, { b: number; s: number }>
}

export interface CvdPoint {
	time: number
	value: number
}

export interface LiquidationBar {
	time: number
	buy_volume: number
	sell_volume: number
}

export interface FundingBar {
	time: number
	value: number
}

export interface OIPoint {
	time: number
	value: number
}

export interface ChartInitPayload {
	candles: Candle[]
	footprints: FootprintFrame[]
	cvd: CvdPoint[]
	liquidations: LiquidationBar[]
	funding: FundingBar[]
	oi: OIPoint[]
}

export interface LiquidationEvent {
	ts: number
	symbol: string
	side: 'buy' | 'sell'
	price: number
	volume: number
}

export interface TradeEvent {
	ts: number
	symbol: string
	side: 'buy' | 'sell'
	price: number
	volume: number
	isLarge: true
}
