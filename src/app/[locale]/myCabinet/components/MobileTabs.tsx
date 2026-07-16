'use client'

import { Link, usePathname } from '@/i18n/navigation'
import {
	User,
	GraduationCap,
	Award,
	CreditCard,
	Bot,
	Radar,
	Video,
	Settings,
} from 'lucide-react'

// Horizontal cabinet navigation rendered below xl, where the vertical Sidebar
// is hidden. Without this the cabinet has no inner navigation on mobile/tablet
// (see audit #4).
const items = [
	{ icon: User, text: 'Персональні дані', href: '/myCabinet/personalData' },
	{ icon: GraduationCap, text: 'Академія', href: '/myCabinet/studyPlatform' },
	{ icon: Award, text: 'Сертифікати', href: '/myCabinet/certificates' },
	{ icon: CreditCard, text: 'Підписки', href: '/myCabinet/subscriptions' },
	{ icon: Bot, text: 'Алготрейдинг', href: '/myCabinet/tradingBots' },
	{ icon: Radar, text: 'Скрінер', href: '/myCabinet/screener' },
	{ icon: Video, text: 'Вебінари', href: '/myCabinet/webinars' },
	{ icon: Settings, text: 'Налаштування', href: '/myCabinet/settings' },
]

const MobileTabs = () => {
	const pathname = usePathname() ?? ''

	return (
		<nav
			aria-label='Навігація кабінету'
			className='xl:hidden -mx-4 md:-mx-6 px-4 md:px-6 overflow-x-auto'
		>
			<ul className='flex gap-2 py-2 min-w-max'>
				{items.map(({ icon: Icon, text, href }) => {
					const active = pathname === href || pathname.startsWith(href + '/')
					return (
						<li key={href}>
							<Link
								href={href}
								className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
									active
										? 'bg-[#D2D2FF] text-[#171723] font-semibold'
										: 'bg-[#242433] text-[#D2D2FF] hover:bg-[#2F2F40]'
								}`}
							>
								<Icon size={16} />
								<span>{text}</span>
							</Link>
						</li>
					)
				})}
			</ul>
		</nav>
	)
}

export default MobileTabs
