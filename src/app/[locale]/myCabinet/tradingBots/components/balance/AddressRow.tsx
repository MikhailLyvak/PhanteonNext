'use client'

import React, { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { NETWORK } from './constants'

interface Props {
	address: string
}

const AddressRow = ({ address }: Props) => {
	const [copied, setCopied] = useState(false)

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(address)
			setCopied(true)
			window.setTimeout(() => setCopied(false), 1200)
		} catch {
			// Clipboard API can fail in unsupported / non-secure contexts. We
			// silently swallow — user still sees the address and can copy
			// manually. No UX regression.
		}
	}

	return (
		<div className='mt-5'>
			<p className='mb-2 text-xs uppercase tracking-wide text-[#8c8ca0]'>
				Адреса для поповнення
			</p>
			<div className='flex items-center gap-3 rounded-xl border border-white/10 bg-[#1D1D2A] p-3'>
				<span className='shrink-0 rounded-md bg-[#6A56E4]/20 px-2 py-1 text-[10px] font-semibold tracking-wide text-[#A99CFF]'>
					{NETWORK.badge}
				</span>
				<code
					className='flex-1 break-all font-mono text-sm text-[#D2D2FF]'
					data-testid='deposit-address'
				>
					{address}
				</code>
				<button
					type='button'
					onClick={handleCopy}
					aria-label={copied ? 'Скопійовано' : 'Скопіювати адресу'}
					className='relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#6A56E4] text-white transition hover:shadow-xl'
				>
					{copied ? (
						<Check className='h-4 w-4 text-emerald-300' />
					) : (
						<Copy className='h-4 w-4' />
					)}
					{copied && (
						<span className='pointer-events-none absolute -top-9 right-1/2 translate-x-1/2 whitespace-nowrap rounded-md bg-[#1D1D2A] px-2 py-1 text-[11px] text-[#D2D2FF] shadow-lg'>
							Скопійовано
						</span>
					)}
				</button>
			</div>
		</div>
	)
}

export default AddressRow
