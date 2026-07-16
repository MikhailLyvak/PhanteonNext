'use client'

import { useEffect, useState } from 'react'
import { useCustomTranslations } from '@/lib/contexts/translations/translations-context'
import { TKeys } from '@/i18n/t-keys'

interface ConfirmDeleteChatProps {
	isOpen: boolean
	onConfirm: () => void
	onCancel: () => void
}

const ConfirmDeleteChat = ({
	isOpen,
	onConfirm,
	onCancel,
}: ConfirmDeleteChatProps) => {
	const [open, setOpen] = useState(false)
	const { t } = useCustomTranslations(TKeys.aiAgent)

	useEffect(() => {
		setOpen(isOpen)
	}, [isOpen])

	if (!isOpen) return null

	return (
		<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-min h-min py-6 px-14 bg-[#2A2A34] rounded-3xl'>
			<div className='text-2xl fonts-semibold mb-[29px] mx-auto text-center'>
				{t.deleteTitle}
			</div>
			<div className='flex gap-3 items-center '>
				<button
					onClick={onConfirm}
					className='w-[100px] py-3.5 text-white font-semibold bg-[#6A56E4] rounded-full'
				>
					{t.confirmYes}
				</button>
				<button
					onClick={onCancel}
					className='w-[100px] py-3.5 text-white font-semibold bg-[#FFFFFF1A] rounded-full'
				>
					{t.confirmNo}
				</button>
			</div>
		</div>
	)
}

export default ConfirmDeleteChat
