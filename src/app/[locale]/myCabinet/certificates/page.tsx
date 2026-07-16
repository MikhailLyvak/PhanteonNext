'use client'

import React, { useState } from 'react'
import MyCabinetBreadCrump from '../studyPlatform/components/BreadCrump';
import CertificatesList from './components/CertificatesList';
import MyCertificates from './components/MyCertificates';
import Sidebar from '../components/Sidebar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useCustomTranslations } from '@/lib/contexts/translations/translations-context'
import { TKeys } from '@/i18n/t-keys'

const CertificatesPage = () => {
	const [activeTab, setActiveTab] = useState<'courses' | 'my-certificates'>('courses')
	const { t } = useCustomTranslations(TKeys.cabinet.certificates)

	return (
		<ProtectedRoute>
			<div className='w-full'>
				<div className='max-w-8xl mx-auto px-4 md:px-6'>
					{/* First Row: Breadcrumbs */}
					<div className='mt-6'>
						<MyCabinetBreadCrump currentPageTitle={t.breadcrumbTitle} />
					</div>

					{/* Second Row: Page Title */}
					<div className='mt-6'>
						<h6 className='text-[#D2D2FF] text-xl md:text-4xl font-bold'>
							{t.pageTitle}
						</h6>
					</div>

					{/* Third Row: Sidebar + Certificates */}
					<div className="flex w-full mt-8">
						{/* Sidebar - Fixed Width */}
						<div className="hidden xl:block w-[312px] shrink-0 sticky top-[140px]">
							<div className="h-fit">
								<Sidebar />
							</div>
						</div>

						{/* Certificates Content */}
						<div className="flex flex-col w-full sm:ml-10">
							{/* Tabs */}
							<div className="flex gap-1 mb-6 bg-[#1D1D2A] p-1 rounded-2xl w-fit">
								<button
									onClick={() => setActiveTab('courses')}
									className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
										activeTab === 'courses'
											? 'bg-[#6A56E4] text-white'
											: 'text-gray-400 hover:text-white'
									}`}
								>
									{t.tabCourses}
								</button>
								<button
									onClick={() => setActiveTab('my-certificates')}
									className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
										activeTab === 'my-certificates'
											? 'bg-[#6A56E4] text-white'
											: 'text-gray-400 hover:text-white'
									}`}
								>
									{t.tabMyCertificates}
								</button>
							</div>

							{/* Tab Content */}
							{activeTab === 'courses' ? <CertificatesList /> : <MyCertificates />}
						</div>
					</div>
				</div>
			</div>
		</ProtectedRoute>
	);
};

export default CertificatesPage;
