'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
	createChart,
	HistogramSeries,
	IChartApi,
	ISeriesApi,
	CrosshairMode,
	UTCTimestamp,
} from 'lightweight-charts'
import { AssetPair } from '@/lib/screener/types'
import { useTerminalStore } from '@/store/Screener/useTerminalStore'
import { formatUsdShort } from '@/lib/screener/format'
import { toLiquidationBuy, toLiquidationSell } from './chartUtils'

interface Props {
	pair: AssetPair
}

const LiquidationsChart: React.FC<Props> = ({ pair }) => {
	const containerRef = useRef<HTMLDivElement>(null)
	const chartRef = useRef<IChartApi | null>(null)
	const longRef = useRef<ISeriesApi<'Histogram'> | null>(null)
	const shortRef = useRef<ISeriesApi<'Histogram'> | null>(null)
	const loadingOlderRef = useRef(false)
	const allLoadedRef = useRef(false)
	const lastLenRef = useRef(0)
	const timeframe = useTerminalStore(s => s.timeframe)
	const [latestLong, setLatestLong] = useState<number | null>(null)
	const [latestShort, setLatestShort] = useState<number | null>(null)

	useEffect(() => {
		if (!containerRef.current) return

		const chart = createChart(containerRef.current, {
			layout: {
				background: { color: '#161a22' },
				textColor: '#98A0B3',
			},
			grid: {
				vertLines: { color: 'rgba(38,43,56,0.5)' },
				horzLines: { color: 'rgba(38,43,56,0.5)' },
			},
			crosshair: { mode: CrosshairMode.Normal },
			rightPriceScale: {
				borderColor: '#262b38',
				scaleMargins: { top: 0.1, bottom: 0.1 },
			},
			timeScale: { borderColor: '#262b38', timeVisible: true, secondsVisible: false },
			autoSize: true,
		})
		chartRef.current = chart

		const longSeries = chart.addSeries(HistogramSeries, {
			color: 'rgba(74,222,128,0.7)',
			priceFormat: { type: 'volume' },
			priceLineVisible: false,
			title: 'Long Liq',
		})
		longRef.current = longSeries

		const shortSeries = chart.addSeries(HistogramSeries, {
			color: 'rgba(248,113,113,0.7)',
			priceFormat: { type: 'volume' },
			priceLineVisible: false,
			title: 'Short Liq',
		})
		shortRef.current = shortSeries

		chart.timeScale().subscribeVisibleLogicalRangeChange(range => {
			if (!range || loadingOlderRef.current || allLoadedRef.current) return
			if (range.from < 10) {
				loadOlderLiq()
			}
		})

		return () => {
			chart.remove()
			chartRef.current = null
			longRef.current = null
			shortRef.current = null
		}
	}, [])

	const loadOlderLiq = async () => {
		const s = useTerminalStore.getState()
		if (s.candles.length === 0 || loadingOlderRef.current || allLoadedRef.current) return
		loadingOlderRef.current = true
		try {
			const earliestSec = s.candles[0].time
			const before = s.candles.length
			await useTerminalStore.getState().loadOlder(earliestSec - 1, s.timeframe, 500)
			const after = useTerminalStore.getState().candles.length
			if (after === before) {
				allLoadedRef.current = true
			}
		} catch {
			allLoadedRef.current = true
		} finally {
			loadingOlderRef.current = false
		}
	}

	useEffect(() => {
		loadingOlderRef.current = false
		allLoadedRef.current = false
		lastLenRef.current = 0

		const apply = () => {
			const arr = useTerminalStore.getState().liquidations
			const longSeries = longRef.current
			const shortSeries = shortRef.current
			if (!longSeries || !shortSeries) return
			if (arr.length === 0) {
				longSeries.setData([])
				shortSeries.setData([])
				lastLenRef.current = 0
				setLatestLong(null)
				setLatestShort(null)
				return
			}
			if (arr.length < lastLenRef.current || arr.length - lastLenRef.current > 1) {
				// Note: longRef = sells (long liquidations) historically; mirror chartUtils mapping.
				// MasterChart maps buy_volume → liqBuy (green), sell_volume (negative) → liqSell (red).
				// Here we keep the original LiquidationsChart semantics: longRef green = buy volume, shortRef red = sell volume.
				longSeries.setData(toLiquidationBuy(arr))
				shortSeries.setData(toLiquidationSell(arr).map(d => ({ ...d, value: -d.value })))
				const total = arr.length
				const visible = Math.min(100, total)
				chartRef.current?.timeScale().setVisibleLogicalRange({
					from: total - visible,
					to: total - 1,
				})
			} else {
				const last = arr[arr.length - 1]
				longSeries.update({
					time: last.time as UTCTimestamp,
					value: last.buy_volume,
					color: 'rgba(74,222,128,0.7)',
				})
				shortSeries.update({
					time: last.time as UTCTimestamp,
					value: last.sell_volume,
					color: 'rgba(248,113,113,0.7)',
				})
			}
			lastLenRef.current = arr.length
			const last = arr[arr.length - 1]
			setLatestLong(last.sell_volume)
			setLatestShort(last.buy_volume)
		}

		apply()
		const unsub = useTerminalStore.subscribe(s => s.liquidations, apply)
		return () => unsub()
	}, [pair.code, timeframe])

	return (
		<div className='bg-[#161a22] border border-[#262b38] rounded-2xl p-3 flex flex-col'>
			<div className='flex items-center gap-4 mb-2'>
				<h3 className='text-base font-bold text-[#D2D2FF]'>Liquidations</h3>
				{latestLong !== null && (
					<span className='text-xs font-mono'>
						<span className='text-[#f87171]'>Long {formatUsdShort(latestLong)}</span>
						<span className='text-[#58587B] mx-2'>|</span>
						<span className='text-[#4ade80]'>Short {formatUsdShort(latestShort ?? 0)}</span>
					</span>
				)}
			</div>
			<div ref={containerRef} className='w-full' style={{ height: 200 }} />
		</div>
	)
}

export default LiquidationsChart
