'use client'

import React from 'react'
import { useCustomTranslations } from '@/lib/contexts/translations/translations-context'
import { TKeys } from '@/i18n/t-keys'

interface Props {
  courseId: string | undefined;
}

const BreadCrumpForLesson: React.FC<Props> = ({ courseId }) => {
  const { t } = useCustomTranslations(TKeys.cabinet.studyPlatform)
  return (
    <div className="mt-8">
      <nav className="flex items-center" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
          <li>
            <a href="/" className='text-xs sm:text-sm font-normal hover:font-semibold md:ms-2 text-[#037F6A]'>
              {t.breadcrumbHome}
            </a>
          </li>
          <li className='text-lg font-extrabold pl-1 text-[#037F6A]'>•</li>
          <li>
            <a href="/myCabinet/studyPlatform/" className='text-xs sm:text-sm font-normal hover:font-semibold md:ms-2 text-[#037F6A]'>
              {t.breadcrumbAcademyVb}
            </a>
          </li>
          <li className='text-lg font-extrabold pl-1 text-[#037F6A]'>•</li>
          <li>
            <a href={`/myCabinet/studyPlatform/${courseId}`} className='text-xs sm:text-sm font-normal hover:font-semibold md:ms-2 text-[#037F6A]'>
              {t.breadcrumbCourse}
            </a>
          </li>
          <li className='text-lg font-extrabold pl-1 text-[#037F6A]'>•</li>
          <li aria-current="page">
            <span className='text-xs sm:text-sm font-semibold md:ms-2 text-[#037F6A]'>
              {t.breadcrumbLesson}
            </span>
          </li>
        </ol>
      </nav>
    </div>
  )
}

export default BreadCrumpForLesson
