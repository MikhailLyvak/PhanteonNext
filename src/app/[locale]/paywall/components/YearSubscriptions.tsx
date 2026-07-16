'use client'

import { useId, useState } from 'react'
import { useCreateSubscriptionPayment } from '@/hooks/Subscriptions/useCreateSubscriptionPayment'
import { Triangle } from 'react-loader-spinner'
import { SubscriptionPaymentResponse } from '@/api/Subscriptions'
import { useUserStore } from '@/store/UserData/useUserStore'
import { useAuthModalStore } from '@/store/AuthModal/useAuthModalStore'
import { useCustomTranslations } from '@/lib/contexts/translations/translations-context'
import { TKeys } from '@/i18n/t-keys'

const YearSubscriptions = () => {
	const [selectedMonth, setSelectedMonth] = useState<'6' | '12'>('6')
	const nameId = useId()
	const { mutate: createPayment, isPending } = useCreateSubscriptionPayment()
	const { user } = useUserStore()
	const { toggleModal, setActiveTab } = useAuthModalStore()
	const { t } = useCustomTranslations(TKeys.paywall)

	const handlePurchase = () => {
		if (!user) {
			setActiveTab('register')
			toggleModal()
			return
		}
		const durationMonths = selectedMonth === '6' ? 6 : 12

		createPayment(
			{
				subscription_type: 'yearly',
				duration_months: durationMonths,
			},
			{
				onSuccess: (data: SubscriptionPaymentResponse) => {
					if (data.payment_url) {
						window.location.href = data.payment_url
					} else {
						alert(t.noPaymentUrl)
						console.error('No payment URL in response')
					}
				},
				onError: (error: any) => {
					console.error('Payment request failed:', error)

					// Обробляємо різні типи помилок
					if (error.response?.status === 400) {
						const errorDetail =
							error.response.data?.detail || 'Помилка валідації даних'
						alert(t.paymentError({ detail: errorDetail }))
					} else if (error.response?.status === 500) {
						alert(t.serverError)
					} else if (error.response?.data?.error === 'Payment gateway error') {
						const detail =
							error.response.data.detail || 'Помилка платіжного шлюзу'
						alert(t.gatewayError({ detail }))
					} else {
						alert(t.unexpectedError)
					}
				},
			}
		)
	}

	return (
		<div className='flex flex-col items-center justify-start bg-[#242433] rounded-[32px] pt-[30px] pb-[26px] flex-1 lg:border-none border-2 border-[#D2D2FF]'>
			<div className='mb-5'>
				<div className='flex gap-2 items-start mb-1'>
					<div className='line-through lg:text-2xl text-xl text-gray-300'>
						{t.oldPrice}
					</div>
					<div className='lg:text-4xl font-bold  text-2xl'>{t.price} </div>
				</div>
				<div className='text-sx text-gray-400 text-center mx-auto'>
					{t.priceUntil}
				</div>
			</div>
			<form className='flex items-start gap-3 mb-6'>
				<div className='flex gap-2.5 items-center'>
					<label
						className='relative flex items-center cursor-pointer justify-center'
						htmlFor='radio1'
					>
						<input
							id='radio1'
							name={`month-${nameId}`}
							type='radio'
							value='1'
							checked={selectedMonth === '6'}
							onChange={() => setSelectedMonth('6')}
							className='peer h-[28px] w-[28px] cursor-pointer appearance-none rounded-full border-2 border-[#d2d2ff8c] checked:border-[#d2d2ff8c] transition-opacity'
						/>
						<span
							className={`pointer-events-none absolute bg-[#D2D2FF] w-[18px] h-[18px] rounded-full transition-opacity duration-150 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
								selectedMonth === '6' ? 'opacity-100' : 'opacity-0'
							}`}
						/>
					</label>
					<div>{t.sixMonths}</div>
				</div>
				<div className='flex gap-2.5 items-center'>
					<label
						className='relative flex items-center cursor-pointer justify-center'
						htmlFor='radio1'
					>
						<input
							id='radio1'
							name={`month-${nameId}`}
							type='radio'
							value='1'
							checked={selectedMonth === '12'}
							onChange={() => setSelectedMonth('12')}
							className='peer h-[28px] w-[28px] cursor-pointer appearance-none rounded-full border-2 border-[#d2d2ff8c] checked:border-[#d2d2ff8c] transition-opacity'
						/>
						<span
							className={`pointer-events-none absolute bg-[#D2D2FF] w-[18px] h-[18px] rounded-full transition-opacity duration-150 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
								selectedMonth === '12' ? 'opacity-100' : 'opacity-0'
							}`}
						/>
					</label>
					<div>{t.oneYear}</div>
				</div>
			</form>
			<div className='flex-col gap-[36px] items-center justify-start w-full text-center font-bold hidden lg:flex'>
				<div className=''>{t.featureAll}</div>
				<div className=''>{t.featureIncluded} </div>
				<div className=''>{t.featureAllMeetings}</div>
				<div className=''>{t.featureUnlimitedRequests}</div>
				<div className=''>{t.featureUnlimited}</div>
				<div className=''>{t.featureUnlimited}</div>
				<div className=''>{t.featureBlogUnlim}</div>
			</div>
			<div className='flex flex-col items-center justify-start mt-[22px] w-full px-5 text-center text-white lg:hidden'>
				<div className='mt-[8px] flex flex-col items-center w-full'>
					<div className='text-[13px] font-medium text-[#ffffff7c]'>{t.featureModules}</div>
					<div className='mt-[3px] mb-[11px] font-bold text-[13px]'>{t.featureAll}</div>
					<div className=' h-px rounded-full w-full bg-[#FFFFFF1A]' />
				</div>
				<div className='mt-[8px] flex flex-col items-center w-full'>
					<div className='text-[13px] font-medium text-[#ffffff7c]'>
						{t.featureWorkbook}
					</div>
					<div className='mt-[3px] mb-[11px] font-bold text-[13px]'>
						{t.featureIncluded}
					</div>
					<div className=' h-px rounded-full w-full bg-[#FFFFFF1A]' />
				</div>
				<div className='mt-[8px] flex flex-col items-center w-full'>
					<div className='text-[13px] font-medium text-[#ffffff7c]'>
						{t.featureWorkshops}
					</div>
					<div className='mt-[3px] mb-[11px] font-bold text-[13px]'>
						{t.featureAllMeetings}
					</div>
					<div className=' h-px rounded-full w-full bg-[#FFFFFF1A]' />
				</div>
				<div className='mt-[8px] flex flex-col items-center w-full'>
					<div className='text-[13px] font-medium text-[#ffffff7c]'>
						{t.featureAiAgents}
					</div>
					<div className='mt-[3px] mb-[11px] font-bold text-[13px]'>
						{t.featureUnlimitedRequests}
					</div>
					<div className=' h-px rounded-full w-full bg-[#FFFFFF1A]' />
				</div>
				<div className='mt-[8px] flex flex-col items-center w-full'>
					<div className='text-[13px] font-medium text-[#ffffff7c]'>
						{t.featureScreener}
					</div>
					<div className='mt-[3px] mb-[11px] font-bold text-[13px]'>
						{t.featureUnlimited}
					</div>
					<div className=' h-px rounded-full w-full bg-[#FFFFFF1A]' />
				</div>
				<div className='mt-[8px] flex flex-col items-center w-full'>
					<div className='text-[13px] font-medium text-[#ffffff7c]'>
						{t.featureIndicators}
					</div>
					<div className='mt-[3px] mb-[11px] font-bold text-[13px]'>
						{t.featureUnlimited}
					</div>
					<div className=' h-px rounded-full w-full bg-[#FFFFFF1A]' />
				</div>
				<div className='mt-[8px] flex flex-col items-center w-full'>
					<div className='text-[13px] font-medium text-[#ffffff7c]'>{t.featureBlog}</div>
					<div className='mt-[3px] mb-[11px] font-bold text-[13px]'>{t.featureBlogUnlim}</div>
					<div className=' h-px rounded-full w-full bg-[#FFFFFF1A]' />
				</div>
			</div>
			<button
				type='button'
				className='bg-[#6A56E4] rounded-full py-[19px] px-[39px] font-semibold mt-[36px] text-white flex items-center justify-center gap-2'
				onClick={handlePurchase}
				disabled={isPending}
			>
				{isPending && (
					<Triangle
						visible={true}
						height={16}
						width={16}
						color='#fff'
						ariaLabel='triangle-loading'
					/>
				)}
				{t.purchase}
			</button>
		</div>
	)
}

export default YearSubscriptions
