'use client'

import React from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import AdaptiveButtons from './AdaptiveButtons'
import { useUserStore } from '@/store/UserData/useUserStore'
import { useCustomTranslations } from '@/lib/contexts/translations/translations-context'
import { TKeys } from '@/i18n/t-keys'

interface Props {
	textColor?: string
}

const HeaderNav: React.FC<Props> = ({ textColor = 'text-black' }) => {
	const { t: tNav } = useCustomTranslations(TKeys.nav)
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
					<div className='font-bold text-sm xl:text-base'>{tNav.shopUpper}</div>
					<div className='font-bold text-sm xl:text-base'>E-BALANCE PRO</div>
					<Link
						href='/myCabinet/studyPlatform'
						className='font-bold text-sm xl:text-base hover:text-[#D2D2FF] transition-colors'
					>
						{tNav.academyVbUpper}
					</Link>
					<Link
						href='/webinars'
						className='font-bold text-sm xl:text-base hover:text-[#D2D2FF] transition-colors'
					>
						{tNav.webinarsUpper}
					</Link>
					<div className='font-bold text-sm xl:text-base'>{tNav.aboutUsUpper}</div>
					<div className='font-bold text-sm xl:text-base'>{tNav.blogUpper}</div>
				</div>

				<AdaptiveButtons />
			</div>

			<div className='hidden lg:group-hover:block w-full bg-white'>
				<div className='max-w-3xl mx-auto pt-7 pb-14'>
					<div className='flex justify-between'>
						<div className='text-gray-800 text-base font-normal flex-col space-y-3'>
							<div>{tNav.menuSets}</div>
							<div>{tNav.menuVitaminComplexes}</div>
							<div>{tNav.menuMineralComplexes}</div>
							<div>{tNav.menuImmunityAntioxidants}</div>
							<div>{tNav.menuSoundSleep}</div>
							<div>{tNav.menuSoundSleep}</div>
							<div>{tNav.menuSoundSleep}</div>
							<div>{tNav.menuSoundSleep}</div>
							<div>{tNav.menuSoundSleep}</div>
							<div>{tNav.menuSoundSleep}</div>
							<div>{tNav.menuSoundSleep}</div>
						</div>
						<div className='text-gray-800 text-base font-normal flex-col space-y-3'>
							<Link href='/customCources/EmotInt'>{tNav.menuEmotionalIntelligence}</Link>
							<Link href='/myCabinet/webinars'>{tNav.menuWebinars}</Link>
							<div>{tNav.menuCustomCourse}</div>
							<div>{tNav.menuCustomCourse}</div>
							<div>{tNav.menuCustomCourse}</div>
							<div>{tNav.menuCustomCourse}</div>
						</div>
						<div className='text-gray-800 text-base font-normal flex-col space-y-3'>
							<div>{tNav.menuTeam}</div>
							<div>{tNav.menuSocialResponsibility}</div>
							<div>
								<Link href='/contacts/'>{tNav.menuContacts}</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default HeaderNav
