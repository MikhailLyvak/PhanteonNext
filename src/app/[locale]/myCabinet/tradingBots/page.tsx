'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import ApiCreationForm from './components/ApiCreationForm'
import RobotCreationFormWithSelector from './components/RobotCreationFormWithSelector'
import RobotDetailCard from './components/RobotDetailCard'
import TradingBotsLanding from './components/TradingBotsLanding'
import BalanceCard from './components/balance/BalanceCard'
import { useCustomTranslations } from '@/lib/contexts/translations/translations-context'
import { TKeys } from '@/i18n/t-keys'

type Step = 'api' | 'robot' | 'detail'

const isStep = (value: string | null): value is Step =>
	value === 'api' || value === 'robot' || value === 'detail'

const TradingBotsPage = () => {
	const searchParams = useSearchParams()
	const rawStep = searchParams.get('step')
	const step: Step | null = isStep(rawStep) ? rawStep : null
	const { t } = useCustomTranslations(TKeys.tradingBots)

	return (
		<ProtectedRoute>
			<div className='w-full pb-24'>
				<div className='max-w-8xl mx-auto px-4 md:px-6'>
					<div className='mt-6'>
						<h6 className='text-[#D2D2FF] text-xl md:text-4xl font-bold'>
							{t.pageTitle}
						</h6>
					</div>

					<div className='mt-8'>
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
		</ProtectedRoute>
	)
}

export default TradingBotsPage
