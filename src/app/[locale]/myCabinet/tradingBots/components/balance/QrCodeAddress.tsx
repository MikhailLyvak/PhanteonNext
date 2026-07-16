'use client'

import React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useCustomTranslations } from '@/lib/contexts/translations/translations-context'
import { TKeys } from '@/i18n/t-keys'

interface Props {
	value: string
}

const QrCodeAddress = ({ value }: Props) => {
	const { t } = useCustomTranslations(TKeys.tradingBots)
	return (
		<div className='flex flex-col items-center'>
			<div className='rounded-2xl bg-white p-4 shadow-lg'>
				<QRCodeSVG
					value={value}
					size={224}
					bgColor='#FFFFFF'
					fgColor='#1D1D2A'
					level='M'
				/>
			</div>
			<p className='mt-3 text-xs text-[#8c8ca0]'>
				{t.scanQr}
			</p>
		</div>
	)
}

export default QrCodeAddress
