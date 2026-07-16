'use client'

import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { useCustomTranslations } from '@/lib/contexts/translations/translations-context'
import { TKeys } from '@/i18n/t-keys'

const SafetyNotice = () => {
	const { t } = useCustomTranslations(TKeys.tradingBots)
	return (
		<div className='mt-5 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4'>
			<AlertTriangle className='mt-0.5 h-5 w-5 shrink-0 text-amber-400' />
			<p className='text-sm leading-snug text-amber-200'>
				{t.safetyNotice({ bold: (chunks) => <span className='font-semibold'>{chunks}</span> })}
			</p>
		</div>
	)
}

export default SafetyNotice
