import type { Time, UTCTimestamp, CandlestickData, LineData, HistogramData } from 'lightweight-charts'
import { Candle, CvdPoint, FundingBar, LiquidationBar, OIPoint } from '@/lib/screener/types'

export const toTime = (t: number): UTCTimestamp => t as UTCTimestamp

export const toCandlestickData = (cs: Candle[]): CandlestickData<Time>[] =>
	cs.map(c => ({
		time: toTime(c.time),
		open: c.open,
		high: c.high,
		low: c.low,
		close: c.close,
	}))

export const toVolumeData = (cs: Candle[]): HistogramData<Time>[] =>
	cs.map(c => ({
		time: toTime(c.time),
		value: c.volume,
		color: c.close >= c.open ? 'rgba(74,222,128,0.45)' : 'rgba(248,113,113,0.45)',
	}))

export const toLineData = (pts: CvdPoint[] | OIPoint[]): LineData<Time>[] =>
	pts.map(p => ({ time: toTime(p.time), value: p.value }))

export const toLiquidationBuy = (bars: LiquidationBar[]): HistogramData<Time>[] =>
	bars.map(b => ({
		time: toTime(b.time),
		value: b.buy_volume,
		color: 'rgba(74,222,128,0.7)',
	}))

export const toLiquidationSell = (bars: LiquidationBar[]): HistogramData<Time>[] =>
	bars.map(b => ({
		time: toTime(b.time),
		value: -b.sell_volume,
		color: 'rgba(248,113,113,0.7)',
	}))

export const fundingToPercent = (value: number): number => value * 100

export const toFundingLineData = (bars: FundingBar[]): LineData<Time>[] =>
	bars.map(b => ({
		time: toTime(b.time),
		value: fundingToPercent(b.value),
	}))
