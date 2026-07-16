'use client'

import React from 'react'
import { Wallet, X } from 'lucide-react'

interface Props {
	onClose: () => void
}

const DepositHeader = ({ onClose }: Props) => {
	return (
		<div className='flex items-start justify-between gap-4'>
			<div className='flex items-start gap-3'>
				<div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#6A56E4]/20 text-[#A99CFF]'>
					<Wallet className='h-6 w-6' />
				</div>
				<div className='flex flex-col'>
					<h6 className='text-xl font-semibold text-[#D2D2FF]'>Депозит</h6>
					<p className='text-sm text-[#8c8ca0]'>
						Надішліть USDT на свою депозитну адресу
					</p>
				</div>
			</div>
			<button
				type='button'
				onClick={onClose}
				aria-label='Закрити'
				className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1D1D2A] text-[#8c8ca0] transition hover:text-[#D2D2FF]'
			>
				<X className='h-5 w-5' />
			</button>
		</div>
	)
}

export default DepositHeader
