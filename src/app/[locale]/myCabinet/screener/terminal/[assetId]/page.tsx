'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import MyCabinetBreadCrump from '../../../studyPlatform/components/BreadCrump'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import MasterChart from '@components/Screener/MasterChart'
import FeedTabs from '@components/Screener/FeedTabs'
import TimeframeToggle from '@components/Screener/TimeframeToggle'
import LivePrice from '@components/Screener/LivePrice'
import TerminalSkeleton from '@components/Screener/TerminalSkeleton'
import { extractPairs, getDashboard } from '@/api/Screener/client'
import { AssetPair } from '@/lib/screener/types'

const CHART_HEIGHT_STORAGE_KEY = 'screener.terminal.chartHeight'
const SIDEBAR_WIDTH_STORAGE_KEY = 'screener.terminal.sidebarWidth'
const MIN_CHART_HEIGHT = 360
const MAX_CHART_HEIGHT = 1600
const DEFAULT_CHART_HEIGHT = 760
const MIN_SIDEBAR_WIDTH = 220
const MAX_SIDEBAR_WIDTH = 720
const DEFAULT_SIDEBAR_WIDTH = 320

const TerminalPage = () => {
	const params = useParams<{ assetId: string }>()
	const router = useRouter()
	const assetId = (params?.assetId ?? '').toUpperCase()
	const [pair, setPair] = useState<AssetPair | null | undefined>(undefined)
	const [chartHeight, setChartHeight] = useState<number>(DEFAULT_CHART_HEIGHT)
	const [sidebarWidth, setSidebarWidth] = useState<number>(DEFAULT_SIDEBAR_WIDTH)
	const [isDesktop, setIsDesktop] = useState<boolean>(false)

	useEffect(() => {
		const mq = window.matchMedia('(min-width: 1024px)')
		const apply = () => setIsDesktop(mq.matches)
		apply()
		mq.addEventListener('change', apply)
		return () => mq.removeEventListener('change', apply)
	}, [])

	useEffect(() => {
		getDashboard()
			.then(snapshot => {
				const pairs = extractPairs(snapshot)
				setPair(pairs.find(p => p.code === assetId) ?? null)
			})
			.catch(() => setPair(null))
	}, [assetId])

	useEffect(() => {
		try {
			const storedH = window.localStorage.getItem(CHART_HEIGHT_STORAGE_KEY)
			if (storedH) {
				const parsed = Number.parseInt(storedH, 10)
				if (Number.isFinite(parsed)) {
					setChartHeight(Math.min(MAX_CHART_HEIGHT, Math.max(MIN_CHART_HEIGHT, parsed)))
				}
			}
			const storedW = window.localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY)
			if (storedW) {
				const parsed = Number.parseInt(storedW, 10)
				if (Number.isFinite(parsed)) {
					setSidebarWidth(Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, parsed)))
				}
			}
		} catch {}
	}, [])

	const handleResize = (next: number) => {
		const clamped = Math.min(MAX_CHART_HEIGHT, Math.max(MIN_CHART_HEIGHT, next))
		setChartHeight(clamped)
		try {
			window.localStorage.setItem(CHART_HEIGHT_STORAGE_KEY, String(clamped))
		} catch {}
	}

	const handleResizeWidth = (next: number) => {
		const clamped = Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, next))
		setSidebarWidth(clamped)
		try {
			window.localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(clamped))
		} catch {}
	}

	return (
		<ProtectedRoute>
			<div className='w-full pb-24'>
				<div className='max-w-8xl mx-auto px-4 md:px-6'>
					<div className='mt-6'>
						<MyCabinetBreadCrump currentPageTitle={pair ? `${pair.coin}/USDT` : 'Термінал'} />
					</div>
					<div className='mt-6 flex items-center justify-between gap-3 flex-wrap'>
						<div className='flex items-center gap-4'>
							<button
								onClick={() => router.push('/myCabinet/screener')}
								className='inline-flex items-center gap-2 px-3 py-2 text-sm text-[#98A0B3] hover:text-[#D2D2FF] bg-[#1A1A28] border border-[#262b38] rounded-lg transition-colors'
							>
								<ArrowLeft size={16} />
								Назад до скрінера
							</button>
							{pair && <LivePrice pair={pair} />}
						</div>
						{pair && <TimeframeToggle />}
					</div>
					{pair === undefined ? (
						<TerminalSkeleton />
					) : !pair ? (
						<div className='mt-12 text-center text-[#98A0B3]'>
							Пара не знайдена: {assetId}
						</div>
					) : (
						<div
							className='mt-6 grid grid-cols-1 gap-4'
							style={{
								gridTemplateRows: `${chartHeight}px`,
								...(isDesktop && {
									gridTemplateColumns: `minmax(0, 1fr) ${sidebarWidth}px`,
								}),
							}}
						>
							<div className='flex flex-col gap-4 min-h-0 min-w-0'>
								<MasterChart
									pair={pair}
									height={chartHeight}
									onResize={handleResize}
									minHeight={MIN_CHART_HEIGHT}
									maxHeight={MAX_CHART_HEIGHT}
									sidebarWidth={sidebarWidth}
									onResizeWidth={isDesktop ? handleResizeWidth : undefined}
									minSidebarWidth={MIN_SIDEBAR_WIDTH}
									maxSidebarWidth={MAX_SIDEBAR_WIDTH}
								/>
							</div>
							<div className='h-[420px] lg:h-full min-h-0 min-w-0'>
								<FeedTabs pair={pair} />
							</div>
						</div>
					)}
				</div>
			</div>
		</ProtectedRoute>
	)
}

export default TerminalPage
