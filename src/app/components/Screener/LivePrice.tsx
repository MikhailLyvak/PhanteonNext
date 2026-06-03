'use client'

import React, { useEffect, useRef, useState } from 'react'
import { AssetPair } from '@/lib/screener/types'
import { formatPrice } from '@/lib/screener/format'
import { useTerminalStore } from '@/store/Screener/useTerminalStore'
import { useScreenerStore } from '@/store/Screener/useScreenerStore'

interface Props {
	pair: AssetPair
}

const LivePrice: React.FC<Props> = ({ pair }) => {
	// Live mark price: prefer the latest candle from the chart stream;
	// fall back to the dashboard snapshot's close_latest if candles haven't
	// arrived yet (initial load before /stream/chart pushes its first frame).
	const latestCandleClose = useTerminalStore(s =>
		s.currentPair === pair.code && s.candles.length > 0
			? s.candles[s.candles.length - 1].close
			: null
	)
	const dashboardEntry = useScreenerStore(s => s.data[pair.code])

	const price =
		latestCandleClose ?? dashboardEntry?.ohlcv?.close_latest ?? null

	// 24h % change derived from the dashboard snapshot.
	const closeLatest = dashboardEntry?.ohlcv?.close_latest
	const close24h = dashboardEntry?.ohlcv?.close_24h
	const priceChange24h: number | null =
		typeof closeLatest === 'number' &&
		typeof close24h === 'number' &&
		close24h !== 0
			? ((closeLatest - close24h) / close24h) * 100
			: null

	// Track up/down flash from successive live prices.
	const [priceDir, setPriceDir] = useState<'up' | 'down' | 'flat'>('flat')
	const prevPriceRef = useRef<number>(0)

	useEffect(() => {
		if (price === null) return
		const prev = prevPriceRef.current
		if (prev && price !== prev) {
			setPriceDir(price > prev ? 'up' : 'down')
		}
		prevPriceRef.current = price
	}, [price])

	if (price === null) {
		return (
			<div className='flex items-baseline gap-2'>
				<span className='text-lg font-bold text-[#58587B]'>---</span>
			</div>
		)
	}

	const priceColor =
		priceDir === 'up'
			? 'text-[#4ade80]'
			: priceDir === 'down'
			? 'text-[#f87171]'
			: 'text-[#D2D2FF]'

	const changeColor =
		priceChange24h === null
			? 'text-[#58587B]'
			: priceChange24h >= 0
			? 'text-[#4ade80]'
			: 'text-[#f87171]'
	const changeSign =
		priceChange24h !== null && priceChange24h >= 0 ? '+' : ''

	return (
		<div className='flex items-baseline gap-3'>
			<span
				className={`text-xl font-bold tabular-nums transition-colors ${priceColor}`}
			>
				{formatPrice(price, pair.precision)}
			</span>
			<span className={`text-sm font-medium ${changeColor}`}>
				{priceChange24h === null
					? '--%'
					: `${changeSign}${priceChange24h.toFixed(2)}%`}
			</span>
		</div>
	)
}

export default LivePrice
