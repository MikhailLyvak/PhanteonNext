'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import LoginModalFormComponent from '../components/Auth/components/Login'
import Register from '../components/Auth/components/Register'
import { useAuthModalStore } from '@/store/AuthModal/useAuthModalStore'

export default function LoginPage() {
	const { activeTab, setActiveTab } = useAuthModalStore()
	// Read the deletion flag client-side (mirrors AuthModal) to avoid the
	// useSearchParams() Suspense requirement and any hydration mismatch.
	const [accountDeleted, setAccountDeleted] = useState(false)

	useEffect(() => {
		const params = new URLSearchParams(window.location.search)
		setAccountDeleted(params.get('account_deleted') === '1')
	}, [])

	return (
		<div className='min-h-screen flex flex-col items-center justify-center bg-[#171723] gap-6'>
			{accountDeleted && (
				<p className='text-sm text-green-400 font-medium text-center max-w-[500px] bg-green-400/10 border border-green-400/30 rounded-xl px-4 py-3'>
					Ваш акаунт видалено.
				</p>
			)}
			<p className='mt-6 text-lg text-[#fff] font-bold text-center max-w-[500px]'>
				<span className='text-xl font-bold uppercase text-[#e0b75e]'>
					Скрінер
				</span>{' '}
				- інструмент для системного аналізу ринку та відбору активів за заданими
				параметрами. Доступний після реєстрації.
			</p>
			<motion.div
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				className='bg-[#242433] rounded-2xl p-8 w-[400px] shadow-xl'
			>
				<div className='flex justify-center space-x-6 border-b pb-4'>
					<button
						className={`text-lg pb-1 ${
							activeTab === 'login'
								? 'font-semibold text-[#D2D2FF]'
								: 'text-[#58587B] hover:text-[#D2D2FF]'
						}`}
						onClick={() => setActiveTab('login')}
					>
						Вхід
					</button>
					<button
						className={`text-lg pb-1 ${
							activeTab === 'register'
								? 'font-semibold text-[#D2D2FF]'
								: 'text-[#58587B] hover:text-[#D2D2FF]'
						}`}
						onClick={() => setActiveTab('register')}
					>
						Реєстрація
					</button>
				</div>

				{activeTab === 'login' ? <LoginModalFormComponent /> : <Register />}
			</motion.div>
		</div>
	)
}
