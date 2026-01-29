'use client'

import React, { useState } from 'react';
import Image from 'next/image'
import Link from 'next/link'
import { useUserStore } from '@/store/UserData/useUserStore'
import { useAuthModalStore } from '@/store/AuthModal/useAuthModalStore'

import { LuInstagram } from 'react-icons/lu'
import { PiTelegramLogo, PiYoutubeLogo } from 'react-icons/pi'
import { useGetLastVebinar } from '@/hooks/Vebinars/useGetLastVebinar'
import { useGetUserSubscriptions } from '@/hooks/Subscriptions/useGetUserSubscriptions'

const Footer = () => {
	// const { data: lastVebinar, isLoading } = useGetLastVebinar()
	const user = useUserStore(state => state.user)
	const [isTubeOpen, setIsTubeOpen] = useState(false);
  const [isInstOpen, setIsInstOpen] = useState(false);
  const [isTelegramOpen, setIsTelegramOpen] = useState(false);
	const { toggleModal } = useAuthModalStore()
	//const { data: subscriptionsData } = useGetUserSubscriptions()

	const handleAcademyClick = (e: React.MouseEvent) => {
		if (!user) {
			e.preventDefault()
			toggleModal() // Open login modal if not authenticated
		}
	}

	return (
    <footer className="bg-[#171723]">
      {/* Main footer content */}
      <div className="border-t border-[#242433]">
        <div className="max-w-8xl mx-auto px-4 md:py-6">
          <div className="flex max-md:flex-col justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="flex items-center relative">
                <Image
                  src="/Header/LogoColored.svg"
                  alt="Pantheon"
                  fill={true}
                  className="object-contain !relative"
                  priority
                />
              </Link>
            </div>

            <div className="flex max-md:flex-col max-md:my-10 items-center gap-3 md:gap-8">
              {/* <Link
								href='/About'
								className='text-[#D2D2FF] hover:text-white transition-colors'
							>
								Про нас
							</Link> */}

              {/* <Link
								href='/AI-Agent'
								className='text-[#D2D2FF] hover:text-white transition-colors'
							>
								АІ-агенти
							</Link> */}
              {/* <Link
								href='/vebinars'
								className='text-[#D2D2FF] hover:text-white transition-colors'
							>
								Вебінари
							</Link> */}
              {/* {!subscriptionsData?.has_active_subscription && (
								<Link
									href='/paywall'
									className='text-[#D2D2FF] hover:text-white transition-colors'
								>
									Підписки
								</Link>
							)} */}
              {user ? (
                <Link
                  href="https://screener.pantheonx.club/"
                  className="text-[#D2D2FF] hover:text-white transition-colors"
                >
                  Скрінер
                </Link>
              ) : (
                <button
                  onClick={handleAcademyClick}
                  className="text-[#D2D2FF] hover:text-white transition-colors bg-transparent border-none cursor-pointer"
                >
                  Скрінер
                </button>
              )}
              {user ? (
                <Link
                href="/Trading-Chat"
                className="text-[#D2D2FF] hover:text-white transition-colors"
              >
                Трейдинг-чат
              </Link>
              ) : (
                <button
                onClick={handleAcademyClick}
                className="text-[#D2D2FF] hover:text-white transition-colors bg-transparent border-none cursor-pointer"
              >
                Трейдинг-чат
              </button>
              )}
              <Link
                href="/Blog"
                className="text-[#D2D2FF] hover:text-white transition-colors"
              >
                Блог
              </Link>
              {user ? (
                <Link
                  href="http://pantheonx.club/interview"
                  className="text-[#D2D2FF] hover:text-white transition-colors"
                >
                  Навчання
                </Link>
              ) : (
                <button
                  onClick={handleAcademyClick}
                  className="text-[#D2D2FF] hover:text-white transition-colors bg-transparent border-none cursor-pointer"
                >
                  Навчання
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => {
                    setIsInstOpen(false);
                    setIsTelegramOpen(false);
                    setIsTubeOpen(!isTubeOpen);
                  }}
                >
                  <PiYoutubeLogo
                    size={38}
                    className="text-[#D2D2FF] hover:text-white transition-colors"
                  />
                </button>
                {isTubeOpen && (
                  <div className="absolute top-[-90] left-0 mt-2 w-40 bg-[#242433] rounded-md shadow-lg z-50 drop-shadow-md">
                    <Link
                      href="https://www.youtube.com/@igorporokh"
                      className="block px-4 py-2 text-sm text-[#D2D2FFAB] hover:bg-[#222]"
                      onClick={() => setIsTubeOpen(false)}
                    >
                      Igor Porokh
                    </Link>

                    <Link
                      href="https://www.youtube.com/@edward_t3"
                      className="block px-4 py-2 text-sm text-[#D2D2FFAB] hover:bg-[#222]"
                      onClick={() => setIsTubeOpen(false)}
                    >
                      Edward Tiasko
                    </Link>
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => {
                    setIsInstOpen(!isInstOpen);
                    setIsTelegramOpen(false);
                    setIsTubeOpen(false);
                  }}
                >
                  <LuInstagram
                    size={32}
                    className="text-[#D2D2FF] hover:text-white transition-colors"
                  />
                </button>
                {isInstOpen && (
                  <div className="absolute top-[-130] left-0 mt-2 w-40 bg-[#242433] rounded-md shadow-lg z-50 drop-shadow-md">
                    <Link
                      href="https://www.instagram.com/pantheonx_official/"
                      className="block px-4 py-2 text-sm text-[#D2D2FFAB] hover:bg-[#222]"
                      onClick={() => setIsInstOpen(false)}
                    >
                      Theon
                    </Link>

                    <Link
                      href="https://www.instagram.com/igor_porokh/"
                      className="block px-4 py-2 text-sm text-[#D2D2FFAB] hover:bg-[#222]"
                      onClick={() => setIsInstOpen(false)}
                    >
                      Igor Porokh
                    </Link>
                    <Link
                      href="https://www.instagram.com/edward_t3"
                      className="block px-4 py-2 text-sm text-[#D2D2FFAB] hover:bg-[#222]"
                      onClick={() => setIsInstOpen(false)}
                    >
                      Edward Tiasko
                    </Link>
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => {
                    setIsInstOpen(false);
                    setIsTelegramOpen(!isTelegramOpen);
                    setIsTubeOpen(false);
                  }}
                >
                  <PiTelegramLogo
                    size={32}
                    className="text-[#D2D2FF] hover:text-white transition-colors"
                  />
                </button>
                {isTelegramOpen && (
                  <div className="absolute top-[-130] left-0 mt-2 w-36 bg-[#242433] rounded-md shadow-lg z-50 drop-shadow-md">
                    <Link
                      href="https://t.me/pantheonxclub"
                      className="block px-4 py-2 text-sm text-[#D2D2FFAB] hover:bg-[#222]"
                      onClick={() => setIsTelegramOpen(false)}
                    >
                      PantheonX
                    </Link>

                    <Link
                      href="https://t.me/zametkiporokha"
                      className="block px-4 py-2 text-sm text-[#D2D2FFAB] hover:bg-[#222]"
                      onClick={() => setIsTelegramOpen(false)}
                    >
                      Invest Porokh
                    </Link>
                    <Link
                      href="https://t.me/PNTHNX"
                      className="block px-4 py-2 text-sm text-[#D2D2FFAB] hover:bg-[#222]"
                      onClick={() => setIsTelegramOpen(false)}
                    >
                      PantheonX
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright section with darker background */}
      <div className="bg-[#13131B]">
        <div className="max-w-8xl mx-auto px-4 py-4">
          <div className="flex max-md:flex-col justify-between items-center text-sm text-[#58587B]">
            <div>Copyright © 2026 PantheonX. Всі права захищено.</div>
            <div>
              <Link
                href="/privacy"
                className="hover:text-[#D2D2FF] transition-colors"
              >
                Політика конфіденційності
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer
// function useState(arg0: boolean): [any, any] {
// 	throw new Error('Function not implemented.')
// }

