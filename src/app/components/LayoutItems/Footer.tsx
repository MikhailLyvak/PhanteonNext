'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useUserStore } from '@/store/UserData/useUserStore'
import { useAuthModalStore } from '@/store/AuthModal/useAuthModalStore'

import { LuInstagram } from 'react-icons/lu'
import { PiTelegramLogo, PiYoutubeLogo } from 'react-icons/pi'
import { useGetLastVebinar } from '@/hooks/Vebinars/useGetLastVebinar'
import { useGetUserSubscriptions } from '@/hooks/Subscriptions/useGetUserSubscriptions'

const Footer = () => {
	// const { data: lastVebinar, isLoading } = useGetLastVebinar()
	const user = useUserStore(state => state.user)
	const { toggleModal } = useAuthModalStore()
	//const { data: subscriptionsData } = useGetUserSubscriptions()

	const handleAcademyClick = (e: React.MouseEvent) => {
		if (!user) {
			e.preventDefault()
			toggleModal() // Open login modal if not authenticated
		}
	}

	return (
		<footer className='bg-[#171723]'>
			{/* Main footer content */}
			<div className='border-t border-[#242433]'>
				<div className='max-w-8xl mx-auto px-4 md:py-6'>
					<div className='flex max-md:flex-col justify-between items-center py-6'>
						<div className='flex items-center'>
							<Link href='/' className='flex items-center relative'>
								<Image
									src='/Header/LogoColored.svg'
									alt='Pantheon'
									fill={true}
									className='object-contain !relative'
									priority
								/>
							</Link>
						</div>

						<div className='flex max-md:flex-col max-md:my-10 items-center gap-3 md:gap-8'>
							{/* <Link
								href='/About'
								className='text-[#D2D2FF] hover:text-white transition-colors'
							>
								Про нас
							</Link>
							<Link
								href='/Blog'
								className='text-[#D2D2FF] hover:text-white transition-colors'
							>
								Блог
							</Link> */}
							{/* <Link
								href='/AI-Agent'
								className='text-[#D2D2FF] hover:text-white transition-colors'
							>
								АІ-агенти
							</Link> */}
							{/* <Link
								href='/vebinars'
								className='text-[#D2D2FF] hover:text-white transition-colors'
							>
								Вебінари
							</Link> */}
							{/* {!subscriptionsData?.has_active_subscription && (
								<Link
									href='/paywall'
									className='text-[#D2D2FF] hover:text-white transition-colors'
								>
									Підписки
								</Link>
							)} */}
							{user ? (
								<Link
									href='/myCabinet/studyPlatform'
									className='text-[#D2D2FF] hover:text-white transition-colors'
								>
									Навчання
								</Link>
							) : (
								<button
									onClick={handleAcademyClick}
									className='text-[#D2D2FF] hover:text-white transition-colors bg-transparent border-none cursor-pointer'
								>
									Навчання
								</button>
							)}
							<Link
								href='https://screener.pantheonx.club/'
								className='text-[#D2D2FF] hover:text-white transition-colors'
							>
								Screener
							</Link>
						</div>

						<div className='flex items-center gap-4'>
							<Link
								href='https://www.youtube.com/@igorporokh'
								target='_blank'
								rel='noopener noreferrer'
							>
								<PiYoutubeLogo
									size={38}
									className='text-[#D2D2FF] hover:text-white transition-colors'
								/>
							</Link>
							<Link
								href='https://www.instagram.com/igor_porokh/'
								target='_blank'
								rel='noopener noreferrer'
							>
								<LuInstagram
									size={32}
									className='text-[#D2D2FF] hover:text-white transition-colors'
								/>
							</Link>
							<Link
								href='https://t.me/roadfromatoz'
								target='_blank'
								rel='noopener noreferrer'
							>
								<PiTelegramLogo
									size={32}
									className='text-[#D2D2FF] hover:text-white transition-colors'
								/>
							</Link>
						</div>
					</div>
				</div>
			</div>

			{/* Copyright section with darker background */}
			<div className='bg-[#13131B]'>
				<div className='max-w-8xl mx-auto px-4 py-4'>
					<div className='flex max-md:flex-col justify-between items-center text-sm text-[#58587B]'>
						<div>Copyright © 2026 PantheonX. Всі права захищено.</div>
						<div>
							<Link
								href='/privacy'
								className='hover:text-[#D2D2FF] transition-colors'
							>
								Політика конфіденційності
							</Link>
						</div>
					</div>
				</div>
			</div>
		</footer>
	)
}

export default Footer
