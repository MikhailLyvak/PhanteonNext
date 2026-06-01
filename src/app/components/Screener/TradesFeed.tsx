'use client'

import React, { useEffect, useState } from 'react'
import { AssetPair, TradeEvent } from '@/lib/screener/types'
import { openTradesStream } from '@/api/Screener/streams'
import { formatPrice, formatUsdShort } from '@/lib/screener/format'

interface Props {
	pair: AssetPair
}

function formatTs(ts: number): string {
	const d = new Date(ts)
	return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

const TradesFeed: React.FC<Props> = ({ pair }) => {
	const [events, setEvents] = useState<TradeEvent[]>([])

	useEffect(() => {
		setEvents([])
		const unsubscribe = openTradesStream(pair.code, {
			onSeed: seed => {
				setEvents(seed.slice(0, 50))
			},
			onEvent: evt => {
				setEvents(prev => [evt, ...prev].slice(0, 50))
			},
		})
		return unsubscribe
	}, [pair.code])

	return (
		<div className='overflow-y-auto flex-1 min-h-0'>
			<table className='w-full text-xs'>
				<thead className='sticky top-0 bg-[#1d212c] text-[#7A7AA0]'>
					<tr>
						<th className='text-left py-1.5 px-1 font-normal'>Час</th>
						<th className='text-right py-1.5 px-1 font-normal'>Ціна</th>
						<th className='text-right py-1.5 px-1 font-normal'>Розмір</th>
					</tr>
				</thead>
				<tbody>
					{events.map((e, i) => (
						<tr key={`${e.ts}-${i}`} className='border-t border-[#262b38]/50'>
							<td className='py-1 font-mono text-[#98A0B3]'>{formatTs(e.ts)}</td>
							<td
								className={`py-1 text-right font-mono ${
									e.side === 'buy' ? 'text-[#4ade80]' : 'text-[#f87171]'
								}`}
							>
								{formatPrice(e.price, pair.precision)}
							</td>
							<td
								className={`py-1 text-right font-mono ${
									e.side === 'buy' ? 'text-[#4ade80]' : 'text-[#f87171]'
								}`}
							>
								{formatUsdShort(e.volume)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

export default TradesFeed
