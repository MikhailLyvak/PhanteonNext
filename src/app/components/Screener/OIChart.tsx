'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
	createChart,
	LineSeries,
	IChartApi,
	ISeriesApi,
	CrosshairMode,
	UTCTimestamp,
} from 'lightweight-charts'
import { AssetPair } from '@/lib/screener/types'
import { useTerminalStore } from '@/store/Screener/useTerminalStore'
import { formatUsdShort } from '@/lib/screener/format'
import { toLineData } from './chartUtils'

interface Props {
	pair: AssetPair
}

const OIChart: React.FC<Props> = ({ pair }) => {
	const containerRef = useRef<HTMLDivElement>(null)
	const chartRef = useRef<IChartApi | null>(null)
	const seriesRef = useRef<ISeriesApi<'Line'> | null>(null)
	const loadingOlderRef = useRef(false)
	const allLoadedRef = useRef(false)
	const lastLenRef = useRef(0)
	const timeframe = useTerminalStore(s => s.timeframe)
	const [currentOI, setCurrentOI] = useState<number | null>(null)

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

		const series = chart.addSeries(LineSeries, {
			color: '#D2D2FF',
			lineWidth: 2,
			priceLineVisible: true,
			priceFormat: { type: 'volume' },
		})
		seriesRef.current = series

		chart.timeScale().subscribeVisibleLogicalRangeChange(range => {
			if (!range || loadingOlderRef.current || allLoadedRef.current) return
			if (range.from < 10) {
				loadOlderOI()
			}
		})

		return () => {
			chart.remove()
			chartRef.current = null
			seriesRef.current = null
		}
	}, [])

	const loadOlderOI = async () => {
		const s = useTerminalStore.getState()
		if (s.candles.length === 0 || loadingOlderRef.current || allLoadedRef.current) return
		loadingOlderRef.current = true
		try {
			const earliestSec = s.candles[0].time
			const before = s.candles.length
			await useTerminalStore.getState().loadOlder(earliestSec * 1000 - 1, s.timeframe, 500)
			const after = useTerminalStore.getState().candles.length
			// OI history is delivered via /chart/history only when backend includes
			// it — for now backend's history only returns candles+footprints. So
			// rely on chart store; once OI prepended length is zero, stop trying.
			if (after === before) {
				allLoadedRef.current = true
			}
		} catch {
			allLoadedRef.current = true
		} finally {
			loadingOlderRef.current = false
		}
	}

	// Drive the OI series imperatively from store updates.
	useEffect(() => {
		loadingOlderRef.current = false
		allLoadedRef.current = false
		lastLenRef.current = 0

		const apply = () => {
			const arr = useTerminalStore.getState().oi
			const ref = seriesRef.current
			if (!ref) return
			if (arr.length === 0) {
				ref.setData([])
				lastLenRef.current = 0
				setCurrentOI(null)
				return
			}
			if (arr.length < lastLenRef.current || arr.length - lastLenRef.current > 1) {
				ref.setData(toLineData(arr))
				const total = arr.length
				const visible = Math.min(100, total)
				chartRef.current?.timeScale().setVisibleLogicalRange({
					from: total - visible,
					to: total - 1,
				})
			} else {
				const last = arr[arr.length - 1]
				ref.update({ time: last.time as UTCTimestamp, value: last.value })
			}
			lastLenRef.current = arr.length
			setCurrentOI(arr[arr.length - 1].value)
		}

		apply()
		const unsub = useTerminalStore.subscribe(s => s.oi, apply)
		return () => unsub()
	}, [pair.code, timeframe])

	return (
		<div className='bg-[#161a22] border border-[#262b38] rounded-2xl p-3 flex flex-col'>
			<div className='flex items-center gap-3 mb-2'>
				<h3 className='text-base font-bold text-[#D2D2FF]'>Open Interest</h3>
				{currentOI !== null && (
					<span className='text-sm font-mono text-[#98A0B3]'>
						{formatUsdShort(currentOI)}
					</span>
				)}
			</div>
			<div ref={containerRef} className='w-full' style={{ height: 200 }} />
		</div>
	)
}

export default OIChart
