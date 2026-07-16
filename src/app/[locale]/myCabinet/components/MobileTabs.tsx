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
import { useCustomTranslations } from '@/lib/contexts/translations/translations-context'
import { TKeys } from '@/i18n/t-keys'

// Horizontal cabinet navigation rendered below xl, where the vertical Sidebar
// is hidden. Without this the cabinet has no inner navigation on mobile/tablet
// (see audit #4).
const MobileTabs = () => {
	const pathname = usePathname() ?? ''
	const { t } = useCustomTranslations(TKeys.cabinet.common)

	const items = [
		{ icon: User, text: t.personalData, href: '/myCabinet/personalData' },
		{ icon: GraduationCap, text: t.academy, href: '/myCabinet/studyPlatform' },
		{ icon: Award, text: t.certificates, href: '/myCabinet/certificates' },
		{ icon: CreditCard, text: t.subscriptions, href: '/myCabinet/subscriptions' },
		{ icon: Bot, text: t.algoTrading, href: '/myCabinet/tradingBots' },
		{ icon: Radar, text: t.screener, href: '/myCabinet/screener' },
		{ icon: Video, text: t.webinars, href: '/myCabinet/webinars' },
		{ icon: Settings, text: t.settings, href: '/myCabinet/settings' },
	]

	return (
		<nav
			aria-label={t.navigation}
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
