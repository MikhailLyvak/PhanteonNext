'use client'

import useGetCourse from "@/hooks/StudyPlatform/useGetCourseDetail";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { LuPlus, LuCheck } from "react-icons/lu";
import ModuleAccordion from "./ModuleAccordion";
import { ModuleDetail } from "@/api/StudyPlatform/types";
import { usePostPaymentPage } from "@/hooks/StudyPlatform/usePostPaymentPage";
import InnerWhiteHeader from "@/app/components/LayoutItems/components/Header/InnerWhiteHeader";

const CourseDetail = () => {
  const params = useParams();
  const idParam = params?.id;

  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  const { data, isLoading, error, refetch } = useGetCourse(id || '');
  const { data: paymentData, isPending, mutate } = usePostPaymentPage()

  const [openId, setOpenId] = useState<number | null>(1);
  const handleToggle = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  const hundleUserBuyCourse = () => {
    if (!id) {
      console.error("Course not found");
      return;
    }

    mutate(+id, {
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
    });
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
                      <div className="flex max-lg:flex-col items-center gap-6">
                        <div>
                          <div className="flex items-center gap-2">
                            {data?.discount ? (
                              <span className="text-white text-4xl line-through">{data?.price} $</span>
                            ) : null}
                            <span className="text-white text-4xl font-semibold">{data?.sell_price} $</span>
                          </div>
                          <p className="text-white text-lg font-medium">Вартість кусу</p>
                        </div>
                        <button
                          onClick={hundleUserBuyCourse}
                          className="flex items-center gap-2 px-6 py-3 bg-[#6A56E4] rounded-full text-white font-semibold text-base hover:bg-[#5846c7] transition-colors"
                        >
                          <span>Придбати</span>
                          <LuPlus className="w-5 h-5" />
                        </button>
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
