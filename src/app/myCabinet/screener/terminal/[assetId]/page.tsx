'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import MyCabinetBreadCrump from '../../../studyPlatform/components/BreadCrump'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import MasterChart from '@/app/components/Screener/MasterChart'
import FeedTabs from '@/app/components/Screener/FeedTabs'
import TimeframeToggle from '@/app/components/Screener/TimeframeToggle'
import { getPairByCode } from '@/lib/screener/mock/pairs'

const TerminalPage = () => {
	const params = useParams<{ assetId: string }>()
	const router = useRouter()
	const assetId = (params?.assetId ?? '').toUpperCase()
	const pair = getPairByCode(assetId)

	return (
		<ProtectedRoute>
			<div className='w-full pb-24'>
				<div className='max-w-8xl mx-auto px-4 md:px-6'>
					<div className='mt-6'>
						<MyCabinetBreadCrump currentPageTitle={pair ? `${pair.coin}/USDT` : 'Термінал'} />
					</div>
					<div className='mt-6 flex items-center justify-between gap-3 flex-wrap'>
						<button
							onClick={() => router.push('/myCabinet/screener')}
							className='inline-flex items-center gap-2 px-3 py-2 text-sm text-[#98A0B3] hover:text-[#D2D2FF] bg-[#1A1A28] border border-[#262b38] rounded-lg transition-colors'
						>
							<ArrowLeft size={16} />
							Назад до скрінера
						</button>
						{pair && <TimeframeToggle />}
					</div>
					{!pair ? (
						<div className='mt-12 text-center text-[#98A0B3]'>
							Пара не знайдена: {assetId}
						</div>
					) : (
						<div className='mt-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 lg:h-[calc(100vh-220px)] lg:min-h-[600px]'>
							<MasterChart pair={pair} />
							<div className='h-[420px] lg:h-auto lg:contents'>
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
