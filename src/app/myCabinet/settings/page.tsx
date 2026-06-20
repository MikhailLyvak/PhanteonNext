'use client'

import React, { useState } from 'react'
import { Controller, useForm, Control, FieldValues, Path } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Triangle } from 'react-loader-spinner'
import { useRouter } from 'next/navigation'
import { Cookies } from 'react-cookie'
import { useQueryClient } from '@tanstack/react-query'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import Sidebar from '../components/Sidebar'
import MyCabinetBreadCrump from '../studyPlatform/components/BreadCrump'
import useGetMyProfileData from '@/hooks/Auth/useGetMyProfileData'
import useChangePassword from '@/hooks/Auth/useChangePassword'
import useChangeLogin from '@/hooks/Auth/useChangeLogin'
import useDeleteAccount from '@/hooks/Auth/useDeleteAccount'
import { useUserStore } from '@/store/UserData/useUserStore'
import { useAlgonixSessionStore } from '@/store/TradingBots/useAlgonixSessionStore'
import {
	ChangePasswordData,
	ChangePasswordSchema,
	ChangeLoginData,
	ChangeLoginSchema,
	DeleteAccountData,
	DeleteAccountSchema,
} from '@/api/Auth/types'

// Pull a human-readable message out of a Django REST Framework error response,
// matching the patterns the rest of the app handles (details / error / message /
// non_field_errors / field arrays).
const extractError = (error: any, fallback: string): string => {
	const data = error?.response?.data
	if (!data) return fallback
	const pickFirst = (v: unknown): string | null =>
		Array.isArray(v) ? String(v[0]) : typeof v === 'string' ? v : null

	if (data.details) {
		for (const key of Object.keys(data.details)) {
			const msg = pickFirst(data.details[key])
			if (msg) return msg
		}
	}
	return (
		pickFirst(data.error) ??
		pickFirst(data.message) ??
		pickFirst(data.non_field_errors) ??
		fallback
	)
}

const inputClass =
	'w-full mt-4 p-3 pr-12 border rounded-lg text-gray-800 focus:ring focus:ring-[#6A56E4] focus:outline-none'

// Password input with a show/hide toggle, wired through react-hook-form.
function PasswordField<T extends FieldValues>({
	control,
	name,
	placeholder,
}: {
	control: Control<T>
	name: Path<T>
	placeholder: string
}) {
	const [visible, setVisible] = useState(false)
	return (
		<Controller
			control={control}
			name={name}
			render={({ field, fieldState }) => (
				<>
					<div className="relative">
						<input
							{...field}
							value={field.value ?? ''}
							type={visible ? 'text' : 'password'}
							placeholder={placeholder}
							className={inputClass}
						/>
						<button
							type="button"
							onClick={() => setVisible(v => !v)}
							className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
						>
							{visible ? '👁️' : '👁️‍🗨️'}
						</button>
					</div>
					{fieldState.error && (
						<p className="text-red-500 text-sm">{fieldState.error.message}</p>
					)}
				</>
			)}
		/>
	)
}

const Card = ({
	title,
	children,
}: {
	title: string
	children: React.ReactNode
}) => (
	<div className="mt-[30px] p-6 bg-[#242433] rounded-2xl">
		<h6 className="text-[#D2D2FF] text-xl font-semibold">{title}</h6>
		{children}
	</div>
)

const SubmitButton = ({
	pending,
	label,
}: {
	pending: boolean
	label: string
}) => (
	<button
		type="submit"
		disabled={pending}
		className="w-full mt-4 bg-[#6A56E4] text-white p-3 rounded-3xl hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-60"
	>
		{pending && (
			<Triangle
				visible={true}
				height={16}
				width={16}
				color="#fff"
				ariaLabel="triangle-loading"
			/>
		)}
		{label}
	</button>
)

