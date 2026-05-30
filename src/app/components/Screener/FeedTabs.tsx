'use client'

import React, { useState } from 'react'
import { AssetPair } from '@/lib/screener/types'
import LiquidationsFeed from './LiquidationsFeed'
import TradesFeed from './TradesFeed'

interface Props {
	pair: AssetPair
}

type Tab = 'liq' | 'trades'

const TABS: { value: Tab; label: string }[] = [
	{ value: 'liq', label: 'Ліквідації' },
	{ value: 'trades', label: 'Великі угоди' },
]

const FeedTabs: React.FC<Props> = ({ pair }) => {
	const [tab, setTab] = useState<Tab>('liq')

	return (
		<div className='bg-[#161a22] border border-[#262b38] rounded-2xl p-3 h-full min-h-0 flex flex-col'>
			<div className='inline-flex rounded-xl bg-[#1A1A28] border border-[#262b38] p-1 mb-3 self-stretch'>
				{TABS.map(t => {
					const active = tab === t.value
					return (
						<button
							key={t.value}
							onClick={() => setTab(t.value)}
							className={`flex-1 px-3 py-1 text-xs rounded-lg transition-colors font-semibold ${
								active
									? 'bg-[#2F2F40] text-[#D2D2FF]'
									: 'text-[#98A0B3] hover:text-[#D2D2FF]'
							}`}
						>
							{t.label}
						</button>
					)
				})}
			</div>
			{tab === 'liq' ? <LiquidationsFeed pair={pair} /> : <TradesFeed pair={pair} />}
		</div>
	)
}

export default FeedTabs
