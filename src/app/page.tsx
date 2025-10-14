'use client'

import { Montserrat } from 'next/font/google'
import '@/app/globals.css'
import { useEffect } from 'react'

const montserrat = Montserrat({
	subsets: ['latin'],
	weight: ['400', '700'],
	variable: '--font-montserrat',
})

export default function Home() {
	useEffect(() => {
		window.location.href = '/myCabinet/studyPlatform'
	}, [])
	return (
		<div className={`${montserrat.variable}`}>
			{/* Main page content goes here */}
			<div className='flex-1 flex items-center justify-center'>
				<h1 className='text-[#D2D2FF] text-4xl font-bold'>
					Welcome to PantheonX
				</h1>
			</div>
		</div>
	)
}
