'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import MyCabinetBreadCrump from '../../../studyPlatform/components/BreadCrump'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import MasterChart from '@/app/components/Screener/MasterChart'
import FeedTabs from '@/app/components/Screener/FeedTabs'
import TimeframeToggle from '@/app/components/Screener/TimeframeToggle'
import LivePrice from '@/app/components/Screener/LivePrice'
import { getFuturesPairByCode } from '@/api/Screener/getBinanceFuturesPairs'
import { AssetPair } from '@/lib/screener/types'

const TerminalPage = () => {
	const params = useParams<{ assetId: string }>()
	const router = useRouter()
	const assetId = (params?.assetId ?? '').toUpperCase()
	const [pair, setPair] = useState<AssetPair | null | undefined>(undefined)

	useEffect(() => {
		getFuturesPairByCode(assetId)
			.then(p => setPair(p ?? null))
			.catch(() => setPair(null))
	}, [assetId])

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
						<div className='mt-12 text-center text-[#98A0B3]'>
							Завантаження...
						</div>
					) : !pair ? (
						<div className='mt-12 text-center text-[#98A0B3]'>
							Пара не знайдена: {assetId}
						</div>
					) : (
						<div className='mt-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] lg:grid-rows-[760px] gap-4'>
							<div className='flex flex-col gap-4 min-h-0'>
								<MasterChart pair={pair} />
							</div>
							<div className='h-[420px] lg:h-full min-h-0'>
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
