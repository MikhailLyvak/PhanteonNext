'use client'

import React, { useEffect, useState } from 'react'
import CourseCard from './CourseCard'
import useGetCourses from '@/hooks/StudyPlatform/useGetCourses'
import {
	ChevronRight,
	ChevronsRight,
	ChevronLeft,
	ChevronsLeft,
} from 'lucide-react'
import { useCustomTranslations } from '@/lib/contexts/translations/translations-context'
import { TKeys } from '@/i18n/t-keys'

const ITEMS_PER_PAGE = 6 // Items per page

interface Props {
	filter: string
}

const CourseList = ({ filter }: Props) => {
	const { data: courses, isLoading } = useGetCourses()
	const [currentPage, setCurrentPage] = useState(1)
	const [filteredCourses, setFilteredCourses] = useState(courses)
	const { t } = useCustomTranslations(TKeys.cabinet.studyPlatform)

	useEffect(() => {
		if (filter === 'mine') {
			setFilteredCourses(courses?.filter(course => course.mine))
		} else {
			setFilteredCourses(courses)
		}
	}, [courses, filter])

	if (isLoading) return <p>{t.loadingCourses}</p>

	const totalPages = Math.ceil((filteredCourses?.length || 0) / ITEMS_PER_PAGE)
	const paginatedCourses = filteredCourses?.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE
	)

	const handlePageChange = (page: number) => {
		if (page >= 1 && page <= totalPages) {
			setCurrentPage(page)
		}
	}

	return (
		<div className='grid gap-6'>
			{paginatedCourses?.map(filteredCourses => (
				<CourseCard key={filteredCourses.id} course={filteredCourses} />
			))}

			{/* ✅ Pagination */}
			<div className='flex mt-6 mb-24'>
				<div className='flex items-center gap-2'>
					{/* First Page Button */}
					<button
						onClick={() => handlePageChange(1)}
						disabled={currentPage === 1 || totalPages <= 1}
						className={`w-10 h-10 flex items-center justify-center rounded-full bg-[#242433] transition-colors
              ${currentPage === 1 || totalPages <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#2F2F40]'}`}
					>
						<ChevronsLeft className='w-5 h-5 text-[#D2D2FF]' />
					</button>

					{/* Previous Button */}
					<button
						onClick={() => handlePageChange(currentPage - 1)}
						disabled={currentPage === 1 || totalPages <= 1}
						className={`w-10 h-10 flex items-center justify-center rounded-full bg-[#242433] transition-colors
              ${currentPage === 1 || totalPages <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#2F2F40]'}`}
					>
						<ChevronLeft className='w-5 h-5 text-[#D2D2FF]' />
					</button>

					{/* Page Numbers */}
					{Array.from({ length: Math.max(1, totalPages) }, (_, index) => {
						const pageNum = index + 1
						return (
							<button
								key={pageNum}
								onClick={() => handlePageChange(pageNum)}
								disabled={totalPages <= 1}
								className={`w-10 h-10 flex items-center justify-center rounded-full text-base font-medium transition-colors
                  ${
										currentPage === pageNum
											? 'text-[#D2D2FF] bg-[#242433]'
											: totalPages <= 1
												? 'text-[#58587B] opacity-50 cursor-not-allowed'
												: 'text-[#58587B] hover:text-[#D2D2FF]'
									}`}
							>
								{pageNum}
							</button>
						)
					})}

					{/* Next Button */}
					<button
						onClick={() => handlePageChange(currentPage + 1)}
						disabled={currentPage === totalPages || totalPages <= 1}
						className={`w-10 h-10 flex items-center justify-center rounded-full bg-[#242433] transition-colors
              ${currentPage === totalPages || totalPages <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#2F2F40]'}`}
					>
						<ChevronRight className='w-5 h-5 text-[#D2D2FF]' />
					</button>

					{/* Last Page Button */}
					<button
						onClick={() => handlePageChange(totalPages)}
						disabled={currentPage === totalPages || totalPages <= 1}
						className={`w-10 h-10 flex items-center justify-center rounded-full bg-[#242433] transition-colors
              ${currentPage === totalPages || totalPages <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#2F2F40]'}`}
					>
						<ChevronsRight className='w-5 h-5 text-[#D2D2FF]' />
					</button>
				</div>
			</div>
		</div>
	)
}

export default CourseList
