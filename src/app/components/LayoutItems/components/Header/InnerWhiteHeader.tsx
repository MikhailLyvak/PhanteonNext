'use client'

import Image from 'next/image'
import Link from 'next/link'
import React, {useState} from 'react'
import AdaptiveButtons from './AdaptiveButtons'
import CryptoTicker from './CryptoTicker' // ✅ Import it
import { useGetLastVebinar } from '@/hooks/Vebinars/useGetLastVebinar'
import { useUserStore } from '@/store/UserData/useUserStore'
import { useAuthModalStore } from '@/store/AuthModal/useAuthModalStore'


const InnerWhiteHeader = () => {
  const { data: lastVebinar, isEnabled } = useGetLastVebinar();
  const user = useUserStore(state => state.user);
  const { toggleModal } = useAuthModalStore();
  const [copied, setCopied] = useState(false);

  const refferalRegisterLink = user ? `${window.location.origin}/login?register=1&referal_id=${btoa(user.email)}` : '';

  const handleCopy = async () => {
    if (!refferalRegisterLink) return;
    await navigator.clipboard.writeText(refferalRegisterLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleAcademyClick = () => {
    if (!user) {
      toggleModal(); // Open login modal if not authenticated
    }
  };

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
            <Link href="/About" className="font-bold text-sm text-[#D2D2FFAB] xl:text-base">Про нас</Link>
            <Link href="/Blog" className="font-bold text-sm text-[#D2D2FFAB] xl:text-base">Блог</Link>
            {user && (
              <button
                type="button"
                onClick={handleCopy}
                className="font-bold text-sm text-[#D2D2FFAB] xl:text-base"
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                {copied ? "Скопійовано!" : "Реферали"}
              </button>
            )}
            <Link href="AI-Agent" className="font-bold text-sm text-[#D2D2FFAB] xl:text-base">АІ-агенти</Link>
            {user ? (
              <Link href="/myCabinet/studyPlatform" className="font-bold text-sm text-[#D2D2FFAB] xl:text-base">Академія</Link>
            ) : (
              <button
                type="button"
                onClick={handleAcademyClick}
                className="font-bold text-sm text-[#D2D2FFAB] xl:text-base"
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                Академія
              </button>
            )}
            {user ? (
              <Link href="/vebinars" className="font-bold text-sm text-[#D2D2FFAB] xl:text-base">Вебінари</Link>
            ) : (
              <button
                type="button"
                onClick={handleAcademyClick}
                className="font-bold text-sm text-[#D2D2FFAB] xl:text-base"
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                Вебінари
              </button>
            )}
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
