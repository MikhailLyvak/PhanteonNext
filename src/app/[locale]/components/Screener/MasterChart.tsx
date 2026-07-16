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
	LineType,
	LogicalRange,
	Time,
} from 'lightweight-charts'
import { AssetPair } from '@/lib/screener/types'
import {
	useTerminalStore,
	INDICATOR_ORDER,
	INDICATOR_LABELS,
} from '@/store/Screener/useTerminalStore'
import {
	fundingToPercent,
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
import { useCustomTranslations } from '@/lib/contexts/translations/translations-context'
import { TKeys } from '@/i18n/t-keys'

interface Props {
	pair: AssetPair
	height?: number
	minHeight?: number
	maxHeight?: number
	onResize?: (next: number) => void
	sidebarWidth?: number
	minSidebarWidth?: number
	maxSidebarWidth?: number
	onResizeWidth?: (nextSidebarWidth: number) => void
}

interface IndicatorSeriesRefs {
	volume: ISeriesApi<'Histogram'> | null
	cvd: ISeriesApi<'Line'> | null
	liqBuy: ISeriesApi<'Histogram'> | null
	liqSell: ISeriesApi<'Histogram'> | null
	funding: ISeriesApi<'Line'> | null
	oi: ISeriesApi<'Line'> | null
}

// Shared options between the price chart and the indicators chart so they line
// up edge-to-edge. The minimum right-scale width keeps both charts' right edges
// aligned even when label widths differ slightly between price and indicator
// values — otherwise the time axis on the top chart would visually drift right
// of the indicator panes underneath.
const COMMON_CHART_OPTIONS = {
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
	rightPriceScale: { borderColor: '#262b38', minimumWidth: 80 },
	autoSize: true,
} as const

// Class for the top-left indicator title overlays we inject into each pane,
// used so we can find and clear them on rebuild.
const PANE_LABEL_CLASS = 'pane-indicator-label'

const MasterChart: React.FC<Props> = ({
	pair,
	height,
	minHeight = 360,
	maxHeight = 1600,
	onResize,
	sidebarWidth,
	minSidebarWidth = 220,
	maxSidebarWidth = 720,
	onResizeWidth,
}) => {
	const resizeStartRef = useRef<{ y: number; startHeight: number } | null>(null)
	const widthResizeStartRef = useRef<{ x: number; startSidebarWidth: number } | null>(null)

	const handleResizeStart = (e: React.PointerEvent<HTMLDivElement>) => {
		if (!onResize || height === undefined) return
		e.preventDefault()
		const target = e.currentTarget
		target.setPointerCapture(e.pointerId)
		resizeStartRef.current = { y: e.clientY, startHeight: height }
		document.body.style.cursor = 'row-resize'
		document.body.style.userSelect = 'none'
	}

	const handleResizeMove = (e: React.PointerEvent<HTMLDivElement>) => {
		const start = resizeStartRef.current
		if (!start || !onResize) return
		const delta = e.clientY - start.y
		const next = Math.min(maxHeight, Math.max(minHeight, start.startHeight + delta))
		onResize(next)
	}

	const handleResizeEnd = (e: React.PointerEvent<HTMLDivElement>) => {
		if (!resizeStartRef.current) return
		resizeStartRef.current = null
		try {
			e.currentTarget.releasePointerCapture(e.pointerId)
		} catch {}
		document.body.style.cursor = ''
		document.body.style.userSelect = ''
	}

	const handleWidthResizeStart = (e: React.PointerEvent<HTMLDivElement>) => {
		if (!onResizeWidth || sidebarWidth === undefined) return
		e.preventDefault()
		const target = e.currentTarget
		target.setPointerCapture(e.pointerId)
		widthResizeStartRef.current = { x: e.clientX, startSidebarWidth: sidebarWidth }
		document.body.style.cursor = 'col-resize'
		document.body.style.userSelect = 'none'
	}

	const handleWidthResizeMove = (e: React.PointerEvent<HTMLDivElement>) => {
		const start = widthResizeStartRef.current
		if (!start || !onResizeWidth) return
		// Dragging the handle right (positive delta) makes the chart wider and
		// the sidebar narrower — the chart sits left of the sidebar.
		const delta = e.clientX - start.x
		const next = Math.min(
			maxSidebarWidth,
			Math.max(minSidebarWidth, start.startSidebarWidth - delta),
		)
		onResizeWidth(next)
	}

	const handleWidthResizeEnd = (e: React.PointerEvent<HTMLDivElement>) => {
		if (!widthResizeStartRef.current) return
		widthResizeStartRef.current = null
		try {
			e.currentTarget.releasePointerCapture(e.pointerId)
		} catch {}
		document.body.style.cursor = ''
		document.body.style.userSelect = ''
	}

	const priceContainerRef = useRef<HTMLDivElement>(null)
	const indicatorsContainerRef = useRef<HTMLDivElement>(null)
	const priceChartRef = useRef<IChartApi | null>(null)
	const indicatorsChartRef = useRef<IChartApi | null>(null)
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
	// Re-entrancy guard for the price↔indicators time-range sync. Without it,
	// each setVisibleLogicalRange on one chart would fire the other chart's
	// subscriber, which would in turn fire the first chart's subscriber, ad
	// infinitum.
	const syncingRangeRef = useRef(false)
	// False until the first batch of candles has landed AND we've explicitly
	// positioned both charts on the most-recent window. Until then we suppress
	// the bidirectional range sync — otherwise each chart's setData triggers
	// its own auto-fit, the auto-fit ranges differ between the two charts
	// (price has 1 pane, indicators may have several), and whichever one fires
	// last clobbers the user's view, sometimes leaving the price chart zoomed
	// onto the very first candle.
	const initialPaintReadyRef = useRef(false)
	// True once the indicators chart has at least one series attached. Calling
	// setVisibleRange on a chart with zero series throws ("Cannot update
	// timeScale before the data is set"), so every sync target on the
	// indicators chart must gate on this — otherwise toggling off every
	// indicator chip crashes the page on the next sync tick.
	const hasIndicatorSeriesRef = useRef(false)

	const { t } = useCustomTranslations(TKeys.screener)

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
				priceChartRef.current?.timeScale().setVisibleLogicalRange({ from: total - visible, to: total - 1 })
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
		if (!priceContainerRef.current || !indicatorsContainerRef.current) return

		// Top chart: price + heatmap, with a visible time axis directly underneath.
		const priceChart = createChart(priceContainerRef.current, {
			...COMMON_CHART_OPTIONS,
			timeScale: {
				borderColor: '#262b38',
				timeVisible: true,
				secondsVisible: false,
				visible: true,
			},
		})
		priceChartRef.current = priceChart

		// Bottom chart: indicator panes only. Time axis hidden because the top
		// chart already shows it — the two charts share their visible range via
		// the sync callbacks below.
		const indicatorsChart = createChart(indicatorsContainerRef.current, {
			...COMMON_CHART_OPTIONS,
			timeScale: {
				borderColor: '#262b38',
				timeVisible: true,
				secondsVisible: false,
				visible: false,
			},
		})
		indicatorsChartRef.current = indicatorsChart

		const candle = priceChart.addSeries(CandlestickSeries, {
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

		const heatmap = priceChart.addCustomSeries(new HeatmapSeriesView(), {
			cellHeight: 3,
		})
		heatmapRef.current = heatmap

		priceChart.subscribeCrosshairMove(param => {
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

		// Sync the vertical crosshair (the dotted time line) between the two
		// charts so hovering one draws the same dotted line on the other at the
		// matching time. The hovered point's own value is passed as the price —
		// the price and indicator scales differ wildly, so the horizontal line
		// lands off-scale and only the vertical time line shows through, which is
		// exactly the line we want duplicated.
		const firstIndicatorSeries = (): ISeriesApi<'Line' | 'Histogram'> | null => {
			const r = indicatorRefs.current
			return r.volume || r.cvd || r.funding || r.oi || r.liqBuy || r.liqSell
		}
		priceChart.subscribeCrosshairMove(param => {
			const target = firstIndicatorSeries()
			if (!target) return
			if (param.time === undefined) {
				indicatorsChart.clearCrosshairPosition()
				return
			}
			const c = param.seriesData.get(candle) as { close?: number } | undefined
			indicatorsChart.setCrosshairPosition(c?.close ?? 0, param.time, target)
		})
		indicatorsChart.subscribeCrosshairMove(param => {
			if (param.time === undefined) {
				priceChart.clearCrosshairPosition()
				return
			}
			let value = 0
			param.seriesData.forEach(d => {
				const v = (d as { value?: number }).value
				if (v !== undefined) value = v
			})
			priceChart.setCrosshairPosition(value, param.time, candle)
		})

		const handleResize = () => {
			priceChart.timeScale().fitContent()
		}
		window.addEventListener('resize', handleResize)

		// Bidirectional sync: panning/zooming either chart drives the other so
		// price and indicators always show the same time window. The scroll-back
		// trigger lives on the price chart's subscriber so it fires off the same
		// barsInLogicalRange check we used before the split.
		// Sync via TIME range, not logical indices. The two charts can have
		// different unified time bases internally (e.g. OI on indicators chart
		// uses 5m bins which may extend further back than the candle series on
		// the price chart), so the same logical index doesn't necessarily map
		// to the same time. Time is absolute and consistent between charts.
		//
		// Exception: when the source is scrolled past its latest bar into empty
		// space on the right, getVisibleRange() clamps to actual data and drops
		// that whitespace, which would snap the other pane back to its last bar.
		// In that case we instead copy the zoom (barSpacing) and the scroll
		// offset directly, so both panes pan freely into the empty area on the
		// right and stay aligned there.
		const mirrorView = (source: IChartApi | null, target: IChartApi | null) => {
			if (!source || !target) return
			const sourceTs = source.timeScale()
			const targetTs = target.timeScale()
			const scrollPos = sourceTs.scrollPosition()
			if (scrollPos > 0.5) {
				targetTs.applyOptions({ barSpacing: sourceTs.options().barSpacing })
				targetTs.scrollToPosition(scrollPos, false)
				return
			}
			const timeRange = sourceTs.getVisibleRange()
			if (timeRange) targetTs.setVisibleRange(timeRange)
		}
		const onPriceRangeChange = (range: LogicalRange | null) => {
			if (
				initialPaintReadyRef.current &&
				!syncingRangeRef.current &&
				hasIndicatorSeriesRef.current
			) {
				syncingRangeRef.current = true
				try {
					mirrorView(priceChartRef.current, indicatorsChartRef.current)
				} finally {
					syncingRangeRef.current = false
				}
			}
			if (!range || loadingOlderRef.current || allLoadedRef.current) return
			const barsInfo = candleRef.current?.barsInLogicalRange(range)
			if (!barsInfo) return
			if (barsInfo.barsBefore < LOAD_OLDER_THRESHOLD) {
				loadOlderCandles()
			}
		}
		const onIndicatorsRangeChange = () => {
			if (!initialPaintReadyRef.current || syncingRangeRef.current) return
			syncingRangeRef.current = true
			try {
				mirrorView(indicatorsChartRef.current, priceChartRef.current)
			} finally {
				syncingRangeRef.current = false
			}
		}
		priceChart.timeScale().subscribeVisibleLogicalRangeChange(onPriceRangeChange)
		indicatorsChart.timeScale().subscribeVisibleLogicalRangeChange(onIndicatorsRangeChange)

		return () => {
			window.removeEventListener('resize', handleResize)
			priceChart.remove()
			indicatorsChart.remove()
			priceChartRef.current = null
			indicatorsChartRef.current = null
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

	const emptyResponsesRef = useRef(0)
	const EMPTY_RETRY_THRESHOLD = 5
	// Pull more history when the visible window has fewer than this many bars
	// to the left of the data start. Small natural value — each new scroll
	// re-triggers another fetch.
	const LOAD_OLDER_THRESHOLD = 500

	const loadOlderCandles = async (): Promise<void> => {
		if (loadingOlderRef.current || allLoadedRef.current) return
		const s = useTerminalStore.getState()
		if (s.candles.length === 0) return
		loadingOlderRef.current = true
		const timeRangeBefore = priceChartRef.current?.timeScale().getVisibleRange() ?? null
		try {
			const earliestSec = s.candles[0].time
			const beforeSec = earliestSec - 1
			const tf = useTerminalStore.getState().timeframe
			const before = s.candles.length
			await useTerminalStore.getState().loadOlder(beforeSec, tf, 1500)
			const after = useTerminalStore.getState().candles.length
			if (after === before) {
				emptyResponsesRef.current += 1
				if (emptyResponsesRef.current >= EMPTY_RETRY_THRESHOLD) {
					allLoadedRef.current = true
				}
				console.warn(
					`[screener] loadOlder returned no new candles (attempt ${emptyResponsesRef.current}/${EMPTY_RETRY_THRESHOLD})`,
				)
			} else {
				emptyResponsesRef.current = 0
				if (timeRangeBefore) {
					queueMicrotask(() => {
						syncingRangeRef.current = true
						try {
							priceChartRef.current?.timeScale().setVisibleRange(timeRangeBefore)
							if (hasIndicatorSeriesRef.current) {
								indicatorsChartRef.current?.timeScale().setVisibleRange(timeRangeBefore)
							}
						} finally {
							syncingRangeRef.current = false
						}
					})
				}
			}
		} catch (err) {
			console.error('[screener] Failed to load older candles:', err)
		} finally {
			loadingOlderRef.current = false
		}
	}

	const loadInitialBackfill = async () => {
		const s = useTerminalStore.getState()
		if (s.candles.length === 0 || loadingOlderRef.current || allLoadedRef.current) return
		loadingOlderRef.current = true
		try {
			const earliestSec = s.candles[0].time
			const tf = useTerminalStore.getState().timeframe
			const before = s.candles.length
			await useTerminalStore.getState().loadOlder(earliestSec - 1, tf, 1500)
			const after = useTerminalStore.getState().candles.length
			if (after === before) {
				allLoadedRef.current = true
				return
			}
			const chart = priceChartRef.current
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
		emptyResponsesRef.current = 0
		initialPaintReadyRef.current = false

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
			const isFirstFill = lastCandlesLen === 0
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

			// First time we put real data on the chart: position both charts on
			// the most-recent window via a TIME range. Deferred to a microtask
			// so every other handle* subscriber has a chance to commit its
			// setData first — otherwise their late range-adjustments (each
			// setData on indicatorsChart triggers an auto-fit) would clobber
			// the position we set here.
			if (isFirstFill && arr.length > 0) {
				const total = arr.length
				const visible = Math.min(100, total)
				const fromT = arr[total - visible].time
				const toT = arr[total - 1].time
				queueMicrotask(() => {
					const state = useTerminalStore.getState()
					if (state.candles.length === 0) return
					const range = { from: toTime(fromT), to: toTime(toT) }
					syncingRangeRef.current = true
					try {
						priceChartRef.current?.timeScale().setVisibleRange(range)
						if (hasIndicatorSeriesRef.current) {
							indicatorsChartRef.current?.timeScale().setVisibleRange(range)
						}
					} finally {
						syncingRangeRef.current = false
					}
					initialPaintReadyRef.current = true
				})
			}

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
				ref.update({
					time: toTime(last.time),
					value: fundingToPercent(last.value),
				})
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

		const unsubs = [
			useTerminalStore.subscribe(s => s.candles, handleCandles),
			useTerminalStore.subscribe(s => s.footprints, handleFootprints),
			useTerminalStore.subscribe(s => s.cvd, handleCvd),
			useTerminalStore.subscribe(s => s.liquidations, handleLiq),
			useTerminalStore.subscribe(s => s.funding, handleFunding),
			useTerminalStore.subscribe(s => s.oi, handleOi),
		]

		const unsubscribeStream = useTerminalStore.getState().subscribe(pair.code, timeframe)

		applyAllFromStore(true)

		// Backfill watchdog: if the initial fetch returns a very thin window
		// (<100 candles), pull more history so the chart isn't stuck on a tiny
		// slice. The visible range itself is positioned by handleCandles above.
		let didBackfillCheck = false
		const fitUnsub = useTerminalStore.subscribe(s => s.candles, candles => {
			if (!didBackfillCheck && candles.length > 0) {
				didBackfillCheck = true
				if (candles.length < 100) {
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
		const chart = indicatorsChartRef.current
		if (!chart) return

		// Remove any pane labels left over from the previous build. Most panes are
		// destroyed (and their DOM with them) on rebuild, but pane 0 is reused —
		// its label would otherwise stack up on every indicator toggle.
		indicatorsContainerRef.current
			?.querySelectorAll(`.${PANE_LABEL_CLASS}`)
			.forEach(el => el.remove())

		const refs = indicatorRefs.current
		const existing: (ISeriesApi<'Line' | 'Histogram'> | null)[] = [
			refs.volume,
			refs.cvd,
			refs.liqBuy,
			refs.liqSell,
			refs.funding,
			refs.oi,
		]
		for (const s of existing) {
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

		// Reuse pane 0 for the first enabled indicator, then addPane for each
		// subsequent one. Without this the chart would always have an empty
		// pane 0 stretching across the top of the indicators block.
		let firstPaneTaken = false
		const nextPaneIdx = () => {
			if (!firstPaneTaken) {
				firstPaneTaken = true
				return 0
			}
			chart.addPane()
			return chart.panes().length - 1
		}

		// Indicator titles are drawn as our own top-left overlay (injected below)
		// instead of the lightweight-charts built-in series `title`, which renders
		// on the right next to the last value. Collect (paneIdx, text, color) as
		// each series is created, then anchor a label into each pane's element.
		const paneLabels: { idx: number; text: string; color: string }[] = []

		if (indicators.volume) {
			const idx = nextPaneIdx()
			refs.volume = chart.addSeries(
				HistogramSeries,
				{
					priceFormat: { type: 'volume' },
					priceLineVisible: false,
				},
				idx
			)
			paneLabels.push({ idx, text: 'Volume', color: '#98A0B3' })
		}
		if (indicators.cvd) {
			const idx = nextPaneIdx()
			refs.cvd = chart.addSeries(
				LineSeries,
				{ color: '#8AA6FF', lineWidth: 2, priceLineVisible: false },
				idx
			)
			paneLabels.push({ idx, text: 'CVD', color: '#8AA6FF' })
		}
		if (indicators.funding) {
			const idx = nextPaneIdx()
			refs.funding = chart.addSeries(
				LineSeries,
				{
					color: '#FACC15',
					lineWidth: 2,
					lineType: LineType.WithSteps,
					priceFormat: { type: 'price', precision: 4, minMove: 0.0001 },
					priceLineVisible: false,
				},
				idx
			)
			paneLabels.push({ idx, text: 'Funding', color: '#FACC15' })
			refs.funding.createPriceLine({
				price: 0,
				color: '#58587B',
				lineStyle: LineStyle.Dashed,
				lineWidth: 1,
				axisLabelVisible: false,
				title: '',
			})
		}
		if (indicators.oi) {
			const idx = nextPaneIdx()
			refs.oi = chart.addSeries(
				LineSeries,
				{
					color: '#D2D2FF',
					lineWidth: 2,
					priceLineVisible: false,
					priceFormat: { type: 'volume' },
				},
				idx
			)
			paneLabels.push({ idx, text: 'OI', color: '#D2D2FF' })
		}
		// Liq pane disabled for now — see INDICATOR_ORDER in useTerminalStore.
		// Persisted state may still have `liq: true` from before the toggle was
		// hidden, so we gate on a constant here too.
		const LIQ_PANE_ENABLED = false
		if (LIQ_PANE_ENABLED && indicators.liq) {
			const idx = nextPaneIdx()
			refs.liqBuy = chart.addSeries(
				HistogramSeries,
				{
					color: '#4ade80',
					priceFormat: { type: 'volume' },
					priceLineVisible: false,
				},
				idx
			)
			refs.liqSell = chart.addSeries(
				HistogramSeries,
				{
					color: '#f87171',
					priceFormat: { type: 'volume' },
					priceLineVisible: false,
				},
				idx
			)
			paneLabels.push({ idx, text: 'Liq', color: '#98A0B3' })
		}

		hasIndicatorSeriesRef.current =
			refs.volume !== null ||
			refs.cvd !== null ||
			refs.liqBuy !== null ||
			refs.liqSell !== null ||
			refs.funding !== null ||
			refs.oi !== null

		// Anchor a title at the top-left of each indicator pane. Deferred a frame
		// so lightweight-charts has laid out the freshly-created panes and their
		// DOM elements are resolvable via getHTMLElement().
		requestAnimationFrame(() => {
			for (const { idx, text, color } of paneLabels) {
				const paneEl = chart.panes()[idx]?.getHTMLElement()
				if (!paneEl) continue
				if (getComputedStyle(paneEl).position === 'static') {
					paneEl.style.position = 'relative'
				}
				const label = document.createElement('div')
				label.className = PANE_LABEL_CLASS
				label.textContent = text
				label.style.position = 'absolute'
				label.style.top = '4px'
				label.style.left = '8px'
				label.style.zIndex = '3'
				label.style.fontSize = '11px'
				label.style.fontWeight = '600'
				label.style.fontFamily = 'monospace'
				label.style.color = color
				label.style.pointerEvents = 'none'
				label.style.userSelect = 'none'
				paneEl.appendChild(label)
			}
		})

		applyAllFromStore(false)

		// After rebuilding indicator series, force the indicators chart to match
		// the price chart's visible TIME range so the two stay aligned through
		// the re-render. Logical sync wouldn't work because the indicators
		// chart's time base just changed (different series → different time
		// scale union). Skipped when no series exist — setVisibleRange on an
		// empty chart throws.
		const timeRange = priceChartRef.current?.timeScale().getVisibleRange()
		if (timeRange && hasIndicatorSeriesRef.current) {
			syncingRangeRef.current = true
			try {
				chart.timeScale().setVisibleRange(timeRange)
			} finally {
				syncingRangeRef.current = false
			}
		}
	}, [indicators])

	useEffect(() => {
		heatmapRef.current?.applyOptions({ visible: heatmapVisible })
	}, [heatmapVisible])

	const chipBase =
		'px-2.5 py-1 text-xs rounded-lg border transition-colors whitespace-nowrap shrink-0'
	const chipOn = 'bg-[#2F2F40] border-[#8AA6FF] text-[#D2D2FF]'
	const chipOff = 'bg-[#1A1A28] border-[#262b38] text-[#98A0B3] hover:text-[#D2D2FF]'

	// Only count the user-toggleable indicators — `indicators.liq` may be
	// stuck true from a previous persisted state but isn't rendered, so it
	// shouldn't keep the empty bottom chart open.
	const hasAnyIndicator = INDICATOR_ORDER.some(key => indicators[key])

	return (
		<div className='bg-[#161a22] border border-[#262b38] rounded-2xl p-3 flex flex-col min-h-0 h-full relative'>
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
								title={t.tooltips.toggleIndicator({ indicator: INDICATOR_LABELS[key] })}
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
			<div className='flex-1 flex flex-col min-h-0' style={{ minHeight: 0 }}>
				<div
					ref={priceContainerRef}
					className='w-full'
					style={{ flexGrow: 3, flexShrink: 1, flexBasis: 0, minHeight: 0 }}
				/>
				<div
					ref={indicatorsContainerRef}
					className='w-full'
					style={{
						// Collapse to zero height when no indicator is active —
						// otherwise the empty bottom chart reads as an orphan
						// pane (which users have called "the liquidations pane").
						flexGrow: hasAnyIndicator ? 2 : 0,
						flexShrink: 1,
						flexBasis: 0,
						minHeight: 0,
						display: hasAnyIndicator ? undefined : 'none',
					}}
				/>
			</div>
			{onResize && (
				<div
					onPointerDown={handleResizeStart}
					onPointerMove={handleResizeMove}
					onPointerUp={handleResizeEnd}
					onPointerCancel={handleResizeEnd}
					role='separator'
					aria-orientation='horizontal'
					aria-label='Resize chart height'
					title={t.tooltips.dragResizeChart}
					className='group absolute left-0 right-0 -bottom-1 h-3 flex items-center justify-center cursor-row-resize touch-none z-10'
				>
					<div className='h-1 w-16 rounded-full bg-[#262b38] group-hover:bg-[#8AA6FF] transition-colors' />
				</div>
			)}
			{onResizeWidth && (
				<div
					onPointerDown={handleWidthResizeStart}
					onPointerMove={handleWidthResizeMove}
					onPointerUp={handleWidthResizeEnd}
					onPointerCancel={handleWidthResizeEnd}
					role='separator'
					aria-orientation='vertical'
					aria-label='Resize chart width'
					title={t.tooltips.dragResizeChartWidth}
					className='group absolute top-0 bottom-0 -right-1 w-3 flex items-center justify-center cursor-col-resize touch-none z-10'
				>
					<div className='w-1 h-16 rounded-full bg-[#262b38] group-hover:bg-[#8AA6FF] transition-colors' />
				</div>
			)}
		</div>
	)
}

export default MasterChart
