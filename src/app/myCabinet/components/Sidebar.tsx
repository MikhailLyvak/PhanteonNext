'use client'

import React from 'react';
import Link from 'next/link';
import { User, Settings, LogOut, GraduationCap, CheckCircle } from "lucide-react";
import { usePathname, useRouter } from 'next/navigation';
import { LuChartLine } from 'react-icons/lu';
import { useUserStore } from "@/store/UserData/useUserStore";
import { Cookies } from "react-cookie";

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { clearUser } = useUserStore();

  const logout = () => {
    const cookies = new Cookies();
    cookies.remove("local_access_token", { path: "/" });
    clearUser();
    router.push("/");
  };

  return (
    <div className="min-w-[312px] p-4 bg-[#242433] rounded-2xl flex flex-col gap-1">
      <NavItem
        icon={<User size={20} />}
        text="Персональні дані"
        href="/myCabinet/personalData"
        active={pathname === '/myCabinet/personalData'}
      />
      <NavItem
        icon={<GraduationCap size={20} />}
        text="Академія"
        href="/myCabinet/studyPlatform"
        active={pathname.includes('/myCabinet/studyPlatform')}
      />
      <NavItem
        icon={<LuChartLine size={20} />}
        text="Графіки"
        href="/dashboard"
        active={pathname === '/dashboard'}
      />
      <NavItem
        icon={<Settings size={20} />}
        text="Налаштування"
        href="/404page"
        active={pathname === '/404page'}
      />
      <LogoutNavItem
        icon={<LogOut size={20} />}
        text="Вихід"
        onClick={logout}
      />
    </div>
  );
};

const NavItem = ({
  icon,
  text,
  active,
  href
}: {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
  href: string;
}) => (
  <Link href={href} className="block">
    <button
      className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl transition-colors duration-200 hover:bg-[#2F2F40]
      ${active ? 'text-[#D2D2FF] font-semibold' : 'text-[#58587B]'}`}
    >
      {icon}
      <span className={`text-base ${active ? 'text-white' : 'text-[#58587B]'}`}>
        {text}
      </span>
    </button>
  </Link>
);

const LogoutNavItem = ({
  icon,
  text,
  onClick
}: {
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 py-3 px-4 rounded-xl transition-colors duration-200 hover:bg-[#2F2F40] text-[#58587B]"
  >
    {icon}
    <span className="text-base text-[#58587B]">
      {text}
    </span>
  </button>
);

export default Sidebar;
