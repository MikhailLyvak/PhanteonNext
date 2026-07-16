'use client'

import React from 'react'
import { AssetPair } from '@/lib/screener/types'
import TradesFeed from './TradesFeed'
import { useCustomTranslations } from '@/lib/contexts/translations/translations-context'
import { TKeys } from '@/i18n/t-keys'

interface Props {
	pair: AssetPair
}

const FeedTabs: React.FC<Props> = ({ pair }) => {
	const { t } = useCustomTranslations(TKeys.screener)
	return (
		<div className='bg-[#161a22] border border-[#262b38] rounded-2xl p-3 h-full min-h-0 flex flex-col'>
			<div className='text-xs font-semibold text-[#D2D2FF] px-1 pb-2'>{t.feed.bigTrades}</div>
			<TradesFeed pair={pair} />
		</div>
	)
}

export default FeedTabs
