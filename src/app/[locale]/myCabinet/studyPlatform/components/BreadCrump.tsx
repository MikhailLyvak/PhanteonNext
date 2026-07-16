'use client'

import React from 'react'
import { Link } from '@/i18n/navigation'
import { useCustomTranslations } from '@/lib/contexts/translations/translations-context'
import { TKeys } from '@/i18n/t-keys'

interface Props {
	currentPageTitle: string
	textColor?: string
}

const MyCabinetBreadCrump: React.FC<Props> = ({
	currentPageTitle,
	textColor = 'text-[#D2D2FF]',
}) => {
	const { t } = useCustomTranslations(TKeys.common)
	return (
		<div className='my-8'>
			<nav className='flex items-center' aria-label='Breadcrumb'>
				<ol className='inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse'>
					<li>
						<Link
							href='/'
							className={`text-xs sm:text-sm font-normal hover:font-semibold ${textColor}`}
						>
							{t.home}
						</Link>
					</li>
					<li className={`text-lg font-extrabold pl-1 ${textColor}`}>•</li>
					<li aria-current='page'>
						<Link
							href=''
							className={`text-xs sm:text-sm font-semibold md:ms-2 ${textColor}`}
						>
							{currentPageTitle}
						</Link>
					</li>
				</ol>
			</nav>
		</div>
	)
}

export default MyCabinetBreadCrump
