'use client'

import React from 'react'
import { useScreenerStore } from '@/store/Screener/useScreenerStore'

const CONFIG = {
	live: { label: 'Live', dot: 'bg-emerald-400', text: 'text-emerald-300' },
	stale: { label: 'Stale', dot: 'bg-amber-400', text: 'text-amber-300' },
	disconnected: { label: 'Disconnected', dot: 'bg-rose-500', text: 'text-rose-300' },
} as const

const HealthBadge: React.FC = () => {
	const status = useScreenerStore(s => s.healthStatus)
	const cfg = CONFIG[status]
	return (
		<div
			className={`inline-flex items-center gap-2 rounded-full bg-[#161a22] border border-[#262b38] px-2.5 py-1 text-xs ${cfg.text}`}
			title={`Screener backend: ${cfg.label}`}
			role='status'
			aria-live='polite'
		>
			<span className={`inline-block h-2 w-2 rounded-full ${cfg.dot}`} />
			<span className='font-medium'>{cfg.label}</span>
		</div>
	)
}

export default HealthBadge
