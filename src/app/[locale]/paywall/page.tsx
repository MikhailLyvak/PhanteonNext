'use client'

import { useEffect } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useGetUserSubscriptions } from '@/hooks/Subscriptions/useGetUserSubscriptions'
import MyCabinetBreadCrump from '../myCabinet/studyPlatform/components/BreadCrump'
import MonthSubscriptions from './components/MonthSubscription'
import YearSubscriptions from './components/YearSubscriptions'

const PaywallPage = () => {
	const router = useRouter()
	const {
		data: subscriptionsData,
		isLoading,
		error,
	} = useGetUserSubscriptions()

	useEffect(() => {
		if (!isLoading && subscriptionsData?.has_active_subscription) {
			router.push('/myCabinet/studyPlatform')
		}
	}, [subscriptionsData, isLoading, router])

	if (isLoading) {
		return <div></div>
	}

	return (
		<div className='w-full mb-5'>
			<div className='max-w-8xl mx-auto px-4 md:px-6'>
				<div className='mt-6'>
					<MyCabinetBreadCrump currentPageTitle='Придбати підписку' />
				</div>

				<div className='mt-6 mx-auto'>
					<h6 className='text-white text-2xl md:text-4xl font-bold mx-auto text-center lg:text-left'>
						Придбати підписку
					</h6>
				</div>
				<div className='border-2 border-[#D2D2FF] rounded-[48px] bg-[#2424336B] mt-20 py-6 pl-4 pr-6 items-center w-full text-white gap-6 relative hidden lg:flex'>
					<div className='flex flex-col items-start justify-center gap-[36px] flex-1 mt-[42px]'>
						<div className='ml-6 font-medium'>Модулі</div>
						<div className='ml-6 font-medium'>Воркбук</div>
						<div className='ml-6 font-medium'>Воркшопи</div>
						<div className='ml-6 font-medium'>Аі-агенти</div>
						<div className='ml-6 font-medium'>Скрінер</div>
						<div className='ml-6 font-medium'>Авторські індекатори</div>
						<div className='ml-6 font-medium'>Блог</div>
					</div>
					{/* <MonthSubscriptions /> */}
					<div className='flex flex-col gap-[58px] mt-[48px] absolute w-auto left-[15px] right-[40px]'>
						<div className=' h-px rounded-full bg-[#FFFFFF1A]' />
						<div className=' h-px rounded-full bg-[#FFFFFF1A]' />
						<div className=' h-px rounded-full bg-[#FFFFFF1A]' />
						<div className=' h-px rounded-full bg-[#FFFFFF1A]' />
						<div className=' h-px rounded-full bg-[#FFFFFF1A]' />
						<div className=' h-px rounded-full bg-[#FFFFFF1A]' />
					</div>
					<YearSubscriptions />
				</div>
				<div className='flex flex-col gap-6 w-full mt-[22px] lg:hidden'>
					{/* <MonthSubscriptions /> */}
					<YearSubscriptions />
				</div>
			</div>
		</div>
	)
}

export default PaywallPage
