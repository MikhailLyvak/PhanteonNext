'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Triangle } from 'react-loader-spinner'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'

import { confirmPasswordReset } from '@/api/Auth/getPasswordResetConfirm'
import { setNewPassword } from '@/api/Auth/patchSetNewPassword'
import { SetNewPasswordData, SetNewPasswordSchema } from '@/api/Auth/types'

// Backend validation messages arrive in English; translate the known ones to
// Ukrainian to match the rest of the UI. Unknown strings pass through as-is.
const SERVER_MESSAGE_UK: Record<string, string> = {
	'Invalid token': 'Посилання недійсне або застаріле',
	'Token is invalid or expired': 'Посилання недійсне або застаріле',
	'The reset link is invalid': 'Посилання недійсне або застаріле',
	'This password is too common.': 'Пароль занадто простий',
}

const translateServerError = (msg: string): string => {
	const trimmed = msg.trim()
	if (SERVER_MESSAGE_UK[trimmed]) return SERVER_MESSAGE_UK[trimmed]
	const minLen = trimmed.match(/at least (\d+) characters/i)
	if (minLen) return `Мінімум ${minLen[1]} символів`
	return msg
}

const pickFirst = (v: unknown): string | null =>
	Array.isArray(v) ? String(v[0]) : typeof v === 'string' ? v : null

const cardClass = 'bg-[#242433] rounded-2xl p-8 w-full max-w-[400px] shadow-xl'
const inputClass =
	'w-full p-3 pr-12 border rounded-lg text-gray-800 focus:ring focus:ring-[#6A56E4] focus:outline-none'

// Password input with a show/hide toggle, mirroring the settings screen.
function PasswordInput({
	field,
	error,
	placeholder,
}: {
	field: any
	error?: string
	placeholder: string
}) {
	const [show, setShow] = useState(false)
	return (
		<div className='mt-6'>
			<div className='relative'>
				<input
					{...field}
					type={show ? 'text' : 'password'}
					autoComplete='new-password'
					placeholder={placeholder}
					className={inputClass}
				/>
				<button
					type='button'
					onClick={() => setShow(s => !s)}
					aria-label={show ? 'Сховати пароль' : 'Показати пароль'}
					className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
				>
					{show ? <EyeOff size={18} /> : <Eye size={18} />}
				</button>
			</div>
			{error && <p className='text-red-500 text-sm mt-1'>{error}</p>}
		</div>
	)
}

