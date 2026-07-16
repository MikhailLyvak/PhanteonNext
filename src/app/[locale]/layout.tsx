import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import '@/app/globals.css'
import Footer from './components/LayoutItems/Footer'
import LoginModal from './components/Auth/AuthModal'
import QueryProvider from '@/providers/QueryProvider'
import Drawer from './components/HeaderComps/Drawer'
import MainDrawer from './components/HeaderComps/Drawers/MainDrawer'
import InnerWhiteHeader from './components/LayoutItems/components/Header/InnerWhiteHeader'
import Script from 'next/script'
import { MetaPixel } from './MetaPixel/MetaPixel'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'

const montserrat = Montserrat({
	subsets: ['latin', 'cyrillic'],
	weight: ['400', '700'],
	variable: '--font-montserrat',
})

export const metadata: Metadata = {
	title: 'PantheonX',
	description: 'PantheonX crypto dashboard',
	applicationName: 'PantheonX',
	category: 'cryptology',
	icons: {
		icon: '/favicon.ico',
		shortcut: '/favicon.ico',
		apple: '/favicon.png',
	},
	formatDetection: {
		email: true,
	},
	openGraph: {
		title: 'PantheonX',
		description: 'PantheonX crypto dashboard',
		url: 'https://www.pantheonx.club',
		siteName: 'PantheonX',
		images: [
			{
				url: 'https://www.pantheonx.club/Header/og-image.png',
				width: 300,
				height: 200,
			},
		],
		locale: 'uk-UA',
		type: 'website',
	},
	robots: {
		index: true,
		follow: true,
		nocache: false,
		googleBot: {
			index: true,
			follow: true,
			noimageindex: false,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
}

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }))
}

export default async function RootLayout({
	children,
	params,
}: Readonly<{
	children: React.ReactNode
	params: Promise<{ locale: string }>
}>) {
	const { locale } = await params
	if (!hasLocale(routing.locales, locale)) notFound()
	setRequestLocale(locale)

	return (
		<html lang={locale} className={montserrat.variable}>
			<head>
				<meta
					name='facebook-domain-verification'
					content='mu6ps5yr9yq5ds3w8i7yezpzb21far'
				/>
				<>
					<Script
						id='fb-pixel-script'
						strategy='afterInteractive'
						dangerouslySetInnerHTML={{
							__html: `
								!function(f,b,e,v,n,t,s)
								{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
								n.callMethod.apply(n,arguments):n.queue.push(arguments)};
								if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
								n.queue=[];t=b.createElement(e);t.async=!0;
								t.src=v;s=b.getElementsByTagName(e)[0];
								s.parentNode.insertBefore(t,s)}(window, document,'script',
								'https://connect.facebook.net/en_US/fbevents.js');
								fbq('init', '1464612674823977');
								fbq('track', 'PageView');
								`,
						}}
					/>
					<noscript>
						<img
							height='1'
							width='1'
							style={{ display: 'none' }}
							src={`https://www.facebook.com/tr?id=1464612674823977&ev=PageView&noscript=1`}
						/>
					</noscript>
				</>
			</head>
			<body className={`bg-[#171723] antialiased min-h-screen flex flex-col`}>
				{/* <MetaPixel /> */}
				<QueryProvider>
					<NextIntlClientProvider>
						<InnerWhiteHeader />
						<LoginModal />
						<Drawer />
						<MainDrawer />
						<main className='flex-1 pt-1 md:pt-2'>{children}</main>
						<Footer />
					</NextIntlClientProvider>
				</QueryProvider>
			</body>
		</html>
	)
}
