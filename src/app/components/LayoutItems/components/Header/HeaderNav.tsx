import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import AdaptiveButtons from './AdaptiveButtons'
import { useUserStore } from '@/store/UserData/useUserStore'

interface Props {
	textColor?: string
}

const HeaderNav: React.FC<Props> = ({ textColor = 'text-black' }) => {
	const hoverTextColorClass =
		textColor === 'text-black'
			? 'lg:group-hover:text-gray-800'
			: 'lg:group-hover:text-black'

	return (
		<div className='group absolute top-0 w-full z-50'>
			<div
				className={`
          w-full h-[120px]
          border-b border-b-gray-600
          flex items-center justify-between
          p-3 sm:p-[34px]
          bg-transparent
          transition-colors duration-300
          lg:group-hover:bg-white
          ${textColor}
          ${hoverTextColorClass}
        `}
			>
				<Link href='/' className='group relative'>
					<Image
						src='/Header/LogoColored.png'
						alt='PantheonX Logo'
						fill={true}
						className='object-contain w-[130px] h-[48px] xl:w-[184px] md:h-[58px] hidden lg:group-hover:block !relative'
					/>
					<Image
						src='/Header/Logo.svg'
						alt='Body Text'
						fill={true}
						className='object-contain w-[130px] h-[48px] xl:w-[184px] md:h-[58px] block lg:group-hover:hidden !relative'
						priority
					/>
				</Link>

				<div className='2xl:gap-10 gap-5 hidden lg:flex'>
					<div className='font-bold text-sm xl:text-base'>МАГАЗИН</div>
					<div className='font-bold text-sm xl:text-base'>E-BALANCE PRO</div>
					<Link
						href='/myCabinet/studyPlatform'
						className='font-bold text-sm xl:text-base hover:text-[#D2D2FF] transition-colors'
					>
						АКАДЕМІЯ VB
					</Link>
					<Link
						href='/vebinars'
						className='font-bold text-sm xl:text-base hover:text-[#D2D2FF] transition-colors'
					>
						ВЕБІНАРИ
					</Link>
					<div className='font-bold text-sm xl:text-base'>ПРО НАС</div>
					<div className='font-bold text-sm xl:text-base'>БЛОГ</div>
				</div>

				<AdaptiveButtons
					textColor={textColor}
					hoverTextColorClass={hoverTextColorClass}
				/>
			</div>

			<div className='hidden lg:group-hover:block w-full bg-white'>
				<div className='max-w-3xl mx-auto pt-7 pb-14'>
					<div className='flex justify-between'>
						<div className='text-gray-800 text-base font-normal flex-col space-y-3'>
							<div>Набори</div>
							<div>Вітамінні комлекси</div>
							<div>Мінеральні комплекси</div>
							<div>Імунутет та Антикосиданти</div>
							<div>Міцний сон</div>
							<div>Міцний сон</div>
							<div>Міцний сон</div>
							<div>Міцний сон</div>
							<div>Міцний сон</div>
							<div>Міцний сон</div>
							<div>Міцний сон</div>
						</div>
						<div className='text-gray-800 text-base font-normal flex-col space-y-3'>
							<Link href='/customCources/EmotInt'>Емоційний інтелект</Link>
							<Link href='/myCabinet/vebinars'>Вебінари</Link>
							<div>Кастомний курс</div>
							<div>Кастомний курс</div>
							<div>Кастомний курс</div>
							<div>Кастомний курс</div>
						</div>
						<div className='text-gray-800 text-base font-normal flex-col space-y-3'>
							<div>Команда</div>
							<div>Соціальна відповідальність</div>
							<div>
								<Link href='/contacts/'>Контакти</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default HeaderNav
