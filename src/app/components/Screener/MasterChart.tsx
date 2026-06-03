'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
	createChart,
	CandlestickSeries,
	HistogramSeries,
	LineSeries,
	IChartApi,
	ISeriesApi,
	CrosshairMode,
	LineStyle,
	Time,
} from 'lightweight-charts'
import { AssetPair } from '@/lib/screener/types'
import {
	useTerminalStore,
	INDICATOR_ORDER,
	INDICATOR_LABELS,
} from '@/store/Screener/useTerminalStore'
import {
	toCandlestickData,
	toFundingLineData,
	toLineData,
	toLiquidationBuy,
	toLiquidationSell,
	toTime,
	toVolumeData,
} from './chartUtils'
import { formatPrice } from '@/lib/screener/format'
import { HeatmapDatum, HeatmapSeriesView } from './HeatmapPlugin'

interface Props {
	pair: AssetPair
}

const MAIN_PANE_STRETCH = 4

interface IndicatorSeriesRefs {
	volume: ISeriesApi<'Histogram'> | null
	cvd: ISeriesApi<'Line'> | null
	liqBuy: ISeriesApi<'Histogram'> | null
	liqSell: ISeriesApi<'Histogram'> | null
	funding: ISeriesApi<'Line'> | null
	oi: ISeriesApi<'Line'> | null
}

