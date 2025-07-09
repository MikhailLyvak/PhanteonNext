'use client';

import React from "react";
import Image from "next/image";
import Link from "next/link";

import { LuInstagram } from "react-icons/lu";
import { PiTelegramLogo } from "react-icons/pi";
import { useGetLastVebinar } from "@/hooks/Vebinars/useGetLastVebinar";

const Footer = () => {
  const { data: lastVebinar } = useGetLastVebinar();

  return (
    <footer className="bg-[#171723]">
      {/* Main footer content */}
      <div className="border-t border-[#242433]">
        <div className="max-w-8xl mx-auto px-4 md:py-6">
          <div className="flex max-md:flex-col justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="/Header/LogoColored.svg"
                  alt="Pantheon"
                  width={246}
                  height={32}
                  className="object-contain"
                  priority
                />
              </Link>
            </div>

            <div className="flex max-md:flex-col max-md:my-10 items-center gap-3 md:gap-8">
              <Link href="/About" className="text-[#D2D2FF] hover:text-white transition-colors">
                Про нас
              </Link>
              <Link href="/404page" className="text-[#D2D2FF] hover:text-white transition-colors">
                  Блог
                </Link>
              <Link href="/404page" className="text-[#D2D2FF] hover:text-white transition-colors">
                АІ-агенти
              </Link>
              <Link target='_blank' href={lastVebinar?.link || ''} className="text-[#D2D2FF] hover:text-white transition-colors">
                Воркшопи
              </Link>
              <Link href="/myCabinet/studyPlatform" className="text-[#D2D2FF] hover:text-white transition-colors">
                Академія
              </Link>
              <Link href="/dashboard" className="text-[#D2D2FF] hover:text-white transition-colors">
                Графіки
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Link href="https://www.instagram.com/igor_porokh/" target="_blank" rel="noopener noreferrer">
                <LuInstagram size={32} className="text-[#D2D2FF] hover:text-white transition-colors" />
              </Link>
              <Link href="t.me/roadfromatoz" target="_blank" rel="noopener noreferrer">
                <PiTelegramLogo size={32} className="text-[#D2D2FF] hover:text-white transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright section with darker background */}
      <div className="bg-[#13131B]">
        <div className="max-w-8xl mx-auto px-4 py-4">
          <div className="flex max-md:flex-col justify-between items-center text-sm text-[#58587B]">
            <div>Copyright © 2025 PantheonX. Всі права захищено.</div>
            <div>
              <Link href="/privacy" className="hover:text-[#D2D2FF] transition-colors">
                Політика конфіденційності
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
