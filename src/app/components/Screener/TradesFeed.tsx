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
	const [seeded, setSeeded] = useState(false)

	useEffect(() => {
		setEvents([])
		setSeeded(false)
		const unsubscribe = openTradesStream(pair.code, {
			onSeed: seed => {
				setEvents(seed.slice(0, 50))
				setSeeded(true)
			},
			onEvent: evt => {
				setEvents(prev => [evt, ...prev].slice(0, 50))
			},
		})
		return unsubscribe
	}, [pair.code])

	const empty = seeded && events.length === 0

	return (
		<div className='overflow-y-auto flex-1 min-h-0 relative'>
			<table className='w-full text-xs'>
				<thead className='sticky top-0 bg-[#1d212c] text-[#7A7AA0]'>
					<tr>
						<th className='text-left py-1.5 px-1 font-normal'>Час</th>
						<th className='text-right py-1.5 px-1 font-normal'>Ціна</th>
						<th className='text-right py-1.5 px-1 font-normal'>Розмір</th>
					</tr>
				</thead>
				<tbody>
					{!seeded && (
						<tr>
							<td colSpan={3} className='py-0'>
								<div className='flex flex-col items-center justify-center gap-2 py-10 text-[#7A7AA0]'>
									<div className='flex items-center gap-1.5'>
										<span className='h-1.5 w-1.5 rounded-full bg-[#8AA6FF] animate-pulse' />
										<span
											className='h-1.5 w-1.5 rounded-full bg-[#8AA6FF] animate-pulse'
											style={{ animationDelay: '0.15s' }}
										/>
										<span
											className='h-1.5 w-1.5 rounded-full bg-[#8AA6FF] animate-pulse'
											style={{ animationDelay: '0.3s' }}
										/>
									</div>
									<span className='text-xs'>Завантаження угод…</span>
								</div>
							</td>
						</tr>
					)}
					{empty && (
						<tr>
							<td colSpan={3} className='py-0'>
								<div className='flex flex-col items-center justify-center gap-1 py-10 px-3 text-center'>
									<span className='text-sm text-[#98A0B3]'>
										Поки немає великих угод
									</span>
									<span className='text-[11px] text-[#58587B]'>
										Очікуємо аномальні обʼєми
									</span>
								</div>
							</td>
						</tr>
					)}
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
