'use client'

import React from 'react'
import CertificateCard from './CertificateCard'
import useGetCourses from '@/hooks/StudyPlatform/useGetCourses'
import { useCustomTranslations } from '@/lib/contexts/translations/translations-context'
import { TKeys } from '@/i18n/t-keys'

const CertificatesList = () => {
	const { data: courses, isLoading } = useGetCourses()
	const { t } = useCustomTranslations(TKeys.cabinet.certificates)

	if (isLoading) return (
		<div className="flex justify-center items-center py-12">
			<p className="text-[#D2D2FF] text-lg">{t.loadingCourses}</p>
		</div>
	)

	// Show all courses, not just owned ones
	const allCourses = courses || []

	if (allCourses.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12">
				<div className="text-center">
					<h3 className="text-[#D2D2FF] text-xl font-semibold mb-4">
						{t.noCoursesTitle}
					</h3>
					<p className="text-white text-base">
						{t.noCoursesHint}
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
