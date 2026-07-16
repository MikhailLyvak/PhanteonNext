'use client'

import { Suspense } from 'react'
import { useLocale } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { Link, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

function SwitcherLinks() {
	const locale = useLocale()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const query = searchParams.toString()
	const href = query ? `${pathname}?${query}` : pathname

	return (
		<div className='flex items-center gap-1.5 text-xs font-semibold uppercase'>
			{routing.locales.map((l) => (
				<Link
					key={l}
					href={href}
					locale={l}
					className={
						l === locale
							? 'text-white'
							: 'text-[#D2D2FF] opacity-60 hover:opacity-100'
					}
				>
					{l}
				</Link>
			))}
		</div>
	)
}

// useSearchParams requires a Suspense boundary when the page is statically rendered.
export default function LocaleSwitcher() {
	return (
		<Suspense fallback={null}>
			<SwitcherLinks />
		</Suspense>
	)
}
