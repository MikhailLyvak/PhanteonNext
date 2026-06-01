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
import { AssetPair, Candle, ChartInitPayload } from '@/lib/screener/types'
import {
	useTerminalStore,
	INDICATOR_ORDER,
	INDICATOR_LABELS,
} from '@/store/Screener/useTerminalStore'
import { getChartInitFromBinance, fetchKlines } from '@/api/Screener/getBinanceKlines'
import {
	fetchOIHistory,
	fetchCurrentOI,
	fetchTakerHistory,
	fetchFundingHistory,
	computeCVDFromCandles,
	TF_TO_INDICATOR_PERIOD,
	aggregateOI,
	aggregateLiquidations,
	aggregateFunding,
} from '@/api/Screener/getBinanceIndicators'
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
	const payloadRef = useRef<ChartInitPayload | null>(null)
	const loadingOlderRef = useRef(false)
	const allLoadedRef = useRef(false)
	const oiAllLoadedRef = useRef(false)
	const liqAllLoadedRef = useRef(false)
	const fundingAllLoadedRef = useRef(false)

	const timeframe = useTerminalStore(s => s.timeframe)
	const heatmapVisible = useTerminalStore(s => s.heatmapVisible)
	const indicators = useTerminalStore(s => s.indicators)
	const toggleIndicator = useTerminalStore(s => s.toggleIndicator)

	const [legend, setLegend] = useState<string>('')
	const [livePrice, setLivePrice] = useState<number | null>(null)
	const [priceDir, setPriceDir] = useState<'up' | 'down' | 'flat'>('flat')
	const prevPriceRef = useRef<number>(0)

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
		const p = payloadRef.current
		if (!p || p.candles.length === 0 || loadingOlderRef.current || allLoadedRef.current) return
		loadingOlderRef.current = true
		try {
			const earliestMs = p.candles[0].time * 1000 - 1
			const tf = useTerminalStore.getState().timeframe
			const batch1 = await fetchKlines(pair.code, tf, 1500, { endTime: earliestMs })
			if (batch1.length === 0) {
				allLoadedRef.current = true
				return
			}
			const older = batch1
			if (older.length === 0) {
				allLoadedRef.current = true
				return
			}

			// Fetch older Funding
			if (!fundingAllLoadedRef.current && p.funding.length > 0) {
				try {
					const batch = await fetchFundingHistory(pair.code, 1000, undefined, p.funding[0].time * 1000 - 1)
					if (batch.length > 0) {
						const earliest = p.funding[0].time
						const filtered = batch.filter(d => d.time < earliest)
						if (filtered.length > 0) p.funding = [...filtered, ...p.funding]
						else fundingAllLoadedRef.current = true
					} else {
						fundingAllLoadedRef.current = true
					}
				} catch { fundingAllLoadedRef.current = true }
			}

			const chart = chartRef.current
			const range = chart?.timeScale().getVisibleLogicalRange()
			const prepended = older.length
			p.candles = [...older, ...p.candles]
			p.cvd = computeCVDFromCandles(p.candles)
			applySeriesData(false)
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

	const applyIndicatorData = () => {
		const p = payloadRef.current
		if (!p) return
		const tf = useTerminalStore.getState().timeframe
		const refs = indicatorRefs.current
		const aggLiq = aggregateLiquidations(p.liquidations, p.candles, tf)
		refs.liqBuy?.setData(toLiquidationBuy(aggLiq))
		refs.liqSell?.setData(toLiquidationSell(aggLiq))
		refs.funding?.setData(toFundingLineData(aggregateFunding(p.funding, p.candles, tf)))
		refs.oi?.setData(toLineData(aggregateOI(p.oi, p.candles, tf)))
	}

	const applySeriesData = (fitContent = true) => {
		const p = payloadRef.current
		if (!p) return
		const tf = useTerminalStore.getState().timeframe
		candleRef.current?.setData(toCandlestickData(p.candles))
		const refs = indicatorRefs.current
		refs.volume?.setData(toVolumeData(p.candles))
		refs.cvd?.setData(toLineData(p.cvd))
		const aggLiq = aggregateLiquidations(p.liquidations, p.candles, tf)
		refs.liqBuy?.setData(toLiquidationBuy(aggLiq))
		refs.liqSell?.setData(toLiquidationSell(aggLiq))
		refs.funding?.setData(toFundingLineData(aggregateFunding(p.funding, p.candles, tf)))
		refs.oi?.setData(toLineData(aggregateOI(p.oi, p.candles, tf)))

		if (heatmapRef.current) {
			const heatmapData: HeatmapDatum[] = p.footprints.map(f => {
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
		if (fitContent && p.candles.length > 0) {
			const total = p.candles.length
			const visible = Math.min(100, total)
			requestAnimationFrame(() => {
				chartRef.current?.timeScale().setVisibleLogicalRange({ from: total - visible, to: total - 1 })
			})
		}
	}

	useEffect(() => {
		let cancelled = false
		let pollTimer: ReturnType<typeof setInterval> | null = null
		let indicatorPollTimer: ReturnType<typeof setInterval> | null = null
		allLoadedRef.current = false
		loadingOlderRef.current = false
		oiAllLoadedRef.current = false
		liqAllLoadedRef.current = false
		fundingAllLoadedRef.current = false

		const period = TF_TO_INDICATOR_PERIOD[timeframe]

		const pollLatestKline = async () => {
			try {
				const res = await fetch(
					`https://fapi.binance.com/fapi/v1/klines?symbol=${pair.code}&interval=${timeframe}&limit=1`
				)
				if (!res.ok || cancelled) return
				const raw: unknown[][] = await res.json()
				if (raw.length === 0) return
				const k = raw[0]
				const candle: Candle = {
					time: Math.floor((k[0] as number) / 1000),
					open: parseFloat(k[1] as string),
					high: parseFloat(k[2] as string),
					low: parseFloat(k[3] as string),
					close: parseFloat(k[4] as string),
					volume: parseFloat(k[5] as string),
					takerBuyVolume: parseFloat(k[9] as string),
				}

				candleRef.current?.update({
					time: toTime(candle.time),
					open: candle.open,
					high: candle.high,
					low: candle.low,
					close: candle.close,
				})

				const prev = prevPriceRef.current
				if (prev && candle.close !== prev) {
					setPriceDir(candle.close > prev ? 'up' : 'down')
				}
				prevPriceRef.current = candle.close
				setLivePrice(candle.close)

				const refs = indicatorRefs.current
				if (refs.volume) {
					refs.volume.update({
						time: toTime(candle.time),
						value: candle.volume,
						color: candle.close >= candle.open
							? 'rgba(74,222,128,0.45)'
							: 'rgba(248,113,113,0.45)',
					})
				}

				const p = payloadRef.current
				if (p) {
					const last = p.candles[p.candles.length - 1]
					if (last && last.time === candle.time) {
						p.candles[p.candles.length - 1] = candle
					} else {
						p.candles.push(candle)
					}

					// Update CVD
					if (refs.cvd) {
						const delta = candle.takerBuyVolume - (candle.volume - candle.takerBuyVolume)
						const prevCvd = p.cvd.length > 1 ? p.cvd[p.cvd.length - 2]?.value ?? 0 : 0
						const isUpdate = p.cvd.length > 0 && p.cvd[p.cvd.length - 1].time === candle.time
						const cvdValue = isUpdate ? prevCvd + delta : (p.cvd[p.cvd.length - 1]?.value ?? 0) + delta
						const cvdPoint = { time: candle.time, value: cvdValue }
						if (isUpdate) {
							p.cvd[p.cvd.length - 1] = cvdPoint
						} else {
							p.cvd.push(cvdPoint)
						}
						refs.cvd.update({ time: toTime(cvdPoint.time), value: cvdPoint.value })
					}
				}
			} catch {
				// ignore poll errors
			}
		}

		const pollIndicators = async () => {
			try {
				const p = payloadRef.current
				if (!p || cancelled) return
				const refs = indicatorRefs.current

				const [oiResult, takerResult, fundingResult] = await Promise.allSettled([
					fetchCurrentOI(pair.code),
					fetchTakerHistory(pair.code, period, 1),
					fetchFundingHistory(pair.code, 1),
				])

				if (cancelled) return

				if (oiResult.status === 'fulfilled' && refs.oi) {
					const { oi, time } = oiResult.value
					const point = { time, value: oi }
					const data = p.oi
					if (data.length > 0 && data[data.length - 1].time === point.time) {
						data[data.length - 1] = point
					} else {
						data.push(point)
					}
					refs.oi.update({ time: toTime(point.time), value: point.value })
				}

				if (takerResult.status === 'fulfilled' && takerResult.value.length > 0) {
					const d = takerResult.value[0]
					const data = p.liquidations
					if (data.length > 0 && data[data.length - 1].time === d.time) {
						data[data.length - 1] = d
					} else {
						data.push(d)
					}
					if (refs.liqBuy) {
						refs.liqBuy.update({
							time: toTime(d.time),
							value: d.buy_volume,
							color: 'rgba(74,222,128,0.7)',
						})
					}
					if (refs.liqSell) {
						refs.liqSell.update({
							time: toTime(d.time),
							value: -d.sell_volume,
							color: 'rgba(248,113,113,0.7)',
						})
					}
				}

				if (fundingResult.status === 'fulfilled' && fundingResult.value.length > 0 && refs.funding) {
					const f = fundingResult.value[fundingResult.value.length - 1]
					const data = p.funding
					if (data.length > 0 && data[data.length - 1].time === f.time) {
						data[data.length - 1] = f
					} else {
						data.push(f)
					}
					refs.funding.update({ time: toTime(f.time), value: f.value })
				}
			} catch {
				// ignore indicator poll errors
			}
		}

		const load = async () => {
			try {
				const payload = await getChartInitFromBinance(pair.code, timeframe)
				if (cancelled) return
				payloadRef.current = payload
				const lastCandle = payload.candles[payload.candles.length - 1]
				if (lastCandle) {
					setLivePrice(lastCandle.close)
					prevPriceRef.current = lastCandle.close
				}

				// Show candles + CVD immediately
				payload.cvd = computeCVDFromCandles(payload.candles)
				applySeriesData()
				pollTimer = setInterval(pollLatestKline, 1000)

				// Load indicators in background, start indicator poll after done
				loadIndicators(payload)
			} catch (err) {
				console.error('[screener] Failed to fetch Binance klines:', err)
			}
		}

		const loadIndicators = async (payload: ChartInitPayload) => {
			const [currentOIResult, fundingResult] = await Promise.allSettled([
				fetchCurrentOI(pair.code),
				fetchFundingHistory(pair.code),
			])
			if (cancelled) return

			if (fundingResult.status === 'fulfilled') {
				payload.funding = fundingResult.value
				applyIndicatorData()
			}

			// Fetch all OI data using endTime backwards pagination
			try {
				const first = await fetchOIHistory(pair.code, period, 500)
				if (first.length > 0) {
					payload.oi = first
					applyIndicatorData()
					while (!cancelled) {
						try {
							const endMs = payload.oi[0].time * 1000 - 1
							const batch = await fetchOIHistory(pair.code, period, 500, { endTime: endMs })
							if (batch.length === 0) break
							const filtered = batch.filter(d => d.time < payload.oi[0].time)
							if (filtered.length === 0) break
							payload.oi = [...filtered, ...payload.oi]
							if (batch.length < 500) break
						} catch { break }
					}
				}
			} catch { /* no OI data available */ }
			oiAllLoadedRef.current = true

			if (currentOIResult.status === 'fulfilled') {
				const { oi, time } = currentOIResult.value
				const point = { time, value: oi }
				const data = payload.oi
				if (data.length > 0 && data[data.length - 1].time === point.time) {
					data[data.length - 1] = point
				} else if (data.length === 0 || point.time > data[data.length - 1].time) {
					data.push(point)
				}
			}
			applyIndicatorData()

			// Fetch all Liquidation data using endTime backwards pagination
			try {
				const first = await fetchTakerHistory(pair.code, period, 500)
				if (first.length > 0) {
					payload.liquidations = first
					applyIndicatorData()
					while (!cancelled) {
						try {
							const endMs = payload.liquidations[0].time * 1000 - 1
							const batch = await fetchTakerHistory(pair.code, period, 500, { endTime: endMs })
							if (batch.length === 0) break
							const filtered = batch.filter(d => d.time < payload.liquidations[0].time)
							if (filtered.length === 0) break
							payload.liquidations = [...filtered, ...payload.liquidations]
							if (batch.length < 500) break
						} catch { break }
					}
				}
			} catch { /* no liquidation data available */ }
			liqAllLoadedRef.current = true
			applyIndicatorData()

			// Start indicator poll only after all historical data is loaded
			if (!cancelled) {
				indicatorPollTimer = setInterval(pollIndicators, 5000)
			}
		}

		load()
		return () => {
			cancelled = true
			if (pollTimer) clearInterval(pollTimer)
			if (indicatorPollTimer) clearInterval(indicatorPollTimer)
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
		applySeriesData()
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
