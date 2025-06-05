"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  User,
  List,
  Clock,
  GraduationCap,
  Settings,
  LogOut,
  CheckCircle,
} from "lucide-react";
import { MdArrowBackIosNew } from "react-icons/md";
import { useDrawerStore } from "@/store/Nav/useDrawerStore";
import { useUserStore } from "@/store/UserData/useUserStore";
import { Cookies } from "react-cookie";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoginButton from "./LoginButton";
import Image from "next/image";
import { useMainDrawerStore } from "@/store/Nav/useMainDrawerStore";
import { LuChartLine } from "react-icons/lu";

const Drawer = () => {
  const { isDrawerOpen, closeDrawer } = useDrawerStore();
  const { toggleMainDrawer } = useMainDrawerStore();
  const { user, clearUser } = useUserStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logout = () => {
    const cookies = new Cookies();
    cookies.remove("local_access_token", { path: "/" });
    clearUser();
    closeDrawer();
    router.push("/");
  };

  if (!mounted) return null;

  return (
    <div
      className={`fixed top-0 right-0 z-50 h-screen w-80 bg-[#171723] shadow-xl transition-transform duration-300 ease-in-out ${isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
    >
      {/* Close Button */}
      <div className="flex justify-between gap-[10px] m-3">
        <Link href="/" className="flex" onClick={closeDrawer}>
          <Image
            src="/Header/LogoColoredSmall.svg"
            alt="Phanteon Logo"
            width={41}
            height={41}
            className="object-contain"
            priority
          />
        </Link>
        <button
          onClick={() => { closeDrawer(); toggleMainDrawer(); }}
          className="flex items-center justify-center text-white bg-[#58587B] pr-1 rounded-xl h-12 w-12"
        >
          <MdArrowBackIosNew size={32} />
        </button>
      </div>

      {/* Top Section: User Info */}
      <div className="flex items-center mt-20 mb-12 gap-5 p-4">
        <div className="w-14 h-14 rounded-full bg-[#a7a7ca] flex items-center justify-center text-white font-bold text-xl p-7">
          {user?.email?.charAt(0).toUpperCase() || "U"}
        </div>
        <h2 className="text-lg text-[#D2D2FF] font-semibold">
          {user?.email?.split("@")[0] || "Користувач"}
        </h2>
      </div>

      {/* Middle Section: Navigation */}
      <nav className="flex-grow px-3">
        <NavItem icon={<User size={20} />} text="Персональні дані" closeDrawer={closeDrawer} link="/myCabinet/profile" />
        <NavItem icon={<GraduationCap size={20} />} text="Навчальна платформа" closeDrawer={closeDrawer} link="/myCabinet/studyPlatform" />
        <NavItem icon={<LuChartLine size={20} />} text="Графіки" closeDrawer={closeDrawer} link="/dashboard" />
        <NavItem icon={<Settings size={20} />} text="Налаштування" closeDrawer={closeDrawer} link="/myCabinet/settings" />
      </nav>

      {/* Bottom Section: Logout Button */}
      <div className="p-4 mt-auto">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 text-gray-700 p-3 rounded-lg hover:bg-[#2F2F40] transition"
        >
          <span className="w-10 h-10 flex items-center justify-center bg-[#a7a7ca] rounded-full text-white">
            <LogOut size={20} />
          </span>
          <span className="text-lg font-medium">Вихід</span>
        </button>
      </div>
    </div>
  );
};

const NavItem = ({ icon, text, link, closeDrawer }: { icon: React.ReactNode; text: string; link?: string, closeDrawer: () => void; }) => (
  <Link href={link || "#"} className="w-full">
    <button className="w-full flex items-center space-x-2 text-[#58587B] py-3 rounded-lg hover:bg-[#2F2F40] transition" onClick={() => closeDrawer()}>
      <span className="w-10 h-10 flex items-center justify-center rounded-full">
        {icon}
      </span>
      <span className="text-lg font-medium">{text}</span>
    </button>
  </Link>
);

export default Drawer;
