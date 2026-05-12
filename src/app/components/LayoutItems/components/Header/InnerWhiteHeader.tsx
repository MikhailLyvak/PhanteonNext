"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import AdaptiveButtons from "./AdaptiveButtons";
import CryptoTicker from "./CryptoTicker"; // ✅ Import it
import { useUserStore } from "@/store/UserData/useUserStore";
import { useAuthModalStore } from "@/store/AuthModal/useAuthModalStore";

import { useGetUserSubscriptions } from "@/hooks/Subscriptions/useGetUserSubscriptions";

const InnerWhiteHeader = () => {
  const user = useUserStore((state) => state.user);
  const { toggleModal } = useAuthModalStore();
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // const {
  // 	data: subscriptionsData,
  // 	isLoading,
  // 	error,
  // } = useGetUserSubscriptions()

  const refferalRegisterLink = user
    ? `${window.location.origin}/login?register=1&referal_id=${btoa(user.email)}`
    : "";

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
          <div className="">
            <Link href={"/"}>
              <div className="hidden md:block relative">
                <Image
                  src="/Header/LogoColored.svg"
                  alt="Pantheon Logo"
                  fill={true}
                  priority={true}
                  className="object-contain w-[130px] h-[48px] xl:w-[184px] md:h-[58px] !relative"
                />
              </div>
              <div className="md:hidden relative">
                <Image
                  src="/Header/LogoColoredSmall.svg"
                  alt="Pantheon Logo"
                  fill={true}
                  priority={true}
                  className="object-contain w-auto !relative"
                />
              </div>
            </Link>
          </div>

          {/* ✅ Center - Navigation */}
          <div className="2xl:gap-10 gap-5 hidden lg:flex">
            {/* <Link
							href='/About'
							className='font-bold text-sm text-[#D2D2FFAB] xl:text-base'
						>
							Про нас
						</Link> */}

            {/* {!subscriptionsData?.has_active_subscription && (
							<Link
								href='/paywall'
								className='font-bold text-sm text-[#D2D2FFAB] xl:text-base'
							>
								Підписки
							</Link>
						)} */}
            {/* {user && (
							<button
								type='button'
								onClick={handleCopy}
								className='font-bold text-sm text-[#D2D2FFAB] xl:text-base'
								style={{
									background: 'none',
									border: 'none',
									cursor: 'pointer',
								}}
							>
								{copied ? 'Скопійовано!' : 'Реферали'}
							</button>
						)} */}
            {/* <div className='relative'>
							<button
								type='button'
								onClick={() => setIsOpen(prev => !prev)}
								className='font-bold text-sm text-[#D2D2FFAB] xl:text-base flex items-center gap-1'
							>
								AI
							</button>
							{isOpen && (
								<div className='absolute top-full left-0 mt-2 w-40 bg-[#242433] rounded-md shadow-lg z-50 drop-shadow-md'>
									{user ? (
										<>
											<Link
												href='/AI-Agent'
												className='block px-4 py-2 text-sm text-[#D2D2FFAB] hover:bg-[#222]'
												onClick={() => setIsOpen(false)}
											>
												АІ-агенти
											</Link>

											<Link
												href='https://pantheonx.club/interview'
												className='block px-4 py-2 text-sm text-[#D2D2FFAB] hover:bg-[#222]'
												onClick={() => setIsOpen(false)}
											>
												АІ Інтерв'ю
											</Link>
										</>
									) : (
										<>
											<button
												type='button'
												onClick={() => {
													handleAcademyClick()
													setIsOpen(false)
												}}
												className='w-full text-left px-4 py-2 text-sm text-[#D2D2FFAB] hover:bg-[#222]'
											>
												АІ-агенти
											</button>

											<button
												type='button'
												onClick={() => {
													handleAcademyClick()
													setIsOpen(false)
												}}
												className='w-full text-left px-4 py-2 text-sm text-[#D2D2FFAB] hover:bg-[#222]'
											>
												АІ Інтерв'ю
											</button>
										</>
									)}
								</div>
							)}
						</div> */}
            {/* {user ? (
							<Link
								href='/AI-Agent'
								className='font-bold text-sm text-[#D2D2FFAB] xl:text-base'
							>
								АІ-агенти
							</Link>
						) : (
							<button
								type='button'
								onClick={handleAcademyClick}
								className='font-bold text-sm text-[#D2D2FFAB] xl:text-base'
							>
								АІ-агенти
							</button>
						)}
						{user ? (
							<Link
								href='https://pantheonx.club/interview'
								className='font-bold text-sm text-[#D2D2FFAB] xl:text-base'
							>
								АІ Інтерв'ю
							</Link>
						) : (
							<button
								type='button'
								onClick={handleAcademyClick}
								className='font-bold text-sm text-[#D2D2FFAB] xl:text-base'
							>
								АІ Інтерв'ю
							</button>
						)} */}
            {user ? (
              <Link
                href="https://screener.pantheonx.club/"
                className="font-bold text-sm text-[#D2D2FFAB] xl:text-base"
              >
                Скрінер
              </Link>
            ) : (
              <button
                onClick={handleAcademyClick}
                className="font-bold text-sm text-[#D2D2FFAB] xl:text-base"
              >
                Скрінер
              </button>
            )}
            {user ? (
              <Link
                href="/Trading-Chat"
                className="font-bold text-sm text-[#D2D2FFAB] xl:text-base"
              >
                Трейдинг-чат
              </Link>
            ) : (
              <button
                onClick={handleAcademyClick}
                className="font-bold text-sm text-[#D2D2FFAB] xl:text-base"
              >
                Трейдинг-чат
              </button>
            )}
            <Link
              href="/Blog"
              className="font-bold text-sm text-[#D2D2FFAB] xl:text-base"
            >
              Блог
            </Link>
            {user ? (
              <Link
                href="http://pantheonx.club/interview"
                className="font-bold text-sm text-[#D2D2FFAB] xl:text-base"
              >
                Підтримка
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleAcademyClick}
                className="font-bold text-sm text-[#D2D2FFAB] xl:text-base"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Підтримка
              </button>
            )}
            {user ? (
              <Link
                href=""
                className="font-bold text-sm text-[#D2D2FFAB] xl:text-base"
              >
                Академія
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleAcademyClick}
                className="font-bold text-sm text-[#D2D2FFAB] xl:text-base"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Академія
              </button>
            )}
            {/* <Link
							href='/vebinars'
							className='font-bold text-sm text-[#D2D2FFAB] xl:text-base'
						>
							Вебінари
						</Link> */}
          </div>

          {/* ✅ Right - Buttons */}
          <AdaptiveButtons textColor="text-[#D2D2FF]" />
        </div>
      </div>

      <div className="pt-[73px] md:pt-[120px]">
        <CryptoTicker />
      </div>
    </>
  );
};

export default InnerWhiteHeader;
