'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'
import MyCabinetBreadCrump from '../studyPlatform/components/BreadCrump'
import Sidebar from '../components/Sidebar'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import ApiCreationForm from './components/ApiCreationForm'
import RobotCreationFormWithSelector from './components/RobotCreationFormWithSelector'
import RobotDetailCard from './components/RobotDetailCard'
import TradingBotsLanding from './components/TradingBotsLanding'
import BalanceCard from './components/balance/BalanceCard'

type Step = 'api' | 'robot' | 'detail'

const isStep = (value: string | null): value is Step =>
	value === 'api' || value === 'robot' || value === 'detail'

const TradingBotsPage = () => {
	const searchParams = useSearchParams()
	const rawStep = searchParams.get('step')
	const step: Step | null = isStep(rawStep) ? rawStep : null

	return (
		<ProtectedRoute>
			<div className='w-full pb-24'>
				<div className='max-w-8xl mx-auto px-4 md:px-6'>
					<div className='mt-6'>
						<MyCabinetBreadCrump currentPageTitle='Торгові роботи' />
					</div>

					<div className='mt-6'>
						<h6 className='text-[#D2D2FF] text-xl md:text-4xl font-bold'>
							Особистий кабінет
						</h6>
					</div>

					<div className='flex w-full mt-8'>
						<div className='hidden xl:block w-[312px] shrink-0 sticky top-[140px]'>
							<div className='h-fit'>
								<Sidebar />
							</div>
						</div>

						<div className='flex flex-col w-full sm:ml-10'>
							<h6 className='text-[#D2D2FF] text-xl md:text-3xl font-bold'>
								Торгові роботи
							</h6>
							<div className='mt-[30px]'>
								<BalanceCard />
							</div>
							<div className='p-6 bg-[#242433] rounded-2xl flex-1'>
								{step === 'api' && <ApiCreationForm />}
								{step === 'robot' && <RobotCreationFormWithSelector />}
								{step === 'detail' && <RobotDetailCard />}
								{!step && <TradingBotsLanding />}
							</div>
						</div>
					</div>
				</div>
			</div>
		</ProtectedRoute>
	)
}

export default TradingBotsPage
