'use client'

import React from 'react'
import CertificateCard from './CertificateCard'
import useGetCourses from '@/hooks/StudyPlatform/useGetCourses'

const CertificatesList = () => {
	const { data: courses, isLoading } = useGetCourses()

	if (isLoading) return (
		<div className="flex justify-center items-center py-12">
			<p className="text-[#D2D2FF] text-lg">Завантаження курсів...</p>
		</div>
	)

	// Show all courses, not just owned ones
	const allCourses = courses || []

	if (allCourses.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12">
				<div className="text-center">
					<h3 className="text-[#D2D2FF] text-xl font-semibold mb-4">
						Курси не знайдено
					</h3>
					<p className="text-white text-base">
						Спробуйте пізніше або зверніться до підтримки
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className='grid gap-6'>
			{allCourses.map(course => (
				<CertificateCard key={course.id} course={course} />
			))}
		</div>
	)
}

export default CertificatesList
