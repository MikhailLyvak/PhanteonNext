'use client'

import React from 'react'
import { useTerminalStore } from '@/store/Screener/useTerminalStore'
import { Timeframe } from '@/lib/screener/types'

const TFS: Timeframe[] = ['1m', '5m', '15m', '1h', '4h', '1d']

const TimeframeToggle: React.FC = () => {
	const timeframe = useTerminalStore(s => s.timeframe)
	const setTimeframe = useTerminalStore(s => s.setTimeframe)

	return (
		<div className='inline-flex rounded-xl bg-[#1A1A28] border border-[#262b38] p-1'>
			{TFS.map(tf => (
				<button
					key={tf}
					onClick={() => setTimeframe(tf)}
					className={`px-3 py-1 text-xs rounded-lg transition-colors ${
						timeframe === tf
							? 'bg-[#2F2F40] text-[#D2D2FF] font-semibold'
							: 'text-[#98A0B3] hover:text-[#D2D2FF]'
					}`}
				>
					{tf}
				</button>
			))}
		</div>
	)
}

export default TimeframeToggle
