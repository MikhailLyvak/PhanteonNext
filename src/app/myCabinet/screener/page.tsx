'use client'

import React from 'react'
import MyCabinetBreadCrump from '../studyPlatform/components/BreadCrump'
import Sidebar from '../components/Sidebar'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Filters from '@/app/components/Screener/Filters'
import AssetsTable from '@/app/components/Screener/AssetsTable'

const ScreenerPage = () => {
	return (
		<ProtectedRoute>
			<div className='w-full pb-24'>
				<div className='max-w-8xl mx-auto px-4 md:px-6'>
					<div className='mt-6'>
						<MyCabinetBreadCrump currentPageTitle='Скрінер' />
					</div>
					<div className='mt-6'>
						<h6 className='text-[#D2D2FF] text-xl md:text-4xl font-bold'>
							Особистий кабінет
						</h6>
					</div>
					<div className='flex w-full mt-8'>
						<div className='hidden xl:block w-[312px] shrink-0 sticky top-[140px]'>
							<div className='h-fit'>
								<Sidebar />
							</div>
						</div>
						<div className='flex flex-col w-full sm:ml-10'>
							<Filters />
							<AssetsTable />
						</div>
					</div>
				</div>
			</div>
		</ProtectedRoute>
	)
}

export default ScreenerPage
