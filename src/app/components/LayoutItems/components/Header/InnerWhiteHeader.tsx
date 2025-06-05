'use client'

import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import AdaptiveButtons from './AdaptiveButtons'
import CryptoTicker from './CryptoTicker' // ✅ Import it

const InnerWhiteHeader = () => {
  return (
    <>
      {/* 🔼 Header */}
      <div className="w-full h-[73px] border-b border-gray-500 md:h-[120px] bg-[#171723] z-40 fixed top-0 left-0 p-3 sm:p-[34px]">
        <div className="max-w-8xl mx-auto flex items-center justify-between">
          {/* ✅ Left - Logo */}
          <div>
            <Link href={'/'}>
              <div className="hidden md:block">
                <Image
                  src="/Header/LogoColored.svg"
                  alt="Pantheon Logo"
                  width={184}
                  height={58}
                  className="object-contain w-[130px] h-[48px] xl:w-[184px] md:h-[58px]"
                />
              </div>
              <div className="md:hidden">
                <Image
                  src="/Header/LogoColoredSmall.svg"
                  alt="Pantheon Logo"
                  width={41}
                  height={41}
                  className="object-contain"
                />
              </div>
            </Link>
          </div>

          {/* ✅ Center - Navigation */}
          <div className="2xl:gap-10 gap-5 hidden lg:flex">
            <div className="font-bold text-sm text-[#D2D2FFAB] xl:text-base">Про нас</div>
            <div className="font-bold text-sm text-[#D2D2FFAB] xl:text-base">Блог</div>
            <div className="font-bold text-sm text-[#D2D2FFAB] xl:text-base">Курси</div>
            <Link href="/myCabinet/studyPlatform" className="font-bold text-sm text-[#D2D2FFAB] xl:text-base">Навчальна платформа</Link>
            <Link href="/dashboard" className="font-bold text-sm text-[#D2D2FFAB] xl:text-base">Графіки</Link>
          </div>

          {/* ✅ Right - Buttons */}
          <AdaptiveButtons textColor="text-[#D2D2FF]" />
        </div>
      </div>

      <div className="pt-[73px] md:pt-[120px]">
        <CryptoTicker />
      </div>
    </>
  )
}

export default InnerWhiteHeader