const MasterChart: React.FC<Props> = ({ pair }) => {
	const containerRef = useRef<HTMLDivElement>(null)
	const chartRef = useRef<IChartApi | null>(null)
	const candleRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
	const heatmapRef = useRef<ISeriesApi<'Custom'> | null>(null)
	const indicatorRefs = useRef<IndicatorSeriesRefs>({
		volume: null,
		cvd: null,
		liqBuy: null,
		liqSell: null,
		funding: null,
		oi: null,
	})
	const loadingOlderRef = useRef(false)
	const allLoadedRef = useRef(false)

	const timeframe = useTerminalStore(s => s.timeframe)
	const heatmapVisible = useTerminalStore(s => s.heatmapVisible)
	const indicators = useTerminalStore(s => s.indicators)
	const toggleIndicator = useTerminalStore(s => s.toggleIndicator)

	const [legend, setLegend] = useState<string>('')
	const [livePrice, setLivePrice] = useState<number | null>(null)
	const [priceDir, setPriceDir] = useState<'up' | 'down' | 'flat'>('flat')
	const prevPriceRef = useRef<number>(0)

	// Apply current store data to every existing series. Used after the chart is
	// rebuilt (indicator toggle / pair precision change) and after init events.
	const applyAllFromStore = (fitContent: boolean) => {
		const s = useTerminalStore.getState()
		candleRef.current?.setData(toCandlestickData(s.candles))
		const refs = indicatorRefs.current
		refs.volume?.setData(toVolumeData(s.candles))
		refs.cvd?.setData(toLineData(s.cvd))
		refs.liqBuy?.setData(toLiquidationBuy(s.liquidations))
		refs.liqSell?.setData(toLiquidationSell(s.liquidations))
		refs.funding?.setData(toFundingLineData(s.funding))
		refs.oi?.setData(toLineData(s.oi))

		if (heatmapRef.current) {
			const heatmapData: HeatmapDatum[] = s.footprints.map(f => {
				const cells = Object.entries(f.data).map(([priceStr, v]) => ({
					price: Number(priceStr),
					b: v.b,
					s: v.s,
				}))
				const prices = cells.map(c => c.price)
				return {
					time: toTime(f.time),
					cells,
					minPrice: Math.min(...prices),
					maxPrice: Math.max(...prices),
				} as HeatmapDatum
			})
			heatmapRef.current.setData(heatmapData as unknown as { time: Time }[])
			heatmapRef.current.applyOptions({ visible: heatmapVisible })
		}

		if (fitContent && s.candles.length > 0) {
			const total = s.candles.length
			const visible = Math.min(100, total)
			requestAnimationFrame(() => {
				chartRef.current?.timeScale().setVisibleLogicalRange({ from: total - visible, to: total - 1 })
			})
		}

		const lastCandle = s.candles[s.candles.length - 1]
		if (lastCandle) {
			const prev = prevPriceRef.current
			if (prev && lastCandle.close !== prev) {
				setPriceDir(lastCandle.close > prev ? 'up' : 'down')
			}
			prevPriceRef.current = lastCandle.close
			setLivePrice(lastCandle.close)
		}
	}

	useEffect(() => {
		if (!containerRef.current) return

		const chart = createChart(containerRef.current, {
			layout: {
				background: { color: '#161a22' },
				textColor: '#98A0B3',
				panes: { separatorColor: '#262b38', separatorHoverColor: '#2F2F40' },
			},
			grid: {
				vertLines: { color: 'rgba(38,43,56,0.5)' },
				horzLines: { color: 'rgba(38,43,56,0.5)' },
			},
			crosshair: { mode: CrosshairMode.Normal },
			rightPriceScale: { borderColor: '#262b38' },
			timeScale: { borderColor: '#262b38', timeVisible: true, secondsVisible: false },
			autoSize: true,
		})
		chartRef.current = chart

		const candle = chart.addSeries(CandlestickSeries, {
			upColor: '#4ade80',
			downColor: '#f87171',
			borderUpColor: '#4ade80',
			borderDownColor: '#f87171',
			wickUpColor: '#4ade80',
			wickDownColor: '#f87171',
			priceFormat: {
				type: 'price',
				precision: pair.precision,
				minMove: pair.tick,
			},
		})
		candleRef.current = candle

		const heatmap = chart.addCustomSeries(new HeatmapSeriesView(), {
			cellHeight: 3,
		})
		heatmapRef.current = heatmap

		chart.panes()[0].setStretchFactor(MAIN_PANE_STRETCH)

		chart.subscribeCrosshairMove(param => {
			if (!param.time || !param.seriesData) {
				setLegend('')
				return
			}
			const c = param.seriesData.get(candle)
			if (c && 'open' in c) {
				setLegend(
					`O ${c.open.toFixed(pair.precision)}  H ${c.high.toFixed(pair.precision)}  L ${c.low.toFixed(pair.precision)}  C ${c.close.toFixed(pair.precision)}`
				)
			}
		})

		const handleResize = () => chart.timeScale().fitContent()
		window.addEventListener('resize', handleResize)

		chart.timeScale().subscribeVisibleLogicalRangeChange(range => {
			if (!range || loadingOlderRef.current || allLoadedRef.current) return
			if (range.from < 500) {
				loadOlderCandles()
			}
		})

		return () => {
			window.removeEventListener('resize', handleResize)
			chart.remove()
			chartRef.current = null
			candleRef.current = null
			heatmapRef.current = null
			indicatorRefs.current = {
				volume: null,
				cvd: null,
				liqBuy: null,
				liqSell: null,
				funding: null,
				oi: null,
			}
		}
	}, [pair.precision])

	const loadOlderCandles = async () => {
		const s = useTerminalStore.getState()
		if (s.candles.length === 0 || loadingOlderRef.current || allLoadedRef.current) return
		loadingOlderRef.current = true
		try {
			const earliestSec = s.candles[0].time
			const beforeSec = earliestSec - 1
			const tf = useTerminalStore.getState().timeframe
			const before = s.candles.length
			await useTerminalStore.getState().loadOlder(beforeSec, tf, 500)
			const after = useTerminalStore.getState().candles.length
			const prepended = after - before
			if (prepended <= 0) {
				allLoadedRef.current = true
				return
			}
			const chart = chartRef.current
			const range = chart?.timeScale().getVisibleLogicalRange()
			applyAllFromStore(false)
			if (chart && range) {
				chart.timeScale().setVisibleLogicalRange({
					from: range.from + prepended,
					to: range.to + prepended,
				})
			}
		} catch (err) {
			console.error('[screener] Failed to load older candles:', err)
		} finally {
			loadingOlderRef.current = false
		}
	}

	// On first SSE init, backend currently delivers only a handful of bars
	// (sometimes just the live one). Eagerly fetch history so the chart has a
	// reasonable initial window instead of zooming onto a single candle.
	const loadInitialBackfill = async () => {
		const s = useTerminalStore.getState()
		if (s.candles.length === 0 || loadingOlderRef.current || allLoadedRef.current) return
		loadingOlderRef.current = true
		try {
			const earliestSec = s.candles[0].time
			const tf = useTerminalStore.getState().timeframe
			const before = s.candles.length
			await useTerminalStore.getState().loadOlder(earliestSec - 1, tf, 500)
			const after = useTerminalStore.getState().candles.length
			if (after === before) {
				allLoadedRef.current = true
				return
			}
			const chart = chartRef.current
			if (!chart) return
			const visible = Math.min(100, after)
			requestAnimationFrame(() => {
				chart.timeScale().setVisibleLogicalRange({ from: after - visible, to: after - 1 })
			})
		} catch (err) {
			console.error('[screener] initial backfill failed:', err)
		} finally {
			loadingOlderRef.current = false
		}
	}

	// Subscribe to /stream/chart for this pair+tf, and drive the chart imperatively
	// from store subscriptions so per-tick re-renders stay out of React.
	useEffect(() => {
		allLoadedRef.current = false
		loadingOlderRef.current = false

		// Track per-array length so we can decide between setData and update.
		let lastCandlesLen = 0
		let lastFootprintsLen = 0
		let lastCvdLen = 0
		let lastLiqLen = 0
		let lastFundingLen = 0
		let lastOiLen = 0

		const handleCandles = () => {
			const s = useTerminalStore.getState()
			const arr = s.candles
			if (arr.length === 0) {
				candleRef.current?.setData([])
				indicatorRefs.current.volume?.setData([])
				lastCandlesLen = 0
				return
			}
			// Full replace when length jumps non-monotonically (init / prepend / clear).
			if (arr.length < lastCandlesLen || arr.length - lastCandlesLen > 1) {
				candleRef.current?.setData(toCandlestickData(arr))
				indicatorRefs.current.volume?.setData(toVolumeData(arr))
			} else {
				// Update last only (tick or append-by-one).
				const last = arr[arr.length - 1]
				candleRef.current?.update({
					time: toTime(last.time),
					open: last.open,
					high: last.high,
					low: last.low,
					close: last.close,
				})
				indicatorRefs.current.volume?.update({
					time: toTime(last.time),
					value: last.volume,
					color:
						last.close >= last.open
							? 'rgba(74,222,128,0.45)'
							: 'rgba(248,113,113,0.45)',
				})
			}
			lastCandlesLen = arr.length

			// Live-price chrome.
			const prev = prevPriceRef.current
			const close = arr[arr.length - 1].close
			if (prev && close !== prev) {
				setPriceDir(close > prev ? 'up' : 'down')
			}
			prevPriceRef.current = close
			setLivePrice(close)
		}

		const handleFootprints = () => {
			const s = useTerminalStore.getState()
			const arr = s.footprints
			// Heatmap series uses setData; cheap enough not to micro-optimise yet.
			if (heatmapRef.current && (arr.length !== lastFootprintsLen || arr.length === 0)) {
				const data: HeatmapDatum[] = arr.map(f => {
					const cells = Object.entries(f.data).map(([priceStr, v]) => ({
						price: Number(priceStr),
						b: v.b,
						s: v.s,
					}))
					const prices = cells.map(c => c.price)
					return {
						time: toTime(f.time),
						cells,
						minPrice: Math.min(...prices),
						maxPrice: Math.max(...prices),
					} as HeatmapDatum
				})
				heatmapRef.current.setData(data as unknown as { time: Time }[])
			}
			lastFootprintsLen = arr.length
		}

		const handleCvd = () => {
			const arr = useTerminalStore.getState().cvd
			const ref = indicatorRefs.current.cvd
			if (!ref) {
				lastCvdLen = arr.length
				return
			}
			if (arr.length === 0) {
				ref.setData([])
			} else if (arr.length < lastCvdLen || arr.length - lastCvdLen > 1) {
				ref.setData(toLineData(arr))
			} else {
				const last = arr[arr.length - 1]
				ref.update({ time: toTime(last.time), value: last.value })
			}
			lastCvdLen = arr.length
		}

		const handleLiq = () => {
			const arr = useTerminalStore.getState().liquidations
			const buy = indicatorRefs.current.liqBuy
			const sell = indicatorRefs.current.liqSell
			if (!buy && !sell) {
				lastLiqLen = arr.length
				return
			}
			if (arr.length === 0) {
				buy?.setData([])
				sell?.setData([])
			} else if (arr.length < lastLiqLen || arr.length - lastLiqLen > 1) {
				buy?.setData(toLiquidationBuy(arr))
				sell?.setData(toLiquidationSell(arr))
			} else {
				const last = arr[arr.length - 1]
				buy?.update({
					time: toTime(last.time),
					value: last.buy_volume,
					color: 'rgba(74,222,128,0.7)',
				})
				sell?.update({
					time: toTime(last.time),
					value: -last.sell_volume,
					color: 'rgba(248,113,113,0.7)',
				})
			}
			lastLiqLen = arr.length
		}

		const handleFunding = () => {
			const arr = useTerminalStore.getState().funding
			const ref = indicatorRefs.current.funding
			if (!ref) {
				lastFundingLen = arr.length
				return
			}
			if (arr.length === 0) {
				ref.setData([])
			} else if (arr.length < lastFundingLen || arr.length - lastFundingLen > 1) {
				ref.setData(toFundingLineData(arr))
			} else {
				const last = arr[arr.length - 1]
				ref.update({ time: toTime(last.time), value: last.value })
			}
			lastFundingLen = arr.length
		}

		const handleOi = () => {
			const arr = useTerminalStore.getState().oi
			const ref = indicatorRefs.current.oi
			if (!ref) {
				lastOiLen = arr.length
				return
			}
			if (arr.length === 0) {
				ref.setData([])
			} else if (arr.length < lastOiLen || arr.length - lastOiLen > 1) {
				ref.setData(toLineData(arr))
			} else {
				const last = arr[arr.length - 1]
				ref.update({ time: toTime(last.time), value: last.value })
			}
			lastOiLen = arr.length
		}

		// Wire imperative subscriptions for each series.
		const unsubs = [
			useTerminalStore.subscribe(s => s.candles, handleCandles),
			useTerminalStore.subscribe(s => s.footprints, handleFootprints),
			useTerminalStore.subscribe(s => s.cvd, handleCvd),
			useTerminalStore.subscribe(s => s.liquidations, handleLiq),
			useTerminalStore.subscribe(s => s.funding, handleFunding),
			useTerminalStore.subscribe(s => s.oi, handleOi),
		]

		// Open the stream — this resets data then onInit fills it (triggers the
		// subscribers above which will setData on the lightweight-charts series).
		const unsubscribeStream = useTerminalStore.getState().subscribe(pair.code, timeframe)

		// Apply current state once on mount in case data already exists for this pair.
		applyAllFromStore(true)

		// After init populates data we want fitContent — handle via a one-shot.
		let didFit = false
		const fitUnsub = useTerminalStore.subscribe(s => s.candles, candles => {
			if (!didFit && candles.length > 0) {
				didFit = true
				const total = candles.length
				const visible = Math.min(100, total)
				requestAnimationFrame(() => {
					chartRef.current?.timeScale().setVisibleLogicalRange({ from: total - visible, to: total - 1 })
				})
				// If the SSE init delivered a thin slice (often only the current bar),
				// fetch history once so the chart isn't stuck zoomed on a handful of bars.
				if (total < 100) {
					void loadInitialBackfill()
				}
			}
		})

		return () => {
			fitUnsub()
			for (const u of unsubs) u()
			unsubscribeStream()
		}
	}, [pair.code, timeframe])

	useEffect(() => {
		const chart = chartRef.current
		if (!chart) return

		const refs = indicatorRefs.current
		const secondary: (ISeriesApi<'Line' | 'Histogram'> | null)[] = [
			refs.volume,
			refs.cvd,
			refs.liqBuy,
			refs.liqSell,
			refs.funding,
			refs.oi,
		]
		for (const s of secondary) {
			if (s) chart.removeSeries(s)
		}
		refs.volume = null
		refs.cvd = null
		refs.liqBuy = null
		refs.liqSell = null
		refs.funding = null
		refs.oi = null

		while (chart.panes().length > 1) {
			chart.removePane(chart.panes().length - 1)
		}

		if (indicators.volume) {
			chart.addPane()
			const idx = chart.panes().length - 1
			refs.volume = chart.addSeries(
				HistogramSeries,
				{
					priceFormat: { type: 'volume' },
					priceLineVisible: false,
					title: 'Volume',
				},
				idx
			)
		}
		if (indicators.cvd) {
			chart.addPane()
			const idx = chart.panes().length - 1
			refs.cvd = chart.addSeries(
				LineSeries,
				{ color: '#8AA6FF', lineWidth: 2, priceLineVisible: false, title: 'CVD' },
				idx
			)
		}
		if (indicators.funding) {
			chart.addPane()
			const idx = chart.panes().length - 1
			refs.funding = chart.addSeries(
				LineSeries,
				{
					color: '#fbbf24',
					lineWidth: 2,
					priceFormat: { type: 'price', precision: 4, minMove: 0.0001 },
					priceLineVisible: false,
					title: 'Funding',
				},
				idx
			)
			refs.funding.createPriceLine({
				price: 0,
				color: '#58587B',
				lineStyle: LineStyle.Dashed,
				lineWidth: 1,
				axisLabelVisible: false,
				title: '',
			})
		}
		if (indicators.liq) {
			chart.addPane()
			const idx = chart.panes().length - 1
			refs.liqBuy = chart.addSeries(
				HistogramSeries,
				{
					color: '#4ade80',
					priceFormat: { type: 'volume' },
					priceLineVisible: false,
					title: 'Liq Buy',
				},
				idx
			)
			refs.liqSell = chart.addSeries(
				HistogramSeries,
				{
					color: '#f87171',
					priceFormat: { type: 'volume' },
					priceLineVisible: false,
					title: 'Liq Sell',
				},
				idx
			)
		}
		if (indicators.oi) {
			chart.addPane()
			const idx = chart.panes().length - 1
			refs.oi = chart.addSeries(
				LineSeries,
				{
					color: '#D2D2FF',
					lineWidth: 2,
					priceLineVisible: false,
					title: 'OI',
					priceFormat: { type: 'volume' },
				},
				idx
			)
		}

		chart.panes()[0].setStretchFactor(MAIN_PANE_STRETCH)
		applyAllFromStore(false)
	}, [indicators])

	useEffect(() => {
		heatmapRef.current?.applyOptions({ visible: heatmapVisible })
	}, [heatmapVisible])

	const chipBase =
		'px-2.5 py-1 text-xs rounded-lg border transition-colors whitespace-nowrap shrink-0'
	const chipOn = 'bg-[#2F2F40] border-[#8AA6FF] text-[#D2D2FF]'
	const chipOff = 'bg-[#1A1A28] border-[#262b38] text-[#98A0B3] hover:text-[#D2D2FF]'

	return (
		<div className='bg-[#161a22] border border-[#262b38] rounded-2xl p-3 flex flex-col min-h-0 lg:h-full'>
			<div className='flex items-center justify-between mb-2 gap-2'>
				<div className='flex items-center gap-3'>
					<h3 className='text-base font-bold text-[#D2D2FF]'>
						{pair.coin}
						<span className='text-[#58587B] ml-1'>USDT</span>
					</h3>
					{livePrice !== null && (
						<span
							className={`text-base font-mono font-semibold transition-colors ${
								priceDir === 'up'
									? 'text-[#4ade80]'
									: priceDir === 'down'
									? 'text-[#f87171]'
									: 'text-[#D2D2FF]'
							}`}
						>
							{formatPrice(livePrice, pair.precision)}
						</span>
					)}
				</div>
				<div className='flex items-center gap-1.5 overflow-x-auto pb-1 -mr-1 pr-1'>
					{INDICATOR_ORDER.map(key => {
						const on = indicators[key]
						return (
							<button
								key={key}
								onClick={() => toggleIndicator(key)}
								className={`${chipBase} ${on ? chipOn : chipOff}`}
								title={`Toggle ${INDICATOR_LABELS[key]}`}
							>
								{INDICATOR_LABELS[key]}
							</button>
						)
					})}
					</div>
			</div>
			<div className='h-4 mb-1 text-xs text-[#98A0B3] font-mono whitespace-nowrap overflow-hidden'>
				{legend}
			</div>
			<div ref={containerRef} className='w-full flex-1' style={{ minHeight: 700 }} />
		</div>
	)
}

export default MasterChart