const SettingsPage = () => {
	const router = useRouter()
	const queryClient = useQueryClient()
	const { clearUser } = useUserStore()
	const { data: profile } = useGetMyProfileData()

	// ── Change password ──────────────────────────────────────────────────────
	const { mutate: changePassword, isPending: changingPassword } =
		useChangePassword()
	const [passwordMsg, setPasswordMsg] = useState<{
		type: 'success' | 'error'
		text: string
	} | null>(null)

	const passwordForm = useForm<ChangePasswordData>({
		resolver: zodResolver(ChangePasswordSchema),
		defaultValues: {
			old_password: '',
			new_password: '',
			confirm_new_password: '',
		},
	})

	const onChangePassword = (values: ChangePasswordData) => {
		setPasswordMsg(null)
		changePassword(
			{ old_password: values.old_password, new_password: values.new_password },
			{
				onSuccess: () => {
					setPasswordMsg({ type: 'success', text: 'Пароль успішно змінено' })
					passwordForm.reset()
				},
				onError: (error: any) =>
					setPasswordMsg({
						type: 'error',
						text: extractError(error, 'Не вдалося змінити пароль'),
					}),
			}
		)
	}

	// ── Change login (email) ─────────────────────────────────────────────────
	const { mutate: changeLogin, isPending: changingLogin } = useChangeLogin()
	const [loginMsg, setLoginMsg] = useState<{
		type: 'success' | 'error'
		text: string
	} | null>(null)

	const loginForm = useForm<ChangeLoginData>({
		resolver: zodResolver(ChangeLoginSchema),
		defaultValues: { email: '', password: '' },
		values: profile?.email
			? { email: String(profile.email), password: '' }
			: undefined,
	})

	const onChangeLogin = (values: ChangeLoginData) => {
		setLoginMsg(null)
		changeLogin(values, {
			onSuccess: () => {
				setLoginMsg({ type: 'success', text: 'Email успішно змінено' })
				loginForm.resetField('password')
				queryClient.invalidateQueries({ queryKey: ['my-profile-data'] })
			},
			onError: (error: any) =>
				setLoginMsg({
					type: 'error',
					text: extractError(error, 'Не вдалося змінити email'),
				}),
		})
	}

	// ── Delete account ───────────────────────────────────────────────────────
	const { mutate: removeAccount, isPending: deleting } = useDeleteAccount()
	const [confirmingDelete, setConfirmingDelete] = useState(false)
	const [deleteMsg, setDeleteMsg] = useState<string | null>(null)

	const deleteForm = useForm<DeleteAccountData>({
		resolver: zodResolver(DeleteAccountSchema),
		defaultValues: { password: '' },
	})

	const onDeleteAccount = (values: DeleteAccountData) => {
		setDeleteMsg(null)
		removeAccount(values, {
			onSuccess: () => {
				// Tear down the session, mirroring the sidebar logout, then leave.
				const cookies = new Cookies()
				cookies.remove('local_access_token', { path: '/' })
				clearUser()
				useAlgonixSessionStore.getState().clearSession()
				router.push('/')
			},
			onError: (error: any) =>
				setDeleteMsg(extractError(error, 'Не вдалося видалити акаунт')),
		})
	}

	return (
		<ProtectedRoute>
			<div className="w-full">
				<div className="max-w-8xl mx-auto px-4 md:px-6">
					<div className="mt-6">
						<MyCabinetBreadCrump currentPageTitle="Налаштування" />
					</div>

					<div className="mt-6">
						<h6 className="text-[#D2D2FF] text-xl md:text-4xl font-bold">
							Особистий кабінет
						</h6>
					</div>

					<div className="flex w-full mt-8">
						<div className="hidden xl:block w-[312px] shrink-0 sticky top-[140px]">
							<div className="h-fit">
								<Sidebar />
							</div>
						</div>

						<div className="flex flex-col w-full sm:ml-10">
							<h6 className="text-[#D2D2FF] text-xl md:text-3xl font-bold">
								Налаштування
							</h6>

							{/* Change password */}
							<Card title="Зміна пароля">
								<form onSubmit={passwordForm.handleSubmit(onChangePassword)}>
									<PasswordField
										control={passwordForm.control}
										name="old_password"
										placeholder="Поточний пароль"
									/>
									<PasswordField
										control={passwordForm.control}
										name="new_password"
										placeholder="Новий пароль"
									/>
									<PasswordField
										control={passwordForm.control}
										name="confirm_new_password"
										placeholder="Повторіть новий пароль"
									/>
									<SubmitButton pending={changingPassword} label="Змінити пароль" />
									{passwordMsg && (
										<p
											className={`mt-2 text-center text-sm ${
												passwordMsg.type === 'success'
													? 'text-green-400'
													: 'text-red-500'
											}`}
										>
											{passwordMsg.text}
										</p>
									)}
								</form>
							</Card>

							{/* Change login (email) */}
							<Card title="Зміна логіну (email)">
								<form onSubmit={loginForm.handleSubmit(onChangeLogin)}>
									<Controller
										control={loginForm.control}
										name="email"
										render={({ field, fieldState }) => (
											<>
												<input
													{...field}
													value={field.value ?? ''}
													type="text"
													inputMode="email"
													placeholder="Новий email"
													className="w-full mt-4 p-3 border rounded-lg text-gray-800 focus:ring focus:ring-[#6A56E4] focus:outline-none"
												/>
												{fieldState.error && (
													<p className="text-red-500 text-sm">
														{fieldState.error.message}
													</p>
												)}
											</>
										)}
									/>
									<PasswordField
										control={loginForm.control}
										name="password"
										placeholder="Пароль для підтвердження"
									/>
									<SubmitButton pending={changingLogin} label="Змінити email" />
									{loginMsg && (
										<p
											className={`mt-2 text-center text-sm ${
												loginMsg.type === 'success'
													? 'text-green-400'
													: 'text-red-500'
											}`}
										>
											{loginMsg.text}
										</p>
									)}
								</form>
							</Card>

							{/* Danger zone — delete account */}
							<div className="mt-[30px] p-6 bg-[#242433] rounded-2xl border border-red-500/40">
								<h6 className="text-red-400 text-xl font-semibold">
									Видалення акаунту
								</h6>
								<p className="text-[#98A0B3] text-sm mt-2">
									Це назавжди видалить ваш акаунт та всі пов’язані з ним дані. Дію
									неможливо скасувати.
								</p>

								{!confirmingDelete ? (
									<button
										type="button"
										onClick={() => {
											setDeleteMsg(null)
											setConfirmingDelete(true)
										}}
										className="w-full mt-4 bg-red-600 text-white p-3 rounded-3xl hover:bg-red-700 transition-colors"
									>
										Видалити акаунт
									</button>
								) : (
									<form
										onSubmit={deleteForm.handleSubmit(onDeleteAccount)}
										className="mt-4"
									>
										<PasswordField
											control={deleteForm.control}
											name="password"
											placeholder="Введіть пароль для підтвердження"
										/>
										<div className="flex gap-3 mt-4">
											<button
												type="button"
												onClick={() => {
													setConfirmingDelete(false)
													deleteForm.reset()
													setDeleteMsg(null)
												}}
												className="flex-1 bg-[#2F2F40] text-[#D2D2FF] p-3 rounded-3xl hover:bg-[#3a3a4d] transition-colors"
											>
												Скасувати
											</button>
											<button
												type="submit"
												disabled={deleting}
												className="flex-1 bg-red-600 text-white p-3 rounded-3xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
											>
												{deleting && (
													<Triangle
														visible={true}
														height={16}
														width={16}
														color="#fff"
														ariaLabel="triangle-loading"
													/>
												)}
												Підтвердити видалення
											</button>
										</div>
										{deleteMsg && (
											<p className="mt-2 text-center text-sm text-red-500">
												{deleteMsg}
											</p>
										)}
									</form>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</ProtectedRoute>
	)
}

export default SettingsPage
