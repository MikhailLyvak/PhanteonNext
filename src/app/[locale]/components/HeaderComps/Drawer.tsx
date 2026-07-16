'use client'

import React, { useEffect, useState } from 'react'
import {
	X,
	User,
	List,
	Clock,
	GraduationCap,
	Settings,
	LogOut,
	CheckCircle,
	Video,
	Award,
	Bot,
	MessageCircleMore,
} from 'lucide-react'
import { MdArrowBackIosNew } from 'react-icons/md'
import { useDrawerStore } from '@/store/Nav/useDrawerStore'
import { useUserStore } from '@/store/UserData/useUserStore'
import { useAlgonixSessionStore } from '@/store/TradingBots/useAlgonixSessionStore'
import { Cookies } from 'react-cookie'
import { Link, useRouter } from '@/i18n/navigation'
import LoginButton from './LoginButton'
import Image from 'next/image'
import { useMainDrawerStore } from '@/store/Nav/useMainDrawerStore'
import { LuChartLine } from 'react-icons/lu'

const Drawer = () => {
	const { isDrawerOpen, closeDrawer } = useDrawerStore()
	const { toggleMainDrawer } = useMainDrawerStore()
	const { user, clearUser } = useUserStore()
	const router = useRouter()
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	const logout = () => {
		const cookies = new Cookies()
		cookies.remove('local_access_token', { path: '/' })
		clearUser()
		useAlgonixSessionStore.getState().clearSession()
		closeDrawer()
		router.push('/login')
	}

	if (!mounted) return null

	return (
		<div
			className={`fixed top-0 right-0 z-50 h-screen w-80 bg-[#171723] shadow-xl transition-transform duration-300 ease-in-out ${
				isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
			}`}
		>
			{/* Close Button */}
			<div className='flex justify-between gap-[10px] m-3'>
				<Link href='/' className='flex relative' onClick={closeDrawer}>
					<Image
						src='/Header/LogoColoredSmall.svg'
						alt='Phanteon Logo'
						fill={true}
						className='object-contain !relative'
						priority={true}
					/>
				</Link>
				<button
					onClick={() => closeDrawer()}
					className='flex items-center justify-center text-white bg-[#58587B] rounded-xl h-12 w-12'
				>
					<X size={40} />
				</button>
			</div>

			{/* Top Section: User Info */}
			<div className='flex items-center mt-20 mb-12 gap-5 p-4'>
				<div className='w-14 h-14 rounded-full bg-[#a7a7ca] flex items-center justify-center text-white font-bold text-xl p-7'>
					{user?.email?.charAt(0).toUpperCase() || 'U'}
				</div>
				<h2 className='text-lg text-[#D2D2FF] font-semibold'>
					{user?.email?.split('@')[0] || 'Користувач'}
				</h2>
			</div>

			{/* Middle Section: Navigation */}
			<nav className='flex-grow px-3'>
				<NavItem
					icon={<User size={20} />}
					text='Персональні дані'
					closeDrawer={closeDrawer}
					link='/myCabinet/personalData'
				/>
				<NavItem
					icon={<Bot size={20} />}
					text='Алготрейдинг'
					closeDrawer={closeDrawer}
					link='/myCabinet/tradingBots'
				/>

				{/* <NavItem
					icon={<Bot size={20} />}
					text="АІ Інтерв'ю"
					closeDrawer={closeDrawer}
					link='https://pantheonx.club/interview'
				/> */}
				{/* <NavItem
					icon={<Award size={20} />}
					text='Сертифікати'
					closeDrawer={closeDrawer}
					link='/myCabinet/certificates'
				/> */}
				{/* <NavItem
					icon={<Video size={20} />}
					text='Вебінари'
					closeDrawer={closeDrawer}
					link='/webinars'
				/> */}
				<NavItem
					icon={<LuChartLine size={20} />}
					text='Screener'
					closeDrawer={closeDrawer}
					link='/myCabinet/screener'
				/>
				<NavItem
					icon={<MessageCircleMore size={20}/>}
					text='Трейдинг-чат'
					closeDrawer={closeDrawer}
					link='/Trading-Chat'
				/>
				<NavItem
					icon={<LuChartLine size={20} />}
					text='Блог'
					closeDrawer={closeDrawer}
					link='/Blog'
				/>
				<NavItem
					icon={<GraduationCap size={20} />}
					text='Навчання'
					closeDrawer={closeDrawer}
					link='/myCabinet/studyPlatform'
				/>
				<NavItem
					icon={<Settings size={20} />}
					text='Налаштування'
					closeDrawer={closeDrawer}
					link='/myCabinet/settings'
				/>
			</nav>

			{/* Bottom Section: Logout Button */}
			<div className='p-4 mt-auto'>
				<button
					onClick={logout}
					className='w-full flex items-center space-x-3 text-[#D2D2FF] p-3 rounded-lg hover:bg-[#2F2F40] transition'
				>
					<span className='w-10 h-10 flex items-center justify-center bg-[#a7a7ca] rounded-full text-white'>
						<LogOut size={20} />
					</span>
					<span className='text-lg font-medium'>Вихід</span>
				</button>
			</div>
		</div>
	)
}

const NavItem = ({
	icon,
	text,
	link,
	closeDrawer,
}: {
	icon: React.ReactNode
	text: string
	link?: string
	closeDrawer: () => void
}) => (
	<Link href={link || '#'} className='w-full'>
		<button
			className='w-full flex items-center space-x-2 text-[#D2D2FF]] py-3 rounded-lg hover:bg-[#2F2F40] transition'
			onClick={() => closeDrawer()}
		>
			<span className='w-10 h-10 flex items-center justify-center rounded-full'>
				{icon}
			</span>
			<span className='text-lg font-medium'>{text}</span>
		</button>
	</Link>
)

export default Drawer
