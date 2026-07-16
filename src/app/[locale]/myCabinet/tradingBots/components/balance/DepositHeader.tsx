'use client'

import React from 'react'
import { Wallet, X } from 'lucide-react'
import { useCustomTranslations } from '@/lib/contexts/translations/translations-context'
import { TKeys } from '@/i18n/t-keys'

interface Props {
	onClose: () => void
}

const DepositHeader = ({ onClose }: Props) => {
	const { t } = useCustomTranslations(TKeys.tradingBots)
	return (
		<div className='flex items-start justify-between gap-4'>
			<div className='flex items-start gap-3'>
				<div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#6A56E4]/20 text-[#A99CFF]'>
					<Wallet className='h-6 w-6' />
				</div>
				<div className='flex flex-col'>
					<h6 className='text-xl font-semibold text-[#D2D2FF]'>{t.depositTitle}</h6>
					<p className='text-sm text-[#8c8ca0]'>
						{t.depositDesc}
					</p>
				</div>
			</div>
			<button
				type='button'
				onClick={onClose}
				aria-label={t.closeLabel}
				className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1D1D2A] text-[#8c8ca0] transition hover:text-[#D2D2FF]'
			>
				<X className='h-5 w-5' />
			</button>
		</div>
	)
}

export default DepositHeader
