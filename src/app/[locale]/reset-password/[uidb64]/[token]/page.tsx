'use client'

import { useState, useMemo } from 'react'
import { Link, useRouter } from '@/i18n/navigation'
import { useParams } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Triangle } from 'react-loader-spinner'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'

import { confirmPasswordReset } from '@/api/Auth/getPasswordResetConfirm'
import { setNewPassword } from '@/api/Auth/patchSetNewPassword'
import { SetNewPasswordData, createSetNewPasswordSchema } from '@/api/Auth/types'
import { useCustomTranslations } from '@/lib/contexts/translations/translations-context'
import { TKeys } from '@/i18n/t-keys'

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
	const { t: tAuth } = useCustomTranslations(TKeys.auth.resetPassword)
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
					aria-label={show ? tAuth.hidePassword : tAuth.showPassword}
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

	const { t: tAuth } = useCustomTranslations(TKeys.auth.resetPassword)
	const { t: tValidation } = useCustomTranslations(TKeys.validation)
	const setNewPasswordSchema = useMemo(() => createSetNewPasswordSchema(tValidation), [tValidation])

	const translateServerError = (msg: string): string => {
		const trimmed = msg.trim()
		if (trimmed === 'Invalid token' || trimmed === 'Token is invalid or expired' || trimmed === 'The reset link is invalid') {
			return tAuth.serverErrorInvalidToken
		}
		if (trimmed === 'This password is too common.') {
			return tAuth.serverErrorPasswordTooCommon
		}
		const minLen = trimmed.match(/at least (\d+) characters/i)
		if (minLen) return tValidation.minChars({ count: Number(minLen[1]) })
		return msg
	}

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
		resolver: zodResolver(setNewPasswordSchema),
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
				setFormError(tAuth.errorGeneral)
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
					{tAuth.title}
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
						<p className='text-sm text-[#98A0B3]'>{tAuth.validating}</p>
					</div>
				)}

				{/* Invalid / expired link */}
				{!validating && linkInvalid && (
					<>
						<p className='mt-6 text-sm text-[#98A0B3] text-center leading-relaxed'>
							{tAuth.linkInvalid}
						</p>
						<Link
							href='/forgotPassword'
							className='mt-6 w-full block text-center bg-[#6A56E4] text-white p-3 rounded-3xl hover:shadow-xl'
						>
							{tAuth.requestNewLink}
						</Link>
						<Link
							href='/login'
							className='mt-4 block text-center text-sm text-[#D2D2FF] hover:underline'
						>
							{tAuth.backToLogin}
						</Link>
					</>
				)}

				{/* Success */}
				{!validating && !linkInvalid && done && (
					<>
						<p className='mt-6 text-sm text-green-400 text-center leading-relaxed'>
							{tAuth.success}
						</p>
						<Link
							href='/login'
							className='mt-6 w-full block text-center bg-[#6A56E4] text-white p-3 rounded-3xl hover:shadow-xl'
						>
							{tAuth.signIn}
						</Link>
					</>
				)}

				{/* Valid link — show the form */}
				{!validating && !linkInvalid && !done && (
					<>
						<p className='mt-4 text-sm text-gray-400 text-center'>
							{tAuth.description}
						</p>

						<form onSubmit={handleSubmit(onSubmit)}>
							<Controller
								control={control}
								name='password'
								render={({ field, fieldState }) => (
									<PasswordInput
										field={field}
										error={fieldState.error?.message}
										placeholder={tAuth.newPasswordPlaceholder}
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
										placeholder={tAuth.confirmPasswordPlaceholder}
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
								{tAuth.submit}
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
							{tAuth.backToLogin}
						</Link>
					</>
				)}
			</motion.div>
		</div>
	)
}
