'use client'

import MyCabinetBreadCrump from '../studyPlatform/components/BreadCrump';
import Sidebar from '../components/Sidebar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useGetUserSubscriptions } from '@/hooks/Subscriptions/useGetUserSubscriptions';
import { Triangle } from 'react-loader-spinner';
import { Link } from '@/i18n/navigation';
import { Calendar, CreditCard, Clock, CheckCircle } from 'lucide-react';

const SubscriptionsPage = () => {
	const { data: subscriptionsData, isLoading, error } = useGetUserSubscriptions();

	if (isLoading) {
		return (
			<ProtectedRoute>
				<div className="w-full">
					<div className="max-w-8xl mx-auto px-4 md:px-6">
						<div className="mt-6">
							<MyCabinetBreadCrump currentPageTitle="Керування підписками" />
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
							<div className="flex flex-col w-full sm:ml-10 items-center justify-center h-64">
								<Triangle
									visible={true}
									height={80}
									width={80}
									color="#D2D2FF"
									ariaLabel="triangle-loading"
								/>
							</div>
						</div>
					</div>
				</div>
			</ProtectedRoute>
		);
	}

	if (error) {
		return (
			<ProtectedRoute>
				<div className="w-full">
					<div className="max-w-8xl mx-auto px-4 md:px-6">
						<div className="mt-6">
							<MyCabinetBreadCrump currentPageTitle="Керування підписками" />
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
							<div className="flex flex-col w-full sm:ml-10 items-center justify-center h-64">
								<div className="text-red-500 text-center">
									<p className="text-xl mb-4">Помилка завантаження підписок</p>
									<p className="text-sm">Спробуйте оновити сторінку або зверніться до підтримки</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</ProtectedRoute>
		);
	}

	return (
		<ProtectedRoute>
			<div className="w-full">
				<div className="max-w-8xl mx-auto px-4 md:px-6">
					{/* Breadcrumbs */}
					<div className="mt-6">
						<MyCabinetBreadCrump currentPageTitle="Керування підписками" />
					</div>

					{/* Page Title */}
					<div className="mt-6">
						<h6 className="text-[#D2D2FF] text-xl md:text-4xl font-bold">
							Особистий кабінет
						</h6>
					</div>

					{/* Sidebar + Content */}
					<div className="flex w-full mt-8">
						{/* Sidebar */}
						<div className="hidden xl:block w-[312px] shrink-0 sticky top-[140px]">
							<div className="h-fit">
								<Sidebar />
							</div>
						</div>

						{/* Content */}
						<div className="flex flex-col w-full sm:ml-10">
							{!subscriptionsData?.has_active_subscription ? (
								// No active subscriptions
								<div className="bg-[#242433] rounded-2xl p-8 text-center">
									<CreditCard size={64} className="mx-auto mb-6 text-[#D2D2FF]" />
									<h3 className="text-2xl font-bold text-white mb-4">
										У вас немає активних підписок
									</h3>
									<p className="text-[#58587B] mb-8 max-w-md mx-auto">
										Отримайте доступ до всіх функцій платформи з нашими підписками
									</p>
									<Link
										href="/paywall"
										className="inline-flex items-center px-6 py-3 bg-[#D2D2FF] text-[#171723] font-semibold rounded-lg hover:bg-[#C0C0FF] transition-colors"
									>
										<CreditCard size={20} className="mr-2" />
										Перейти до підписок
									</Link>
								</div>
							) : (
								// Active subscriptions
								<div className="space-y-6">
									<h2 className="text-2xl font-bold text-white mb-6">
										Ваші активні підписки
									</h2>
									
									{subscriptionsData.subscriptions.map((subscription) => (
										<div
											key={subscription.id}
											className="bg-[#242433] rounded-2xl p-6 border border-[#2F2F40]"
										>
											<div className="flex items-start justify-between mb-4">
												<div className="flex items-center">
													<div className="w-12 h-12 bg-[#D2D2FF] rounded-lg flex items-center justify-center mr-4">
														<CreditCard size={24} className="text-[#171723]" />
													</div>
													<div>
														<h3 className="text-xl font-bold text-white">
															{subscription.subscription_name}
														</h3>
														<p className="text-[#58587B]">
															{subscription.subscription_type === 'monthly' ? 'Місячна підписка' : 'Річна підписка'}
														</p>
													</div>
												</div>
												<div className="flex items-center">
													{subscription.is_expired ? (
														<div className="flex items-center text-red-500">
															<Clock size={20} className="mr-2" />
															<span className="font-semibold">Закінчилася</span>
														</div>
													) : (
														<div className="flex items-center text-green-500">
															<CheckCircle size={20} className="mr-2" />
															<span className="font-semibold">Активна</span>
														</div>
													)}
												</div>
											</div>

											<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
												<div className="flex items-center">
													<Calendar size={20} className="text-[#D2D2FF] mr-3" />
													<div>
														<p className="text-sm text-[#58587B]">Дата початку</p>
														<p className="text-white font-semibold">
															{new Date(subscription.start_date).toLocaleDateString('uk-UA')}
														</p>
													</div>
												</div>
												<div className="flex items-center">
													<Clock size={20} className="text-[#D2D2FF] mr-3" />
													<div>
														<p className="text-sm text-[#58587B]">Дата закінчення</p>
														<p className="text-white font-semibold">
															{new Date(subscription.end_date).toLocaleDateString('uk-UA')}
														</p>
													</div>
												</div>
												<div className="flex items-center">
													<CreditCard size={20} className="text-[#D2D2FF] mr-3" />
													<div>
														<p className="text-sm text-[#58587B]">Сума оплати</p>
														<p className="text-white font-semibold">
															${subscription.payment.price}
														</p>
													</div>
												</div>
											</div>

											<div className="flex items-center justify-between pt-4 border-t border-[#2F2F40]">
												<div className="text-sm text-[#58587B]">
													Тривалість: {subscription.payment.duration_months} місяців
												</div>
												<div className="flex items-center gap-4">
													<div className="text-sm text-[#58587B]">
														Статус оплати: 
														<span className={`ml-1 font-semibold ${
															subscription.payment.status === 'SUCCESS' 
																? 'text-green-500' 
																: subscription.payment.status === 'PENDING'
																? 'text-yellow-500'
																: 'text-red-500'
														}`}>
															{subscription.payment.status === 'SUCCESS' ? 'Оплачено' :
															 subscription.payment.status === 'PENDING' ? 'Очікує' : 'Відхилено'}
														</span>
													</div>
													{subscription.can_renew && (
														<Link
															href="/paywall"
															className="px-4 py-2 bg-[#D2D2FF] text-[#171723] font-semibold rounded-lg hover:bg-[#C0C0FF] transition-colors text-sm"
														>
															Поновить підписку
														</Link>
													)}
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</ProtectedRoute>
	);
};

export default SubscriptionsPage;

