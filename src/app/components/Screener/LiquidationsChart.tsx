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
import { AssetPair, Timeframe } from '@/lib/screener/types'
import { useTerminalStore } from '@/store/Screener/useTerminalStore'
import { formatUsdShort } from '@/lib/screener/format'

interface Props {
	pair: AssetPair
}

type OIPeriod = '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '12h' | '1d'

const TF_TO_PERIOD: Record<Timeframe, OIPeriod> = {
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

interface TakerData {
	buyVol: string
	sellVol: string
	timestamp: number
}

interface LiqPoint {
	time: UTCTimestamp
	buyVol: number
	sellVol: number
}

async function fetchTakerHistory(symbol: string, period: OIPeriod, limit = 500, endTime?: number): Promise<LiqPoint[]> {
	let url = `https://fapi.binance.com/futures/data/takerlongshortRatio?symbol=${symbol}&period=${period}&limit=${limit}`
	if (endTime) url += `&endTime=${endTime}`
	const res = await fetch(url)
	if (!res.ok) throw new Error(`Taker ratio ${res.status}`)
	const json = await res.json()
	if (!Array.isArray(json)) throw new Error('Taker ratio: no data')
	const data: TakerData[] = json
	return data.map(d => ({
		time: Math.floor(d.timestamp / 1000) as UTCTimestamp,
		buyVol: parseFloat(d.buyVol),
		sellVol: parseFloat(d.sellVol),
	}))
}

async function fetchCurrentPrice(symbol: string): Promise<number> {
	const res = await fetch(`https://fapi.binance.com/fapi/v1/ticker/price?symbol=${symbol}`)
	if (!res.ok) return 0
	const data = await res.json()
	return parseFloat(data.price)
}

const LiquidationsChart: React.FC<Props> = ({ pair }) => {
	const containerRef = useRef<HTMLDivElement>(null)
	const chartRef = useRef<IChartApi | null>(null)
	const longRef = useRef<ISeriesApi<'Histogram'> | null>(null)
	const shortRef = useRef<ISeriesApi<'Histogram'> | null>(null)
	const historyRef = useRef<LiqPoint[]>([])
	const priceRef = useRef<number>(0)
	const loadingOlderRef = useRef(false)
	const allLoadedRef = useRef(false)
	const timeframe = useTerminalStore(s => s.timeframe)
	const [latestLong, setLatestLong] = useState<number | null>(null)
	const [latestShort, setLatestShort] = useState<number | null>(null)

	const applySeriesData = () => {
		const px = priceRef.current
		const data = historyRef.current
		longRef.current?.setData(
			data.map(d => ({
				time: d.time,
				value: d.sellVol * px,
				color: 'rgba(248,113,113,0.7)',
			}))
		)
		shortRef.current?.setData(
			data.map(d => ({
				time: d.time,
				value: d.buyVol * px,
				color: 'rgba(74,222,128,0.7)',
			}))
		)
	}

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
		const data = historyRef.current
		if (data.length === 0 || loadingOlderRef.current || allLoadedRef.current) return
		loadingOlderRef.current = true
		try {
			const period = TF_TO_PERIOD[useTerminalStore.getState().timeframe]
			const earliestMs = (data[0].time as number) * 1000 - 1
			const older = await fetchTakerHistory(pair.code, period, 500, earliestMs)
			if (older.length === 0) {
				allLoadedRef.current = true
				return
			}
			const earliestExisting = data[0].time
			const filtered = older.filter(d => d.time < earliestExisting)
			if (filtered.length === 0) {
				allLoadedRef.current = true
				return
			}
			const chart = chartRef.current
			const range = chart?.timeScale().getVisibleLogicalRange()
			historyRef.current = [...filtered, ...data]
			applySeriesData()
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
		const period = TF_TO_PERIOD[timeframe]
		loadingOlderRef.current = false
		allLoadedRef.current = false

		const load = async () => {
			try {
				const [history, price] = await Promise.all([
					fetchTakerHistory(pair.code, period),
					fetchCurrentPrice(pair.code),
				])
				if (cancelled) return

				historyRef.current = history
				priceRef.current = price
				applySeriesData()

				if (history.length > 0) {
					const last = history[history.length - 1]
					setLatestLong(last.sellVol * price)
					setLatestShort(last.buyVol * price)
				}

				const total = history.length
				const visible = Math.min(100, total)
				chartRef.current?.timeScale().setVisibleLogicalRange({
					from: total - visible,
					to: total - 1,
				})

				pollTimer = setInterval(async () => {
					try {
						const [fresh, px] = await Promise.all([
							fetchTakerHistory(pair.code, period, 1),
							fetchCurrentPrice(pair.code),
						])
						if (cancelled || fresh.length === 0) return
						const d = fresh[0]
						priceRef.current = px
						const data = historyRef.current
						if (data.length > 0 && data[data.length - 1].time === d.time) {
							data[data.length - 1] = d
						} else {
							data.push(d)
						}
						longRef.current?.update({
							time: d.time,
							value: d.sellVol * px,
							color: 'rgba(248,113,113,0.7)',
						})
						shortRef.current?.update({
							time: d.time,
							value: d.buyVol * px,
							color: 'rgba(74,222,128,0.7)',
						})
						setLatestLong(d.sellVol * px)
						setLatestShort(d.buyVol * px)
					} catch {
						// ignore poll errors
					}
				}, 3000)
			} catch (err) {
				console.error('[screener] Failed to fetch liquidation data:', err)
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