export default function ResetPasswordPage() {
	const router = useRouter()
	const { uidb64, token } = useParams<{ uidb64: string; token: string }>()

	const [done, setDone] = useState(false)
	const [formError, setFormError] = useState<string | null>(null)

	// Step 2 — validate the link on page load.
	const {
		isPending: validating,
		isError: linkInvalid,
	} = useQuery({
		queryKey: ['password-reset-confirm', uidb64, token],
		queryFn: () => confirmPasswordReset(uidb64, token),
		enabled: !!uidb64 && !!token,
		retry: false,
		refetchOnWindowFocus: false,
	})

	const { control, handleSubmit, setError } = useForm<SetNewPasswordData>({
		resolver: zodResolver(SetNewPasswordSchema),
		defaultValues: { password: '', password_confirm: '' },
	})

	// Step 3 — set the new password.
	const { mutate, isPending: submitting } = useMutation({
		mutationFn: setNewPassword,
		onSuccess: () => {
			setDone(true)
			// Brief confirmation, then send the user to log in with the new password.
			setTimeout(() => router.replace('/login?reset=1'), 1500)
		},
		onError: (error: any) => {
			setFormError(null)
			const data = error?.response?.data

			// Field-keyed `password` error → onto the input.
			const passwordMsg = pickFirst(data?.password)
			if (passwordMsg) {
				setError('password', {
					type: 'server',
					message: translateServerError(passwordMsg),
				})
			}

			// Anything signalling the link itself is bad → general message that
			// points the user back to requesting a fresh link.
			const general =
				pickFirst(data?.non_field_errors) ??
				pickFirst(data?.token) ??
				pickFirst(data?.uidb64) ??
				pickFirst(data?.error) ??
				pickFirst(data?.detail)

			if (general) {
				setFormError(translateServerError(general))
			} else if (!passwordMsg) {
				setFormError('Не вдалося змінити пароль. Спробуйте пізніше.')
			}
		},
	})

	const onSubmit = (values: SetNewPasswordData) => {
		setFormError(null)
		mutate({ password: values.password, uidb64, token })
	}

	return (
		<div className='min-h-screen flex flex-col items-center justify-center bg-[#171723] px-4 py-12'>
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				className={cardClass}
			>
				<h1 className='text-xl sm:text-2xl font-bold text-[#D2D2FF] text-center'>
					Новий пароль
				</h1>

				{/* Validating the link */}
				{validating && (
					<div className='mt-8 flex flex-col items-center gap-3'>
						<Triangle
							visible
							height={40}
							width={40}
							color='#6A56E4'
							ariaLabel='triangle-loading'
						/>
						<p className='text-sm text-[#98A0B3]'>Перевіряємо посилання…</p>
					</div>
				)}

				{/* Invalid / expired link */}
				{!validating && linkInvalid && (
					<>
						<p className='mt-6 text-sm text-[#98A0B3] text-center leading-relaxed'>
							Посилання для скидання пароля недійсне або застаріло. Запитайте
							нове посилання та спробуйте ще раз.
						</p>
						<Link
							href='/forgotPassword'
							className='mt-6 w-full block text-center bg-[#6A56E4] text-white p-3 rounded-3xl hover:shadow-xl'
						>
							Запитати нове посилання
						</Link>
						<Link
							href='/login'
							className='mt-4 block text-center text-sm text-[#D2D2FF] hover:underline'
						>
							Повернутись до входу
						</Link>
					</>
				)}

				{/* Success */}
				{!validating && !linkInvalid && done && (
					<>
						<p className='mt-6 text-sm text-green-400 text-center leading-relaxed'>
							Пароль успішно змінено. Перенаправляємо на сторінку входу…
						</p>
						<Link
							href='/login'
							className='mt-6 w-full block text-center bg-[#6A56E4] text-white p-3 rounded-3xl hover:shadow-xl'
						>
							Увійти
						</Link>
					</>
				)}

				{/* Valid link — show the form */}
				{!validating && !linkInvalid && !done && (
					<>
						<p className='mt-4 text-sm text-gray-400 text-center'>
							Введіть новий пароль для вашого акаунта.
						</p>

						<form onSubmit={handleSubmit(onSubmit)}>
							<Controller
								control={control}
								name='password'
								render={({ field, fieldState }) => (
									<PasswordInput
										field={field}
										error={fieldState.error?.message}
										placeholder='Новий пароль'
									/>
								)}
							/>
							<Controller
								control={control}
								name='password_confirm'
								render={({ field, fieldState }) => (
									<PasswordInput
										field={field}
										error={fieldState.error?.message}
										placeholder='Повторіть новий пароль'
									/>
								)}
							/>

							<button
								type='submit'
								disabled={submitting}
								className='w-full mt-6 bg-[#6A56E4] text-white p-3 rounded-3xl hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-60'
							>
								{submitting && (
									<Triangle
										visible
										height={16}
										width={16}
										color='#fff'
										ariaLabel='triangle-loading'
									/>
								)}
								Зберегти пароль
							</button>

							{formError && (
								<p className='mt-3 text-center text-sm text-red-500'>
									{formError}
								</p>
							)}
						</form>

						<Link
							href='/login'
							className='mt-6 block text-center text-sm text-[#D2D2FF] hover:underline'
						>
							Повернутись до входу
						</Link>
					</>
				)}
			</motion.div>
		</div>
	)
}
