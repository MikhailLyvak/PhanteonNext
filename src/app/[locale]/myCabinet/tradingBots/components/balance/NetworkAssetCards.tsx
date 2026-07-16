'use client'

import React from 'react'
import Image from 'next/image'
import { NETWORK, ASSET } from './constants'
import { useCustomTranslations } from '@/lib/contexts/translations/translations-context'
import { TKeys } from '@/i18n/t-keys'

const NetworkAssetCards = () => {
	const { t } = useCustomTranslations(TKeys.tradingBots)
	return (
		<div className='mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2'>
			<div className='flex items-center gap-3 rounded-xl border border-white/10 bg-[#1D1D2A] p-3'>
				<div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F0B90B]/20 text-[#F0B90B]'>
					<Image
						src='/Exchange/binance.png'
						alt={NETWORK.name}
						width={28}
						height={28}
						className='rounded-full'
					/>
				</div>
				<div className='flex flex-col'>
					<span className='text-[10px] uppercase tracking-wide text-[#8c8ca0]'>
						{t.network}
					</span>
					<span className='text-sm font-semibold text-[#D2D2FF]'>
						{NETWORK.name}
					</span>
					<span className='text-[11px] text-[#8c8ca0]'>{NETWORK.subname}</span>
				</div>
			</div>
			<div className='flex items-center gap-3 rounded-xl border border-white/10 bg-[#1D1D2A] p-3'>
				<div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300'>
					<span className='text-sm font-bold'>₮</span>
				</div>
				<div className='flex flex-col'>
					<span className='text-[10px] uppercase tracking-wide text-[#8c8ca0]'>
						{t.asset}
					</span>
					<span className='text-sm font-semibold text-[#D2D2FF]'>
						{ASSET.symbol}
					</span>
					<span className='text-[11px] text-[#8c8ca0]'>{ASSET.name}</span>
				</div>
			</div>
		</div>
	)
}

export default NetworkAssetCards
