'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

declare global {
	interface Window {
		fbq?: (...args: any[]) => void
	}
}

export function MetaPixel() {
	const pathname = usePathname()

	useEffect(() => {
		if (!window.fbq) return

		window.fbq('track', 'PageView')
	}, [pathname])

	return null
}
