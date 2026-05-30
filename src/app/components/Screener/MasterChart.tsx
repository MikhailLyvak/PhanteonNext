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
import { AssetPair, ChartInitPayload } from '@/lib/screener/types'
import {
	useTerminalStore,
	INDICATOR_ORDER,
	INDICATOR_LABELS,
} from '@/store/Screener/useTerminalStore'
import { getChartInit } from '@/lib/screener/mock/chart'
import {
	toCandlestickData,
	toFundingLineData,
	toLineData,
	toLiquidationBuy,
	toLiquidationSell,
	toTime,
	toVolumeData,
} from './chartUtils'
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

	const timeframe = useTerminalStore(s => s.timeframe)
	const heatmapVisible = useTerminalStore(s => s.heatmapVisible)
	const toggleHeatmap = useTerminalStore(s => s.toggleHeatmap)
	const indicators = useTerminalStore(s => s.indicators)
	const toggleIndicator = useTerminalStore(s => s.toggleIndicator)

	const [legend, setLegend] = useState<string>('')

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

	const applySeriesData = () => {
		const p = payloadRef.current
		if (!p) return
		candleRef.current?.setData(toCandlestickData(p.candles))
		const refs = indicatorRefs.current
		refs.volume?.setData(toVolumeData(p.candles))
		refs.cvd?.setData(toLineData(p.cvd))
		refs.liqBuy?.setData(toLiquidationBuy(p.liquidations))
		refs.liqSell?.setData(toLiquidationSell(p.liquidations))
		refs.funding?.setData(toFundingLineData(p.funding))
		refs.oi?.setData(toLineData(p.oi))

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
		chartRef.current?.timeScale().fitContent()
	}

	useEffect(() => {
		let cancelled = false
		const load = async () => {
			const payload = await getChartInit(pair.code, timeframe)
			if (cancelled) return
			payloadRef.current = payload
			applySeriesData()
		}
		load()
		return () => {
			cancelled = true
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

	const onLoadOlder = () => {
		// TODO(real-data): implement infinite backward scroll - request 6000 more candles, prepend via setData
		console.warn('[screener] Load older not wired (mock-only)')
	}

	const chipBase =
		'px-2.5 py-1 text-xs rounded-lg border transition-colors whitespace-nowrap shrink-0'
	const chipOn = 'bg-[#2F2F40] border-[#8AA6FF] text-[#D2D2FF]'
	const chipOff = 'bg-[#1A1A28] border-[#262b38] text-[#98A0B3] hover:text-[#D2D2FF]'

	return (
		<div className='bg-[#161a22] border border-[#262b38] rounded-2xl p-3 flex flex-col min-h-0'>
			<div className='flex items-center justify-between mb-2 gap-2'>
				<h3 className='text-base font-bold text-[#D2D2FF]'>
					{pair.coin}
					<span className='text-[#58587B] ml-1'>USDT</span>
				</h3>
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
					<button
						onClick={toggleHeatmap}
						className={`${chipBase} ${heatmapVisible ? chipOn : chipOff}`}
						title='Toggle Heatmap'
					>
						Heatmap
					</button>
					<span className='mx-0.5 h-4 w-px bg-[#262b38] shrink-0' />
					<button
						onClick={onLoadOlder}
						className={`${chipBase} ${chipOff}`}
						title='Load older candles'
					>
						Load older
					</button>
				</div>
			</div>
			<div className='h-4 mb-1 text-xs text-[#98A0B3] font-mono whitespace-nowrap overflow-hidden'>
				{legend}
			</div>
			<div ref={containerRef} className='w-full flex-1' style={{ minHeight: 480 }} />
		</div>
	)
}

export default MasterChart
