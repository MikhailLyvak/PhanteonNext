import React from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { setRequestLocale } from 'next-intl/server'
import { getCustomTranslations } from '@/lib/contexts/translations/translations-server'
import { TKeys } from '@/i18n/t-keys'

export default async function About({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params
	setRequestLocale(locale)
	const { t } = await getCustomTranslations(TKeys.about)
	const { t: tCommon } = await getCustomTranslations(TKeys.common, locale)
	return (
		<>
			<div className='pb-20 max-w-[1320px] w-full mx-auto'>
				<div className='my-8 ml-4 [1320px]:ml-0'>
					<nav className='flex items-center' aria-label='Breadcrumb'>
						<ol className='inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse'>
							<li>
								<Link
									href='/'
									className='text-xs sm:text-sm font-normal hover:font-semibold text-[#D2D2FF]'
								>
									{tCommon.home}
								</Link>
							</li>
							<li className='text-lg font-extrabold pl-1 text-[#D2D2FF]'>•</li>
							<li>
								<Link
									href='/About'
									className='text-xs sm:text-sm font-semibold md:ms-2 text-[#D2D2FF]'
								>
									{t.breadcrumb}
								</Link>
							</li>
						</ol>
					</nav>
				</div>
				<div className=' px-4 flex flex-col lg:flex-row items-center gap-[136px]'>
					<div className='flex-shrink-0 relative'>
						<div className='relative z-10'>
							<Image
								src='/About/ManinJacket.png'
								alt='ManinJacket'
								width={538}
								height={620}
								className='mx-auto w-auto'
							/>
						</div>
					</div>

					<div className='max-w-[650px] text-left'>
						<h1 className='text-[#D2D2FF] text-2xl md:text-5xl font-bold'>
							{t.igorTitle}
						</h1>
						<p className='text-white text-sm md:text-2xl mt-2'>
							{t.igorBio({ b: (chunks) => <span className='font-bold'>{chunks}</span> })}
						</p>

						<div className='bg-[#2A2A39] rounded-[15px] mt-6 p-5'>
							<p className='text-white text-sm md:text-lg font-bold mb-3'>
								{t.resultsTitle}
							</p>
							<ul className='list-disc pl-5 space-y-2 text-white text-sm md:text-base'>
								<li>
									<span className='text-[#D2D2FF] font-bold'>
										{t.top3Trader}
									</span>{t.top3TraderDesc}
								</li>
								<li>
									<span className='text-[#D2D2FF] font-bold'>
										{t.profit80}
									</span>{t.profit80Desc}
								</li>
								<li>
									{t.marketplacePre}
									<span className='text-[#D2D2FF] font-bold'>{t.marketplace}</span>{' '}
									{t.marketplaceDesc}
								</li>
								<li>
									<span className='text-[#D2D2FF] font-bold'>
										{t.accuracy95}
									</span>{t.accuracy95Desc}
								</li>
							</ul>
						</div>

						<div className='mt-10 flex items-center gap-4'>
							<Image
								src='/About/MissionIcon.svg'
								alt='Mission'
								width={58}
								height={58}
								className='w-[38px] h-[38px] md:w-[58px] md:h-[58px]'
							/>
							<p className='text-[#D2D2FF] text-sm md:text-2xl font-bold'>
								{t.missionText}
							</p>
						</div>

						<div className='mt-10'>
							<p className='text-white text-xl md:text-2xl font-bold mb-3'>
								{t.workWithTitle}
							</p>
							<ul className='space-y-4'>
								<li className='flex items-start gap-2 bg-[#1D1D2A] rounded-2xl py-4 pl-[10px]'>
									<Image
										src='/About/checkmark.svg'
										alt='check'
										width={24}
										height={24}
									/>
									<span className='text-white text-sm md:text-base'>
										{t.workWith1}
									</span>
								</li>
								<li className='flex items-start gap-2 bg-[#1D1D2A] rounded-2xl py-4 pl-[10px]'>
									<Image
										src='/About/checkmark.svg'
										alt='check'
										width={24}
										height={24}
									/>
									<span className='text-white text-sm md:text-base'>
										{t.workWith2}
									</span>
								</li>
								<li className='flex items-start gap-2 bg-[#1D1D2A] rounded-2xl py-4 pl-[10px]'>
									<Image
										src='/About/checkmark.svg'
										alt='check'
										width={24}
										height={24}
									/>
									<span className='text-white text-sm md:text-base'>
										{t.workWith3}
									</span>
								</li>
							</ul>
						</div>
					</div>
				</div>

				<div className='px-4 my-20'>
					<Link
						href='https://pantheonx.club/interview'
						className='block w-full max-w-[1320px] mx-auto bg-[#1D1D2A] hover:bg-[#242437] transition rounded-2xl p-6 md:p-8 border border-[#2A2A39]'
					>
						<div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
							<p className='text-white text-base md:text-xl font-semibold'>
								{t.dontKnowStart}{' '}
								<span className='text-[#D2D2FF] font-bold'>
									{t.aiHelp}
								</span>
							</p>

							<span className='inline-flex items-center justify-center px-5 py-3 rounded-xl bg-[#D2D2FF] text-[#171723] font-bold text-sm md:text-base'>
								{t.goToInterview}
							</span>
						</div>
					</Link>
				</div>

				{/* Eduard Tiasko Section */}
				<div className='max-w-[1320px] w-full mx-auto px-4 flex flex-col lg:flex-row-reverse items-center gap-[136px]'>
					<div className='flex-shrink-0 relative'>
						<div className='relative z-10'>
							<Image
								src='/About/EduardTiasko.png'
								alt='Eduard Tiasko'
								width={538}
								height={620}
								className='mx-auto w-auto'
							/>
						</div>
					</div>

					<div className='max-w-[650px] text-left'>
						<h2 className='text-[#D2D2FF] text-2xl md:text-5xl font-bold'>
							{t.eduardTitle}
						</h2>

						<p className='text-white text-sm md:text-lg mt-4'>
							{t.eduardPath1}
						</p>

						<p className='text-white text-sm md:text-lg mt-4'>
							{t.eduardPath2}
						</p>

						<div className='bg-[#2A2A39] rounded-[15px] mt-6 p-5'>
							<p className='text-white text-sm md:text-lg font-bold mb-3'>
								{t.eduardRealityTitle}
							</p>
							<ul className='list-disc pl-5 space-y-2 text-white text-sm md:text-base'>
								<li>{t.realityItem1}</li>
								<li>{t.realityItem2}</li>
								<li>{t.realityItem3}</li>
								<li>{t.realityItem4}</li>
							</ul>
						</div>

						<p className='text-white text-sm md:text-lg mt-6'>
							<span className='text-[#D2D2FF] font-bold'>{t.eduardNotGiveUp}</span>
						</p>

						<p className='text-white text-sm md:text-lg mt-4'>
							{t.eduardStudied}
						</p>

						<p className='text-white text-sm md:text-lg mt-4'>
							{t.eduardNowStable}
						</p>

						<p className='text-white text-sm md:text-lg mt-4'>
							{t.eduardFoundation1}
							<span className='text-[#D2D2FF] font-bold'>PantheonX</span>
							{t.eduardFoundation2}
						</p>

						<div className='bg-[#1D1D2A] rounded-2xl mt-6 p-5'>
							<p className='text-[#D2D2FF] text-sm md:text-lg font-bold mb-3'>
								{t.pantheonXTitle}
							</p>
							<ul className='space-y-2 text-white text-sm md:text-base'>
								<li className='flex items-start gap-2'>
									<span className='text-[#D2D2FF]'>🔹</span>
									<span>{t.pantheonXItem1}</span>
								</li>
								<li className='flex items-start gap-2'>
									<span className='text-[#D2D2FF]'>🔹</span>
									<span>{t.pantheonXItem2}</span>
								</li>
								<li className='flex items-start gap-2'>
									<span className='text-[#D2D2FF]'>🔹</span>
									<span>{t.pantheonXItem3}</span>
								</li>
								<li className='flex items-start gap-2'>
									<span className='text-[#D2D2FF]'>🔹</span>
									<span>
										{t.pantheonXItem4}
									</span>
								</li>
							</ul>
						</div>

						<div className='mt-8 p-5 bg-gradient-to-r from-[#2A2A39] to-[#1D1D2A] rounded-[15px] border-l-4 border-[#D2D2FF]'>
							<p className='text-white text-sm md:text-lg text-center'>
								{t.finalCta1}<br />
								<span className='text-[#D2D2FF] font-bold'>
									{t.finalCta2}
								</span>
								<br />{t.finalCta3}
							</p>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}
