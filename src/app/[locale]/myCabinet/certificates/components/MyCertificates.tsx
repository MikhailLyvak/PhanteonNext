'use client'

import React from 'react'
import { useGetCertificates } from '@/hooks/Certificates/useGetCertificates'
import { Triangle } from 'react-loader-spinner'
import { ExternalLink, Download, Eye } from 'lucide-react'

const MyCertificates: React.FC = () => {
	const { data: certificatesData, isLoading, error } = useGetCertificates()

	if (isLoading) {
		return (
			<div className="flex justify-center items-center py-12">
				<Triangle
					visible={true}
					height={32}
					width={32}
					color="#6A56E4"
					ariaLabel="triangle-loading"
				/>
			</div>
		)
	}

	if (error) {
		return (
			<div className="bg-red-600 bg-opacity-20 border border-red-600 rounded-2xl p-6">
				<p className="text-red-400 text-center">
					Помилка завантаження сертифікатів. Спробуйте пізніше.
				</p>
			</div>
		)
	}

	const certificates = certificatesData?.certificates || []

	if (certificates.length === 0) {
		return (
			<div className="bg-[#242433] rounded-3xl p-8 text-center">
				<div className="w-16 h-16 mx-auto mb-4 bg-gray-600 rounded-full flex items-center justify-center">
					<Download size={32} className="text-gray-400" />
				</div>
				<h3 className="text-[#D2D2FF] text-xl font-semibold mb-2">
					У вас поки немає сертифікатів
				</h3>
				<p className="text-gray-400 text-sm">
					Завершіть модулі курсів, щоб отримати свої перші NFT сертифікати
				</p>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-[#D2D2FF] text-2xl font-bold">
					Мої сертифікати ({certificates.length})
				</h2>
			</div>

			<div className="grid gap-6">
				{certificates.map((certificate) => (
					<div key={certificate.id} className="bg-[#242433] rounded-3xl p-6">
						<div className="flex items-start gap-4">
							{/* Certificate Image */}
							<div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-700">
								{certificate.image_url ? (
									<img
										src={certificate.image_url}
										alt={`Certificate for ${certificate.course_name}`}
										className="w-full h-full object-cover"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center">
										<Download size={24} className="text-gray-400" />
									</div>
								)}
							</div>

							{/* Certificate Info */}
							<div className="flex-1 min-w-0">
								<div className="flex items-start justify-between mb-2">
									<div>
										<h3 className="text-[#D2D2FF] text-lg font-semibold truncate">
											{certificate.course_name}
										</h3>
										<p className="text-white text-sm">
											{certificate.module_name}
										</p>
									</div>
									<div className={`px-3 py-1 rounded-full text-xs font-semibold ${
										certificate.status === 'confirmed' 
											? 'bg-green-600 text-white'
											: certificate.status === 'issued'
												? 'bg-blue-600 text-white'
												: 'bg-yellow-600 text-white'
									}`}>
										{certificate.status === 'confirmed' ? 'Підтверджено' :
										 certificate.status === 'issued' ? 'Видано' : 'В обробці'}
									</div>
								</div>

								<div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
									<span>ID: {certificate.certificate_id}</span>
									<span>•</span>
									<span>{new Date(certificate.created_at).toLocaleDateString('uk-UA')}</span>
									<span>•</span>
									<span className="uppercase">{certificate.network}</span>
								</div>

								{certificate.nft_address && (
									<div className="text-xs text-gray-500 mb-3">
										NFT: {certificate.nft_address}
									</div>
								)}
							</div>
						</div>

						{/* Actions */}
						<div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-600">
							<a
								href={certificate.verification_url}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 px-4 py-2 bg-[#6A56E4] hover:bg-[#5A4BC4] text-white rounded-xl font-medium transition-colors"
							>
								<Eye size={16} />
								Переглянути
							</a>

							{certificate.image_url && (
								<a
									href={certificate.image_url}
									download
									className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors"
								>
									<Download size={16} />
									Завантажити
								</a>
							)}

							{certificate.metadata_url && (
								<a
									href={certificate.metadata_url}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors"
								>
									<ExternalLink size={16} />
									Метадані
								</a>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

export default MyCertificates
