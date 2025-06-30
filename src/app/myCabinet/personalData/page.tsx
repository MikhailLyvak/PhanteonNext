'use client'

import React from 'react'
import MyCabinetBreadCrump from '../studyPlatform/components/BreadCrump'
import { Controller, useForm } from "react-hook-form";
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Sidebar from '../components/Sidebar'
import useGetMyProfileData from '@/hooks/Auth/useGetMyProfileData'
import usePutMyProfileData from '@/hooks/Auth/usePutMyProfileData'
import { Triangle } from 'react-loader-spinner'
import { ProfileUpdateData, ProfileUpdateSchema } from '@/api/Auth/types';
import { zodResolver } from '@hookform/resolvers/zod';

const PersonalDataPage = () => {
	const { data, isLoading, refetch } = useGetMyProfileData();
	const { mutate: updateMyProfileData, isPending } = usePutMyProfileData();

	const { control, handleSubmit } = useForm<ProfileUpdateData>({
		resolver: zodResolver(ProfileUpdateSchema),
		defaultValues: {
			first_name: data?.first_name ?? '',
			last_name: data?.last_name ?? '',
			phone: data?.phone ?? '',
		},
		values: data
			? {
				first_name: data.first_name ?? '',
				last_name: data.last_name ?? '',
				phone: data.phone ?? '',
			}
			: undefined,
	});

	const onSubmit = (data: ProfileUpdateData) => {
		updateMyProfileData(data, {
			onSuccess: () => {
				refetch();
			}
		});
	}

	return (
		<ProtectedRoute>
			<div className="w-full">
				<div className="max-w-8xl mx-auto px-4 md:px-6">
					{/* ✅ First Row: Breadcrumbs */}
					<div className="mt-6">
						<MyCabinetBreadCrump currentPageTitle="Персональні дані" />
					</div>

					{/* ✅ Second Row: Page Title */}
					<div className="mt-6">
						<h6 className="text-[#D2D2FF] text-xl md:text-4xl font-bold">
							Особистий кабінет
						</h6>
					</div>

					{/* ✅ Third Row: Sidebar + Courses */}
					<div className="flex w-full mt-8">
						{/* Sidebar - Fixed Width */}
						<div className="hidden xl:block w-[312px] shrink-0 sticky top-[140px]">
							<div className="h-fit">
								<Sidebar />
							</div>
						</div>
						{isPending || isLoading ? (
							<Triangle
								visible={true}
								height={16}
								width={16}
								color="#fff"
								ariaLabel="triangle-loading"
							/>
						) : (
							<div className="flex flex-col w-full sm:ml-10">
								<h6 className="text-[#D2D2FF] text-xl md:text-3xl font-bold">
									Персональні дані
								</h6>
								<div className='mt-[30px] p-6 bg-[#242433] rounded-2xl'>
									<h6 className='text-[#D2D2FF] text-xl font-semibold'>
										Контактна інформація
									</h6>
									<form method='put'>
										<Controller
											control={control}
											name='first_name'
											render={({ field, fieldState }) => (
												<>
													<input
														{...field}
														value={field.value ?? ''}
														type='text'
														placeholder='Імя'
														className='w-full mt-4 p-3 border rounded-lg text-gray-800 focus:ring focus:ring-[#6A56E4] focus:outline-none'
													/>
													{fieldState.error && (
														<p className="text-red-500 text-sm">{fieldState.error.message}</p>
													)}
												</>
											)}
										/>

										<Controller
											control={control}
											name='last_name'
											render={({ field, fieldState }) => (
												<>
													<input
														{...field}
														value={field.value ?? ''}
														type='text'
														placeholder='Прізвище'
														className='w-full mt-4 p-3 border rounded-lg text-gray-800 focus:ring focus:ring-[#6A56E4] focus:outline-none'
													/>
													{fieldState.error && (
														<p className="text-red-500 text-sm">{fieldState.error.message}</p>
													)}
												</>
											)}
										/>

										<Controller
											control={control}
											name='phone'
											render={({ field, fieldState }) => (
												<>
													<input
														{...field}
														value={field.value ?? ''}
														type='text'
														inputMode='tel'
														placeholder='Телефон'
														className='w-full mt-4 p-3 border rounded-lg text-gray-800 focus:ring focus:ring-[#6A56E4] focus:outline-none'
													/>
													{fieldState.error && (
														<p className="text-red-500 text-sm">{fieldState.error.message}</p>
													)}
												</>
											)}
										/>

										<button
											type="submit"
											disabled={isPending}
											className="w-full mt-4 bg-[#6A56E4] text-white p-3 rounded-3xl hover:shadow-xl flex items-center justify-center gap-2"
											onClick={handleSubmit(onSubmit)}
										>
											{isPending && (
												<Triangle
													visible={true}
													height={16}
													width={16}
													color="#fff"
													ariaLabel="triangle-loading"
												/>
											)}
											Зберегти
										</button>
									</form>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</ProtectedRoute>
	)
}

export default PersonalDataPage
