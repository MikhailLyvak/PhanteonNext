'use client'

import useGetCourse from "@/hooks/StudyPlatform/useGetCourseDetail";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { LuPlus, LuCheck } from "react-icons/lu";
import ModuleAccordion from "./ModuleAccordion";
import { ModuleDetail } from "@/api/StudyPlatform/types";
import { usePostPaymentPage } from "@/hooks/StudyPlatform/usePostPaymentPage";
import Modal from 'react-modal';
import { Triangle } from 'react-loader-spinner';
import axiosInterceptor from "@/interceptor/axiosClient";

const CourseDetail = () => {
  const params = useParams();
  const idParam = params?.id;

  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  const { data, isLoading, error, refetch } = useGetCourse(id || '');
  const { data: paymentData, isPending, mutate } = usePostPaymentPage()

  const [openId, setOpenId] = useState<number | null>(1);
  const [promocode, setPromocode] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [promoStep, setPromoStep] = useState<'ask' | 'input' | 'checked'>('ask');
  const [promoCheckLoading, setPromoCheckLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoResult, setPromoResult] = useState<any>(null);
  const [finalPrice, setFinalPrice] = useState<number | null>(null);

  const handleToggle = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  const hundleUserBuyCourse = () => {
    if (!id) {
      console.error("Course not found");
      return;
    }

    mutate(
      { courseId: +id, promocode: promocode || undefined },
      {
        onSuccess: (data) => {
          if (data.payment_url) {
            window.location.href = data.payment_url;
          } else {
            console.error("No payment URL in response");
          }
        },
        onError: (error) => {
          console.error("Payment request failed:", error);
        },
      }
    );
  };

  const openBuyModal = () => {
    setIsModalOpen(true);
    setPromoStep('ask');
    setPromoError(null);
    setPromoResult(null);
    setFinalPrice(null);
  };

  const closeBuyModal = () => {
    setIsModalOpen(false);
    setPromoStep('ask');
    setPromoError(null);
    setPromoResult(null);
    setFinalPrice(null);
    setPromocode("");
  };

  const handlePromoCheck = async () => {
    setPromoCheckLoading(true);
    setPromoError(null);
    try {
      const res = await axiosInterceptor.post('/api/check_promocode/', { promocode });
      if (res.data.valid) {
        setPromoResult(res.data);
        const discount = Number(res.data.discount_percent) || 0;
        const price = Number(data?.sell_price) || 0;
        setFinalPrice(price - (price * discount / 100));
        setPromoStep('checked');
      } else {
        setPromoError('Промокод недійсний');
      }
    } catch (e) {
      setPromoError('Помилка перевірки промокоду');
    } finally {
      setPromoCheckLoading(false);
    }
  };

  const proceedToPayment = () => {
    closeBuyModal();
    hundleUserBuyCourse();
  };

  const proceedToPaymentWithPromo = () => {
    if (!id) {
      console.error("Course not found");
      closeBuyModal();
      return;
    }
    closeBuyModal();
    mutate(
      { courseId: +id, promocode: promocode || undefined },
      {
        onSuccess: (data) => {
          if (data.payment_url) {
            window.location.href = data.payment_url;
          } else {
            console.error("No payment URL in response");
          }
        },
        onError: (error) => {
          console.error("Payment request failed:", error);
        },
      }
    );
  };

  return (
    <>
      <div className="min-h-screen bg-[#171723] pt-2">
        <div className="max-w-7xl mx-auto px-4">
          {/* ✅ First Row: Breadcrumbs */}
          <div className="my-8">
            <nav className="flex items-center" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                <li>
                  <a href="/" className="text-xs sm:text-sm font-normal hover:font-semibold text-[#D2D2FF]">
                    Головна
                  </a>
                </li>
                <li className="text-lg font-extrabold pl-1 text-[#D2D2FF]">•</li>
                <li>
                  <a href="/myCabinet/studyPlatform/" className="text-xs sm:text-sm font-normal hover:font-semibold text-[#D2D2FF]">
                    Академія
                  </a>
                </li>
                <li className="text-lg font-extrabold pl-1 text-[#D2D2FF]">•</li>
                <li>
                  <span className="text-xs sm:text-sm font-semibold md:ms-2 text-[#D2D2FF]">
                    Курс
                  </span>
                </li>
              </ol>
            </nav>
          </div>

          {/* ✅ Course Content */}
          <div className="flex flex-col lg:flex-row justify-between gap-8 mb-16">
            {/* Left Column */}
            <div className="lg:w-1/2">
              <h1 className="text-3xl lg:text-5xl font-extrabold text-[#D2D2FF] mb-12">
                {data?.name}
              </h1>

              <div className="mb-8">
                <h2 className="text-2xl text-white font-normal mb-2">Мета:</h2>
                <p className="text-xl font-bold lg:text-xl text-white">
                  {data?.course_goal}
                </p>
              </div>

              <p className="text-white mb-12">
                {data?.description}
              </p>
            </div>

            {/* Right Column - Image */}
            <div className="lg:w-1/2 flex justify-end">
              <div className="rounded-3xl overflow-hidden w-[536px] h-[351px]">
                {data?.image ? (
                  <img
                    src={data.image}
                    alt={data.name}
                    className="w-full h-full object-cover"
                    width={536}
                    height={351}
                  />
                ) : (
                  <div className="w-full h-full bg-[#242433]"></div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="w-full">
              <>
                <div className="mx-2 md:mx-0">
                  <div className="flex flex-col items-end max-md:justify-between gap-2 mb-2">
                    {data?.mine ? (
                      <>
                        <div className="flex items-center gap-2 mt-6 md:mt-11 justify-between w-full">
                          <div className="flex items-center gap-2 ">
                            <div className=" text-gray-200 text-base md:text-lg">Ваш прогрес навчання: </div>
                            <div className="text-base text-gray-200 md:text-xl font-bold">{data?.course_progress}%</div>
                          </div>
                          <div className="text-gray-200 text-base md:text-lg flex items-center gap-2">
                            <LuCheck size={20} />
                            <div>Придбано</div>
                          </div>
                        </div>
                        <div className="relative w-full h-[14px] rounded-full bg-gray-700 overflow-hidden md:mx-0 mt-7">
                          <div
                            className="absolute top-0 left-0 h-full bg-[#D2D2FF] rounded-full transition-all"
                            style={{ width: `${data?.course_progress}%` }}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <div className="flex items-center gap-2">
                            {data?.discount ? (
                              <span className="text-white text-4xl line-through">{data?.price} $</span>
                            ) : null}
                            <span className="text-white text-4xl font-semibold">{finalPrice !== null ? finalPrice : data?.sell_price} $</span>
                          </div>
                          <p className="text-white text-lg font-medium">Вартість кусу</p>
                        </div>
                        <button
                          onClick={openBuyModal}
                          className="flex items-center gap-2 px-6 py-3 bg-[#6A56E4] rounded-full text-white font-semibold text-base hover:bg-[#5846c7] transition-colors"
                        >
                          <span>Придбати</span>
                          <LuPlus className="w-5 h-5" />
                        </button>
                        <Modal
                          isOpen={isModalOpen}
                          onRequestClose={closeBuyModal}
                          className="bg-[#242433] p-8 rounded-xl max-w-md mx-auto mt-32 text-white"
                          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
                          ariaHideApp={false}
                        >
                          {promoStep === 'ask' && (
                            <div className="flex flex-col gap-4">
                              <div className="text-lg font-semibold">Використати промокод?</div>
                              <div className="flex gap-4 mt-2">
                                <button
                                  className="bg-[#6A56E4] px-4 py-2 rounded text-white font-bold"
                                  onClick={() => setPromoStep('input')}
                                >
                                  Так
                                </button>
                                <button
                                  className="bg-gray-500 px-4 py-2 rounded text-white font-bold"
                                  onClick={proceedToPayment}
                                >
                                  Ні
                                </button>
                              </div>
                            </div>
                          )}
                          {promoStep === 'input' && (
                            <div className="flex flex-col">
                              <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={closeBuyModal}
                                    className="text-gray-400 hover:text-gray-700 text-2xl font-bold leading-none px-2"
                                    aria-label="Закрити"
                                  >
                                    ×
                                </button>
                              </div>
                              {/* Title and close button in a row, with space between */}
                              <div className="flex flex-col gap-2 mb-4">
                                <div className="text-lg text-center font-semibold">Введіть промокод</div>
                                  <input
                                    type="text"
                                    value={promocode}
                                    onChange={e => setPromocode(e.target.value)}
                                    placeholder="Промокод"
                                    className="px-4 py-2 rounded border border-gray-400 text-black"
                                  />
                                  <button
                                    className="bg-[#6A56E4] px-4 py-2 rounded text-white font-bold"
                                    onClick={handlePromoCheck}
                                    disabled={promoCheckLoading}
                                  >
                                    {promoCheckLoading ? 'Перевірка...' : 'Перевірити промокод'}
                                  </button>
                                  {promoError && <div className="text-red-400">{promoError}</div>}
                                </div>
                              </div>
                          )}
                          {promoStep === 'checked' && promoResult && (
                            <div className="flex flex-col gap-4">
                              <div className="text-lg font-semibold text-green-400">Промокод дійсний! Знижка: {promoResult.discount_percent}%</div>
                              <div>Нова ціна: <span className="font-bold">{finalPrice} $</span></div>
                              <button
                                className="bg-[#6A56E4] px-4 py-2 rounded text-white font-bold flex items-center justify-center gap-2"
                                onClick={proceedToPaymentWithPromo}
                                disabled={isPending}
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
                                Перейти до оплати
                              </button>
                            </div>
                          )}
                        </Modal>
                      </div>
                    )}
                  </div>
                </div>
                {/* ✅ Modules Section */}
                <div className="mt-16">
                  <div className="text-[#D2D2FF] text-xl lg:text-4xl font-semibold text-start lg:text-center">
                    Модулі курсу
                  </div>
                  <div className="mt-5 lg:mt-12 mb-[103px]">
                    {data?.modules?.map((module: ModuleDetail, index) => (
                      <ModuleAccordion
                        key={module.id}
                        index={index}
                        data={module}
                        handleToggle={handleToggle}
                        isOpen={openId === module.id}
                        courseId={id || ''}
                        hundleUserBuyCourse={hundleUserBuyCourse}
                        is_course_mine={data?.mine}
                        openBuyModal={openBuyModal}
                      />
                    ))}
                  </div>
                </div>
              </>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseDetail;