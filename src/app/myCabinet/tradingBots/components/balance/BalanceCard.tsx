'use client'

import React, { useState } from 'react'
import { Plus, Wallet } from 'lucide-react'
import useUserBalance from '@/hooks/TradingBots/useUserBalance'
import DepositModal from './DepositModal'

const formatBalance = (value: number | null) => {
	if (value === null) return '—'
	return value.toLocaleString('en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})
}

const BalanceCard = () => {
	const { balance, isLoading } = useUserBalance()
	const [open, setOpen] = useState(false)

	return (
		<>
			<div className='mb-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-[#2A2A3D] via-[#242433] to-[#1F1F2C] p-5 sm:flex-row sm:items-center'>
				<div className='flex items-center gap-4'>
					<div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#6A56E4]/20 text-[#A99CFF]'>
						<Wallet className='h-6 w-6' />
					</div>
					<div className='flex flex-col'>
						<span className='text-xs uppercase tracking-wide text-[#8c8ca0]'>
							Баланс платформи
						</span>
						<span className='text-2xl font-semibold text-[#D2D2FF]'>
							{isLoading ? (
								<span className='inline-block h-7 w-24 animate-pulse rounded bg-[#1D1D2A]' />
							) : (
								<>${formatBalance(balance)}</>
							)}
						</span>
					</div>
				</div>
				<button
					type='button'
					onClick={() => setOpen(true)}
					className='inline-flex items-center gap-2 rounded-3xl bg-[#6A56E4] px-5 py-2.5 text-sm font-medium text-white transition hover:shadow-xl'
				>
					<Plus className='h-4 w-4' />
					Поповнити
				</button>
			</div>
			<DepositModal open={open} onClose={() => setOpen(false)} />
		</>
	)
}

export default BalanceCard
