'use client'

import React from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import { useCustomTranslations } from '@/lib/contexts/translations/translations-context'
import { TKeys } from '@/i18n/t-keys'

interface Props {
	mode: 'pending' | 'failed'
	onRefresh: () => void
	isRefreshing: boolean
}

const WalletPendingState = ({ mode, onRefresh, isRefreshing }: Props) => {
	const { t } = useCustomTranslations(TKeys.tradingBots)
	const title =
		mode === 'failed'
			? t.walletFailedTitle
			: t.walletPendingTitle
	const description =
		mode === 'failed'
			? t.walletFailedDesc
			: t.walletPendingDesc

	return (
		<div className='mt-6 flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-[#1D1D2A] p-6 text-center'>
			<div className='flex h-12 w-12 items-center justify-center rounded-full bg-[#6A56E4]/20 text-[#A99CFF]'>
				<Loader2
					className={
						isRefreshing ? 'h-6 w-6 animate-spin' : 'h-6 w-6 animate-pulse'
					}
				/>
			</div>
			<div className='flex flex-col gap-1'>
				<h6 className='text-base font-semibold text-[#D2D2FF]'>{title}</h6>
				<p className='text-sm text-[#8c8ca0]'>{description}</p>
			</div>
			<button
				type='button'
				onClick={onRefresh}
				disabled={isRefreshing}
				className='inline-flex items-center gap-2 rounded-3xl bg-[#6A56E4] px-5 py-2.5 text-sm font-medium text-white transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60'
			>
				<RefreshCw
					className={isRefreshing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'}
				/>
				{t.refresh}
			</button>
		</div>
	)
}

export default WalletPendingState
