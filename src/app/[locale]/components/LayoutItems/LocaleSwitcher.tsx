'use client'

import { Suspense } from 'react'
import { useLocale } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { Link, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import type { AppLocale } from '@/i18n/routing'

const LOCALE_LABELS: Record<AppLocale, string> = {
	uk: 'UA',
	en: 'EN',
	ru: 'RU',
}

function SwitcherLinks() {
	const locale = useLocale()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const query = searchParams.toString()
	const href = query ? `${pathname}?${query}` : pathname

	return (
		<div className='flex items-center rounded-full bg-[#242433] border border-[#58587B] p-1 text-xs font-semibold'>
			{routing.locales.map((l) => (
				<Link
					key={l}
					href={href}
					locale={l}
					className={`rounded-full px-2.5 py-1 transition-colors ${
						l === locale
							? 'bg-[#D2D2FF] text-[#171723]'
							: 'text-[#D2D2FF] opacity-60 hover:opacity-100'
					}`}
				>
					{LOCALE_LABELS[l] ?? l.toUpperCase()}
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
