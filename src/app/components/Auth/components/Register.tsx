import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Triangle } from 'react-loader-spinner'

import { useAuthModalStore } from '@/store/AuthModal/useAuthModalStore'
import { useUserStore } from '@/store/UserData/useUserStore'
import { register } from '@/api/Auth/PostRegister'
import { useRouter } from 'next/navigation'

const schema = z
	.object({
		email: z
			.string()
			.min(1, 'Email обовʼязковий')
			.email('Невірний формат email'),
		password: z.string().min(6, 'Мінімум 6 символів'),
		confirm_password: z.string().min(6, 'Мінімум 6 символів'),
		referalId: z.string().optional(),
	})
	.refine(data => data.password === data.confirm_password, {
		message: 'Паролі не співпадають',
		path: ['confirm_password'],
	})

type RegisterFormData = z.infer<typeof schema>

const RegisterModalFormComponent = () => {
	const { setUser } = useUserStore()
	const { referral_id, closeModal } = useAuthModalStore()
	const [isVisible, setIsVisible] = useState(false)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const router = useRouter()

	console.log(referral_id)

	const { mutate: handleRegister, isPending } = useMutation({
		mutationFn: register,
		onSuccess: data => {
			setUser(data.user)
			closeModal() // Close modal on successful registration
			router.push('https://screener.pantheonx.club/')
		},
		onError: (error: any) => {
			console.error('Registration error details:', error)

			let errorMessage = 'Сталася помилка при реєстрації'

			if (error?.response?.data) {
				const responseData = error.response.data

				// Handle validation errors
				if (responseData.details) {
					const details = responseData.details

					// Check for specific field errors
					if (details.email) {
						if (Array.isArray(details.email)) {
							errorMessage = details.email[0] // Take first error message
						} else {
							errorMessage = details.email
						}
					} else if (details.password) {
						if (Array.isArray(details.password)) {
							errorMessage = details.password[0]
						} else {
							errorMessage = details.password
						}
					} else if (details.referalId) {
						if (Array.isArray(details.referalId)) {
							errorMessage = details.referalId[0]
						} else {
							errorMessage = details.referalId
						}
					} else if (details.non_field_errors) {
						if (Array.isArray(details.non_field_errors)) {
							errorMessage = details.non_field_errors[0]
						} else {
							errorMessage = details.non_field_errors
						}
					}
				}
				// Handle general error messages
				else if (responseData.error) {
					errorMessage = responseData.error
				}
				// Handle other error formats
				else if (responseData.message) {
					errorMessage = responseData.message
				}
			}

			// Translate common error messages to Ukrainian
			if (errorMessage.includes('user with this email already exists')) {
				errorMessage = 'Користувач з таким email вже існує'
			} else if (errorMessage.includes('This field may not be blank')) {
				errorMessage = 'Це поле не може бути порожнім'
			} else if (errorMessage.includes('This field is required')) {
				errorMessage = "Це поле обов'язкове"
			} else if (errorMessage.includes('Ensure this field has at least')) {
				errorMessage = 'Це поле має містити мінімум символів'
			}

			setErrorMessage(errorMessage)
		},
	})

	const { control, handleSubmit } = useForm<RegisterFormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			email: '',
			password: '',
			confirm_password: '',
			referalId: referral_id ? referral_id : '',
		},
	})

	const onSubmit = (data: RegisterFormData) => {
		console.log('Form data submitted:', data)
		const registerData: any = {
			email: data.email,
			password: data.password,
		}

		// Only include referalId if it's not empty
		if (data.referalId && data.referalId.trim()) {
			registerData.referalId = data.referalId
		}

		console.log('Data being sent to API:', registerData)
		handleRegister(registerData)
	}

	return (
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
							placeholder='Email'
							className='w-full mt-4 p-3 border rounded-lg text-gray-800 focus:ring focus:ring-[#6A56E4] focus:outline-none'
						/>
						{fieldState.error && (
							<p className='text-red-500 text-sm'>{fieldState.error.message}</p>
						)}
					</>
				)}
			/>

			<Controller
				control={control}
				name='password'
				render={({ field, fieldState }) => (
					<>
						<div className='relative'>
							<input
								{...field}
								type={isVisible ? 'text' : 'password'}
								placeholder='Пароль'
								className='w-full mt-4 p-3 pr-12 border rounded-lg text-gray-800 focus:ring focus:ring-[#6A56E4] focus:outline-none'
							/>
							<button
								type='button'
								onClick={() => setIsVisible(!isVisible)}
								className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
							>
								{isVisible ? '👁️' : '👁️‍🗨️'}
							</button>
						</div>
						{fieldState.error && (
							<p className='text-red-500 text-sm'>{fieldState.error.message}</p>
						)}
					</>
				)}
			/>

			<Controller
				control={control}
				name='confirm_password'
				render={({ field, fieldState }) => (
					<>
						<div className='relative'>
							<input
								{...field}
								type={isVisible ? 'text' : 'password'}
								placeholder='Повторіть пароль'
								className='w-full mt-4 p-3 pr-12 border rounded-lg text-gray-800 focus:ring focus:ring-[#6A56E4] focus:outline-none'
							/>
							<button
								type='button'
								onClick={() => setIsVisible(!isVisible)}
								className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
							>
								{isVisible ? '👁️' : '👁️‍🗨️'}
							</button>
						</div>
						{fieldState.error && (
							<p className='text-red-500 text-sm'>{fieldState.error.message}</p>
						)}
					</>
				)}
			/>

			<button
				type='submit'
				disabled={isPending}
				className='w-full mt-4 bg-[#6A56E4] text-white p-3 rounded-3xl hover:shadow-xl flex items-center justify-center gap-2'
			>
				{isPending && (
					<Triangle
						visible={true}
						height={16}
						width={16}
						color='#fff'
						ariaLabel='triangle-loading'
					/>
				)}
				<span>Реєстрація</span>
			</button>

			{errorMessage && (
				<div className='alert border-0 alert-danger mt-2 text-center text-sm text-red-500'>
					{errorMessage}
				</div>
			)}

			<p className='mt-4 text-xs text-gray-500 text-center'>
				Натискаючи «Реєстрація», ви погоджуєтесь з обробкою персональних даних.
			</p>
			<p className='mt-4 text-xs text-gray-500 text-center'>
				Скрінер - інструмент для системного аналізу ринку та відбору активів за
				заданими параметрами. Доступний після реєстрації!
			</p>
		</form>
	)
}

export default RegisterModalFormComponent
