'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
	createChart,
	LineSeries,
	IChartApi,
	ISeriesApi,
	CrosshairMode,
	LineStyle,
	UTCTimestamp,
} from 'lightweight-charts'
import { AssetPair, Timeframe } from '@/lib/screener/types'
import { useTerminalStore } from '@/store/Screener/useTerminalStore'
import { formatUsdShort } from '@/lib/screener/format'

interface Props {
	pair: AssetPair
}

type OIPeriod = '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '12h' | '1d'

const TF_TO_OI_PERIOD: Record<Timeframe, OIPeriod> = {
	'1m': '5m',
	'5m': '5m',
	'15m': '15m',
	'30m': '30m',
	'1h': '1h',
	'2h': '2h',
	'4h': '4h',
	'8h': '12h',
	'12h': '12h',
	'1d': '1d',
	'1w': '1d',
	'1M': '1d',
}

interface OIDataPoint {
	time: UTCTimestamp
	value: number
}

async function fetchOIHistory(symbol: string, period: OIPeriod, limit = 500, endTime?: number): Promise<OIDataPoint[]> {
	let url = `https://fapi.binance.com/futures/data/openInterestHist?symbol=${symbol}&period=${period}&limit=${limit}`
	if (endTime) url += `&endTime=${endTime}`
	const res = await fetch(url)
	if (!res.ok) throw new Error(`OI history ${res.status}`)
	const json = await res.json()
	if (!Array.isArray(json)) throw new Error('OI history: no data')
	const data: { sumOpenInterestValue: string; timestamp: number }[] = json
	return data.map(d => ({
		time: Math.floor(d.timestamp / 1000) as UTCTimestamp,
		value: parseFloat(d.sumOpenInterestValue),
	}))
}

async function fetchCurrentOI(symbol: string): Promise<{ oi: number; time: number }> {
	const [oiRes, priceRes] = await Promise.all([
		fetch(`https://fapi.binance.com/fapi/v1/openInterest?symbol=${symbol}`),
		fetch(`https://fapi.binance.com/fapi/v1/ticker/price?symbol=${symbol}`),
	])
	if (!oiRes.ok || !priceRes.ok) throw new Error('OI fetch failed')
	const oiData = await oiRes.json()
	const priceData = await priceRes.json()
	const oi = parseFloat(oiData.openInterest) * parseFloat(priceData.price)
	return { oi, time: Math.floor(oiData.time / 1000) }
}

const OIChart: React.FC<Props> = ({ pair }) => {
	const containerRef = useRef<HTMLDivElement>(null)
	const chartRef = useRef<IChartApi | null>(null)
	const seriesRef = useRef<ISeriesApi<'Line'> | null>(null)
	const dataRef = useRef<OIDataPoint[]>([])
	const loadingOlderRef = useRef(false)
	const allLoadedRef = useRef(false)
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
		const data = dataRef.current
		if (data.length === 0 || loadingOlderRef.current || allLoadedRef.current) return
		loadingOlderRef.current = true
		try {
			const period = TF_TO_OI_PERIOD[useTerminalStore.getState().timeframe]
			const earliestMs = (data[0].time as number) * 1000 - 1
			const older = await fetchOIHistory(pair.code, period, 500, earliestMs)
			if (older.length === 0) {
				allLoadedRef.current = true
				return
			}
			// Remove any overlap
			const earliestExisting = data[0].time
			const filtered = older.filter(d => d.time < earliestExisting)
			if (filtered.length === 0) {
				allLoadedRef.current = true
				return
			}
			const chart = chartRef.current
			const range = chart?.timeScale().getVisibleLogicalRange()
			dataRef.current = [...filtered, ...data]
			seriesRef.current?.setData(dataRef.current)
			if (chart && range) {
				chart.timeScale().setVisibleLogicalRange({
					from: range.from + filtered.length,
					to: range.to + filtered.length,
				})
			}
		} catch {
			// Binance rejects endTime older than 30 days — no more data available
			allLoadedRef.current = true
		} finally {
			loadingOlderRef.current = false
		}
	}

	useEffect(() => {
		let cancelled = false
		let pollTimer: ReturnType<typeof setInterval> | null = null
		loadingOlderRef.current = false
		allLoadedRef.current = false

		const oiPeriod = TF_TO_OI_PERIOD[timeframe]

		const load = async () => {
			try {
				const history = await fetchOIHistory(pair.code, oiPeriod)
				if (cancelled) return
				dataRef.current = history
				seriesRef.current?.setData(history)
				if (history.length > 0) {
					setCurrentOI(history[history.length - 1].value)
				}

				const total = history.length
				const visible = Math.min(100, total)
				chartRef.current?.timeScale().setVisibleLogicalRange({
					from: total - visible,
					to: total - 1,
				})

				pollTimer = setInterval(async () => {
					try {
						const { oi, time } = await fetchCurrentOI(pair.code)
						if (cancelled) return
						const point = { time: time as UTCTimestamp, value: oi }
						const data = dataRef.current
						if (data.length > 0 && data[data.length - 1].time === point.time) {
							data[data.length - 1] = point
						} else {
							data.push(point)
						}
						seriesRef.current?.update(point)
						setCurrentOI(oi)
					} catch {
						// ignore poll errors
					}
				}, 1000)
			} catch (err) {
				console.error('[screener] Failed to fetch OI data:', err)
			}
		}

		load()
		return () => {
			cancelled = true
			if (pollTimer) clearInterval(pollTimer)
		}
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
