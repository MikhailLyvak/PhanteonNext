'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { getSubscriptions } from '@/api/Subscriptions/getSubscriptions'
import { useUserStore } from '@/store/UserData/useUserStore'

interface Props {
	children: React.ReactNode
}

const ScreenerAccessGate: React.FC<Props> = ({ children }) => {
	const router = useRouter()
	const user = useUserStore(s => s.user)

	const { data, isLoading, isError } = useQuery({
		queryKey: ['subscriptions', user?.id ?? 'anon'],
		queryFn: getSubscriptions,
		enabled: !!user,
		staleTime: 60_000,
	})

	const hasAccess = Array.isArray(data) && data.some(s => s.screener_access)

	useEffect(() => {
		if (!user) return
		if (isLoading) return
		if (isError) {
			router.replace('/paywall')
			return
		}
		if (!hasAccess) router.replace('/paywall')
	}, [user, isLoading, isError, hasAccess, router])

	if (!user || isLoading) {
		return (
			<div className='w-full flex items-center justify-center py-24 text-[#98A0B3] text-sm'>
				Завантаження…
			</div>
		)
	}
	if (!hasAccess) return null
	return <>{children}</>
}

export default ScreenerAccessGate
