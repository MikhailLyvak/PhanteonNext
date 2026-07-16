'use client'

import React from 'react'
import { AlertTriangle } from 'lucide-react'

const SafetyNotice = () => {
	return (
		<div className='mt-5 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4'>
			<AlertTriangle className='mt-0.5 h-5 w-5 shrink-0 text-amber-400' />
			<p className='text-sm leading-snug text-amber-200'>
				Надсилайте на цю адресу <span className='font-semibold'>лише USDT BEP-20 (BNB Smart Chain)</span>.
				Будь-який інший токен або мережа призведе до незворотної втрати коштів.
			</p>
		</div>
	)
}

export default SafetyNotice
