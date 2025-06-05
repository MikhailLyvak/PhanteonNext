"use client";

import React, { useState, useEffect } from "react";
import {
  X
} from "lucide-react";
import { LuChevronLeft } from "react-icons/lu";
import { useMainDrawerStore } from "@/store/Nav/useMainDrawerStore";
import Image from "next/image";
import LoginButton from "../LoginButton";
import Link from "next/link";

type DrawerMode = "main" | "shop" | "about";

const MainDrawer = () => {
  const { isMainDrawerOpen, closeMainDrawer } = useMainDrawerStore();
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("main");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Overlay */}
      {isMainDrawerOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMainDrawer}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 z-50 h-screen w-[370px] bg-[#171723] shadow-xl transition-transform duration-300 ease-in-out ${isMainDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center gap-24 mt-3 px-3">
            <Link href="/" className="flex" onClick={closeMainDrawer}>
              <Image
                src="/Header/LogoColoredSmall.svg"
                alt="Phanteon Logo"
                width={41}
                height={41}
                className="object-contain"
                priority
              />
            </Link>
            <div className="flex gap-[10px]">
              {drawerMode !== 'main' ? (
                <button
                  onClick={() => setDrawerMode("main")}
                  className="flex items-center justify-center text-gray-800 bg-[#E8E8E8] rounded-xl h-12 w-12"
                >
                  <LuChevronLeft size={40} />
                </button>
              ) : (
                <>
                  <LoginButton isSideBar={true} />
                  <button
                    onClick={closeMainDrawer}
                    className="flex items-center justify-center text-white bg-[#58587B] rounded-xl h-12 w-12"
                  >
                    <X size={40} />
                  </button>
                </>
              )}
            </div>
          </div>

          <nav className="flex flex-col text-[#D2D2FFAB] pl-[74px] items-start justify-center mt-[107px]">
            {drawerMode === "main" && (
              <div className="flex flex-col space-y-6 text-xl font-semibold">
                <Link href="/myCabinet/studyPlatform" onClick={closeMainDrawer}>Навчальна платформа</Link>
                <Link href="/about" onClick={closeMainDrawer}>Про нас</Link>
                <Link href="/dashboard" onClick={closeMainDrawer}>Графіки</Link>
              </div>
            )}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default MainDrawer;