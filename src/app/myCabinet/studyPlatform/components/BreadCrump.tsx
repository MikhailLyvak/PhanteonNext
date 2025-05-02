'use client'

import React from 'react'
import Link from 'next/link'

interface Props {
  currentPageTitle: string;
  textColor?: string;
}

const MyCabinetBreadCrump: React.FC<Props> = ({ currentPageTitle, textColor = "text-[#D2D2FF]" }) => {
  return (
    <div className="my-8">
      <nav className="flex items-center" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
          <li>
            <Link href="/" className={`text-xs sm:text-sm font-normal hover:font-semibold ${textColor}`}>
              Головна
            </Link>
          </li>
          <li className={`text-lg font-extrabold pl-1 ${textColor}`}>•</li>
          <li aria-current="page">
            <Link href="/myCabinet/studyPlatform/" className={`text-xs sm:text-sm font-semibold md:ms-2 ${textColor}`}>
              {currentPageTitle}
            </Link>
          </li>
        </ol>
      </nav>
    </div>
  )
}

export default MyCabinetBreadCrump
