'use client'

import React from 'react'
import { useTerminalStore } from '@/store/Screener/useTerminalStore'
import { Timeframe } from '@/lib/screener/types'

const TFS: Timeframe[] = ['1m', '5m', '15m', '30m', '1h', '2h', '4h', '8h', '12h', '1d', '1w', '1M']

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
