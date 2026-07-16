'use client'

import MyCabinetBreadCrump from './components/BreadCrump'
import CourseList from './components/CourseList'
import Sidebar from '../components/Sidebar'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useState } from 'react'
import Link from 'next/link'

const StudyPlatformPage = () => {
	const [selectedPage, setSelectedPage] = useState<string>('all')
	return (
		<ProtectedRoute>
			<div className='w-full'>
				<div className='max-w-8xl mx-auto px-4 md:px-6'>
					{/* ✅ First Row: Breadcrumbs */}
					<div className='mt-6'>
						<MyCabinetBreadCrump currentPageTitle='Навчання' />
					</div>

					{/* ✅ Second Row: Page Title */}
					<div className='mt-6'>
						<h6 className='text-[#D2D2FF] text-xl md:text-4xl font-bold'>
							Особистий кабінет
						</h6>
					</div>

					{/* ✅ Third Row: Sidebar + Courses */}
					<div className='flex w-full mt-8'>
						{/* Sidebar - Fixed Width */}
						<div className='hidden xl:block w-[312px] shrink-0 sticky top-[140px]'>
							<div className='h-fit'>
								<Sidebar />
							</div>
						</div>

						{/* Right Content */}
						<div className='flex flex-col w-full sm:ml-10'>
							{/* ✅ Filters */}
							<div className='flex flex-wrap gap-2 sm:gap-x-4 sm:gap-y-2 mb-8'>
								<button
									onClick={() => {
										setSelectedPage('all')
									}}
									className={`h-10 px-5 ${selectedPage == 'all' ? 'bg-[#D2D2FF] text-[#171723]' : 'bg-[#242433] text-[#D2D2FF]'} font-semibold sm:font-bold text-xs sm:text-base rounded-full text-nowrap`}
								>
									Всі
								</button>
								<button
									onClick={() => {
										setSelectedPage('mine')
									}}
									className={`h-10 px-5 ${selectedPage == 'mine' ? 'bg-[#D2D2FF] text-[#171723] ' : 'bg-[#242433] text-[#D2D2FF]'}] font-semibold sm:font-bold text-xs sm:text-base rounded-full text-nowrap`}
								>
									Ваші курси
								</button>
							</div>

							{/* ✅ Course List */}
							<CourseList filter={selectedPage ?? 'all'} />
						</div>
					</div>
				</div>
			</div>
			<Link
				href={'https://pantheonx.club/interview'}
				className='fixed top-[90%] right-10 py-4 px-6 bg-[#242433] drop-shadow-lg rounded-full border border-[#ffffff36]  shadow hover:scale-105 hover:bg-[#D2D2FF] hover:text-[#242433] transition-all duration-300 font-semibold z-10'
			>
				Підібрати курс з AI
			</Link>
		</ProtectedRoute>
	)
}

export default StudyPlatformPage
