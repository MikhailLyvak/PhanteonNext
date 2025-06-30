'use client'

import InnerWhiteHeader from '@/app/components/LayoutItems/components/Header/InnerWhiteHeader'
import useGetLessonDetail from '@/hooks/StudyPlatform/useGetLessonDetail';
import { useParams } from 'next/navigation';
import { LuArrowBigDown, LuChevronDown } from "react-icons/lu";
import React, { useState } from 'react'
import NavAccordion from './components/NavAccordion';
import VitalisGreenButton from '@/app/components/Buttons/VitalisGreenButton';
import Link from 'next/link';
import { Divide } from 'lucide-react';

function getYouTubeId(url?: string): string {
  const fallbackVideoId = 'unYKqbwdK3M';
  if (!url) return fallbackVideoId;
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get("v") || fallbackVideoId;
  } catch {
    return fallbackVideoId;
  }
}


const LessonDetail = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const params = useParams();
  const idParam = params?.lessonId;
  const courseId = params?.id

  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  const { data, isLoading, error } = useGetLessonDetail(id || '');
  return (
    <>
      <div className='pt-2 max-w-7xl mx-auto'>
        <div className="flex flex-col max-lg:mx-4">

          {/* ✅ First Row: Breadcrumbs */}
          <div className="mt-8">
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
                  <a href={`/myCabinet/studyPlatform/${courseId}`} className="text-xs sm:text-sm font-normal hover:font-semibold text-[#D2D2FF]">
                    Курс
                  </a>
                </li>
                <li className="text-lg font-extrabold pl-1 text-[#D2D2FF]">•</li>
                <li>
                  <span className="text-xs sm:text-sm font-semibold md:ms-2 text-[#D2D2FF]">
                    Урок
                  </span>
                </li>
              </ol>
            </nav>
          </div>

          <div onClick={() => setIsModalOpen(!isModalOpen)} className={`max-lg:flex hidden justify-between mt-8 bg-[#242433] text-white text-base font-semibold items-center p-[10px] ${isModalOpen ? 'rounded-t-xl' : 'rounded-xl'}`}>
            <div>Теми уроків</div>
            <div className='border-2 rounded-xl h-9 w-9 flex items-center justify-center border-white text-white '>
              <LuChevronDown className={isModalOpen ? ' transition-transform -rotate-90' : ' transition-transform'} />
            </div>
          </div>
          <div className={isModalOpen ? 'flex' : 'hidden'}>
            {data?.nava_data && data.nava_data.length > 0 && (
              <NavAccordion modules={data.nava_data} />
            )}
          </div>
          <div className='hidden lg:flex text-[#D2D2FF] text-4xl font-semibold mt-6'>{data?.name}</div>
          <div className='flex justify-between gap-6'>
            <div className="flex flex-col w-full">
              <div className='mt-7 w-full'>
                {data?.videos.length === 0 ? (
                  <div className='w-full aspect-video self-stretch rounded-3xl h-full shadow-xl bg-[#242433] flex justify-center items-center'>
                    <div className='text-white text-base lg:text-4xl font-semibold'>
                      Контент уроку в розробці
                    </div>
                  </div>
                ) : (
                  (isLoading === false && data?.videos[0] !== null) &&
                  <iframe
                    className="w-full aspect-video self-stretch rounded-3xl h-full shadow-xl"
                    src={`https://www.youtube.com/embed/${getYouTubeId(data?.videos?.[0]?.url)}`}
                    frameBorder="0"
                    title="Product Overview Video"
                    aria-hidden="true"
                  />
                )}
              </div>
              <div
                className="text-white text-base lg:text-2xl font-semibold mt-5 lg:mt-10"
                dangerouslySetInnerHTML={{ __html: data?.description || '' }}
              />
              <div
                className="text-white text-sm lg:text-base font-normal mt-5 lg:mt-6"
                dangerouslySetInnerHTML={{ __html: data?.text_home_task || '' }}
              />
              {data?.videos && data?.videos?.length > 0 && (
                <>
                  <div className='bg-[#242433] rounded-3xl lg:h-28 mt-6 lg:mt-14 text-white flex flex-col lg:flex-row justify-between items-center px-6 max-lg:py-6'>
                    <div className='text-lg lg:text-2xl font-semibold'>Матеріал уроку у форматі .PDF</div>
                    <div className='max-lg:mt-5'>
                      <VitalisGreenButton>
                        <a
                          href={data?.pdf_task}
                          download
                          target='_black'
                          className="flex"
                        >
                          <div className='mr-[10px]'>Завантажити</div>
                          <LuArrowBigDown
                            className="w-6 h-6 text-white"
                            style={{ fill: 'currentColor', stroke: 'none' }}
                          />
                        </a>
                      </VitalisGreenButton>
                    </div>
                  </div>
                  <div className='bg-[#242433] rounded-3xl lg:h-28 mt-6 mb-10 lg:mb-[100px] text-white flex flex-col lg:flex-row justify-between items-center px-5 max-lg:py-5 max-lg:text-center lg:px-6'>
                    <div className='text-lg lg:text-2xl font-semibold lg:w-8/12'>Для завершення уроку виконайте задання з тесту</div>
                    <div className='max-lg:mt-5'>
                      <VitalisGreenButton>
                        <Link href={`/myCabinet/studyPlatform/${courseId}/lesson/${id}/quiz/${data?.quize}`} className=''>Пройти тест</Link>
                      </VitalisGreenButton>
                    </div>
                  </div>
                </>
              )}

              {data?.videos.length === 0 && (
                <div className='w-full my-10'></div>
              )}

            </div>
            <div className="hidden lg:flex mt-7">
              {data?.nava_data && data.nava_data.length > 0 && (
                <NavAccordion modules={data.nava_data} />
              )}
            </div>
          </div>

        </div>

      </div>
    </>
  )
}

export default LessonDetail
