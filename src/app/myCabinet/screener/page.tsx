'use client'

import React from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Filters from '@/app/components/Screener/Filters'
import AssetsTable from '@/app/components/Screener/AssetsTable'

const ScreenerPage = () => {
	return (
		<ProtectedRoute>
			<div className='w-full pb-24'>
				<div className='max-w-8xl mx-auto px-4 md:px-6'>
					<div className='mt-6 flex items-center gap-3 flex-wrap'>
						<h6 className='text-[#D2D2FF] text-xl md:text-4xl font-bold'>
							Скрінер
						</h6>
					</div>
					<div className='mt-8'>
						<Filters />
						<AssetsTable />
					</div>
				</div>
			</div>
		</ProtectedRoute>
	)
}

export default ScreenerPage
