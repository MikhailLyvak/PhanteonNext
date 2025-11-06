'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

declare global {
	interface Window {
		fbq?: (...args: any[]) => void
	}
}

export function MetaPixel() {
	const pathname = usePathname()
	const searchParams = useSearchParams()

	useEffect(() => {
		if (!window.fbq) return

		window.fbq('track', 'PageView')
	}, [pathname, searchParams?.toString()])

	return null
}
