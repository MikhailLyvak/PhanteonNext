'use client'

import { Link } from '@/i18n/navigation'
import { useState, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Triangle } from 'react-loader-spinner'
import { motion } from 'framer-motion'

import { requestPasswordReset } from '@/api/Auth/postForgotPassword'
import { useCustomTranslations } from '@/lib/contexts/translations/translations-context'
import { TKeys } from '@/i18n/t-keys'

type FormData = { email: string }

export default function ForgotPasswordPage() {
	const [submitted, setSubmitted] = useState(false)

	const { t } = useCustomTranslations(TKeys.auth.forgotPassword)
	const { t: tValidation } = useCustomTranslations(TKeys.validation)

	const schema = useMemo(() => z.object({
		email: z.string().min(1, tValidation.emailRequired).email(tValidation.emailInvalid),
	}), [tValidation])

	const { mutate, isPending, isError } = useMutation({
		mutationFn: requestPasswordReset,
		onSuccess: () => setSubmitted(true),
	})

	const { control, handleSubmit } = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: { email: '' },
	})

	const onSubmit = (data: FormData) => mutate(data)

	return (
		<div className='min-h-screen flex flex-col items-center justify-center bg-[#171723] px-4 py-12'>
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				className='bg-[#242433] rounded-2xl p-8 w-full max-w-[400px] shadow-xl'
			>
				<h1 className='text-xl sm:text-2xl font-bold text-[#D2D2FF] text-center'>
					{t.title}
				</h1>

				{submitted ? (
					<>
						<p className='mt-6 text-sm text-[#98A0B3] text-center leading-relaxed'>
							{t.instructions}
						</p>
						<Link
							href='/login'
							className='mt-6 w-full block text-center bg-[#6A56E4] text-white p-3 rounded-3xl hover:shadow-xl'
						>
							{t.backToLogin}
						</Link>
					</>
				) : (
					<>
						<p className='mt-4 text-sm text-gray-400 text-center'>
							{t.description}
						</p>

						<form onSubmit={handleSubmit(onSubmit)}>
							<Controller
								control={control}
								name='email'
								render={({ field, fieldState }) => (
									<>
										<input
											{...field}
											type='text'
											inputMode='email'
											autoComplete='email'
											placeholder='Email'
											className='w-full mt-6 p-3 border rounded-lg text-gray-800 focus:ring focus:ring-[#6A56E4] focus:outline-none'
										/>
										{fieldState.error && (
											<p className='text-red-500 text-sm'>
												{fieldState.error.message}
											</p>
										)}
									</>
								)}
							/>

							<button
								type='submit'
								disabled={isPending}
								className='w-full mt-4 bg-[#6A56E4] text-white p-3 rounded-3xl hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-60'
							>
								{isPending && (
									<Triangle
										visible
										height={16}
										width={16}
										color='#fff'
										ariaLabel='triangle-loading'
									/>
								)}
								{t.submit}
							</button>

							{isError && (
								<p className='mt-2 text-center text-sm text-red-500'>
									{t.errorGeneral}
								</p>
							)}
						</form>

						<Link
							href='/login'
							className='mt-6 block text-center text-sm text-[#D2D2FF] hover:underline'
						>
							{t.backToLogin}
						</Link>
					</>
				)}
			</motion.div>
		</div>
	)
}
