'use client'

import React, { useState } from 'react'
import { Course } from "@/api/StudyPlatform/types"
import { LuCheck, LuDownload } from "react-icons/lu"
import { FaPlus, FaMinus } from "react-icons/fa6"
import useGetCourse from '@/hooks/StudyPlatform/useGetCourseDetail'
import useCheckPersonalData from '@/hooks/Auth/useCheckPersonalData'
import useGetMyProfileData from '@/hooks/Auth/useGetMyProfileData'
import { useGenerateCertificate } from '@/hooks/Certificates/useGenerateCertificate'
import LockIcon from './LockIcon'
import CertificateIcon from './CertificateIcon'
import PersonalDataModal from './PersonalDataModal'

interface CertificateCardProps {
	course: Course
}

const CertificateCard: React.FC<CertificateCardProps> = ({ course }) => {
	const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set())
	const [showPersonalDataModal, setShowPersonalDataModal] = useState(false)
	const { data: courseDetail, isLoading } = useGetCourse(course.id.toString())
	const { canGetCertificate, missingFields } = useCheckPersonalData()
	const { data: profileData } = useGetMyProfileData()
	const generateCertificateMutation = useGenerateCertificate()

	const toggleModule = (moduleId: number) => {
		setExpandedModules(prev => {
			const newSet = new Set(prev)
			if (newSet.has(moduleId)) {
				newSet.delete(moduleId)
			} else {
				newSet.add(moduleId)
			}
			return newSet
		})
	}

	const handleGetCertificate = (moduleId: number) => {
		// Перевіряємо чи заповнені персональні дані
		if (!canGetCertificate) {
			setShowPersonalDataModal(true)
			return
		}

		// Знаходимо модуль для отримання деталей
		const module = courseDetail?.modules.find(m => m.id === moduleId)
		if (!module) {
			console.error('Module not found')
			return
		}

		// Генеруємо сертифікат
		generateCertificateMutation.mutate({
			course_id: course.id,
			module_id: moduleId,
			course_name: course.name,
			module_name: module.name,
			completion_date: new Date().toISOString(),
			student_wallet: profileData?.solana_wallet || ''
		}, {
			onSuccess: (data) => {
				console.log('Certificate generated successfully:', data)
				// Можна додати успішне повідомлення або перенаправлення
			},
			onError: (error) => {
				console.error('Certificate generation failed:', error)
				// Можна додати повідомлення про помилку
			}
		})
	}

	if (isLoading) {
		return (
			<div className="bg-[#242433] rounded-3xl p-6">
				<div className="animate-pulse">
					<div className="h-6 bg-gray-600 rounded w-3/4 mb-4"></div>
					<div className="h-4 bg-gray-600 rounded w-1/2"></div>
				</div>
			</div>
		)
	}

	if (!courseDetail) {
		return null
	}

	return (
		<>
		<div className="bg-[#242433] rounded-3xl p-6">
			{/* Course Header */}
			<div className="flex items-start gap-4 mb-6">
				<div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
					<img
						src={course.image}
						alt={course.name}
						className="w-full h-full object-cover"
					/>
				</div>
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-3 mb-2">
						<h3 className="text-[#D2D2FF] text-xl font-bold truncate">
							{course.name}
						</h3>
						{/* Course Access Indicator */}
						<div className={`px-3 py-1 rounded-full text-xs font-semibold ${
							course.mine 
								? 'bg-green-600 text-white' 
								: 'bg-gray-600 text-gray-300'
						}`}>
							{course.mine ? 'Придбано' : 'Не придбано'}
						</div>
					</div>
					<p className="text-white text-sm mb-3 line-clamp-2">
						{course.description}
					</p>
					{course.mine && (
						<div className="flex items-center gap-2">
							<div className="w-6 h-6 flex items-center justify-center rounded-full bg-[#D2D2FF] text-[#242433]">
								<LuCheck size={14} />
							</div>
							<span className="text-[#D2D2FF] text-sm font-medium">
								Курс пройдено на {course.course_progress}%
							</span>
						</div>
					)}
				</div>
			</div>

			{/* Course Progress Bar - Only for owned courses */}
			{course.mine && (
				<div className="mb-6">
					<div className="flex justify-between items-center mb-2">
						<span className="text-white text-sm font-medium">Загальний прогрес курсу</span>
						<span className="text-[#D2D2FF] text-sm font-bold">{course.course_progress}%</span>
					</div>
					<div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
						<div
							className="h-full bg-[#D2D2FF] rounded-full transition-all duration-300"
							style={{ width: `${course.course_progress}%` }}
						/>
					</div>
				</div>
			)}

			{/* Modules */}
			<div className="space-y-4">
				<h4 className="text-[#D2D2FF] text-lg font-semibold mb-4">
					Модулі курсу
				</h4>
				{courseDetail.modules.map((module) => {
					const isExpanded = expandedModules.has(module.id)
					const isModuleCompleted = module.module_progress === 100
					const isModuleAccessible = course.mine || module.lessons_list.some(lesson => lesson.is_free)
					
					return (
						<div key={module.id} className="bg-[#1D1D2A] rounded-2xl p-4">
							{/* Module Header */}
							<div
								className="flex items-center justify-between cursor-pointer"
								onClick={() => toggleModule(module.id)}
							>
								<div className="flex items-center gap-3 flex-1 min-w-0">
									<div className={`w-6 h-6 flex items-center justify-center rounded-full ${
										isModuleCompleted 
											? 'bg-[#D2D2FF] text-[#242433]' 
											: isModuleAccessible
												? 'border-gray-500 border-[1px] text-gray-500'
												: 'bg-gray-600 text-gray-400'
									} shrink-0`}>
										{isModuleAccessible ? <LuCheck size={14} /> : <LockIcon size={14} />}
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<h5 className="text-[#D2D2FF] font-semibold text-base truncate">
												{module.name}
											</h5>
											{/* Module Access Indicator */}
											<div className={`px-2 py-1 rounded-full text-xs font-semibold ${
												course.mine 
													? 'bg-green-600 text-white' 
													: isModuleAccessible
														? 'bg-blue-600 text-white'
														: 'bg-gray-600 text-gray-300'
											}`}>
												{course.mine ? 'Доступно' : isModuleAccessible ? 'Частково' : 'Заблоковано'}
											</div>
										</div>
										<p className="text-white text-sm">
											{module.lessons_count} лекцій
										</p>
									</div>
								</div>
								
								<div className="flex items-center gap-3">
									{/* Progress - Only show for accessible modules */}
									{isModuleAccessible && (
										<div className="text-right">
											<div className="text-[#D2D2FF] text-sm font-bold">
												{module.module_progress}%
											</div>
											<div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
												<div
													className="h-full bg-[#D2D2FF] rounded-full transition-all duration-300"
													style={{ width: `${module.module_progress}%` }}
												/>
											</div>
										</div>
									)}
									
									{/* Expand/Collapse Button */}
									<div className="w-8 h-8 flex items-center justify-center text-gray-400">
										{isExpanded ? <FaMinus size={16} /> : <FaPlus size={16} />}
									</div>
								</div>
							</div>

							{/* Module Details (Expanded) */}
							{isExpanded && (
								<div className="mt-4 pt-4 border-t border-gray-600">
									<div className="mb-4">
										<p className="text-white text-sm leading-relaxed">
											{module.description}
										</p>
									</div>
									
									{/* Lessons List */}
									<div className="mb-4">
										<h6 className="text-[#D2D2FF] text-sm font-semibold mb-3">
											Уроки модуля:
										</h6>
										<div className="space-y-2">
											{module.lessons_list.map((lesson, index) => {
												const isLessonAccessible = course.mine || lesson.is_free
												return (
													<div key={lesson.id} className="flex items-center gap-3 p-2 rounded-lg bg-[#242433]">
														<div className={`w-5 h-5 flex items-center justify-center rounded-full ${
															lesson.is_passed 
																? 'bg-[#D2D2FF] text-[#242433]' 
																: isLessonAccessible
																	? 'border-gray-500 border-[1px] text-gray-500'
																	: 'bg-gray-600 text-gray-400'
														}`}>
															{isLessonAccessible ? <LuCheck size={12} /> : <LockIcon size={12} />}
														</div>
														<div className="flex-1">
															<span className={`text-sm ${
																isLessonAccessible ? 'text-[#D2D2FF]' : 'text-gray-400'
															}`}>
																{index + 1}. {lesson.name}
															</span>
														</div>
														<div className={`px-2 py-1 rounded-full text-xs font-semibold ${
															lesson.is_free 
																? 'bg-blue-600 text-white' 
																: course.mine
																	? 'bg-green-600 text-white'
																	: 'bg-gray-600 text-gray-300'
														}`}>
															{lesson.is_free ? 'Безплатно' : course.mine ? 'Доступно' : 'Заблоковано'}
														</div>
													</div>
												)
											})}
										</div>
									</div>
									
									{/* Certificate Button */}
									<div className="flex justify-end">
										{isModuleCompleted && course.mine ? (
											<button
												onClick={() => handleGetCertificate(module.id)}
												disabled={generateCertificateMutation.isPending}
												className="flex items-center gap-2 bg-[#6A56E4] hover:bg-[#5A4BC4] disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-2xl font-semibold transition-colors"
											>
												{generateCertificateMutation.isPending ? (
													<>
														<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
														Генерація...
													</>
												) : (
													<>
														<CertificateIcon size={18} />
														Отримати сертифікат
													</>
												)}
											</button>
										) : !course.mine ? (
											<div className="flex items-center gap-2 bg-gray-600 text-gray-400 px-6 py-3 rounded-2xl font-semibold cursor-not-allowed">
												<LockIcon size={18} />
												Придбайте курс
											</div>
										) : (
											<div className="flex items-center gap-2 bg-gray-600 text-gray-400 px-6 py-3 rounded-2xl font-semibold cursor-not-allowed">
												<LockIcon size={18} />
												Завершіть модуль
											</div>
										)}
									</div>
								</div>
							)}
						</div>
					)
				})}
			</div>
		</div>

		{/* Personal Data Modal */}
		<PersonalDataModal
			isOpen={showPersonalDataModal}
			onClose={() => setShowPersonalDataModal(false)}
			missingFields={missingFields}
		/>
	</>
	)
}

export default CertificateCard
