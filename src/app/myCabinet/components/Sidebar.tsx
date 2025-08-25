'use client'

import React from 'react';
import Link from 'next/link';
import { User, Settings, LogOut, GraduationCap, CheckCircle } from "lucide-react";
import { usePathname } from 'next/navigation';
import { LuChartLine } from 'react-icons/lu';
import { Cookies } from 'react-cookie';
import router from 'next/router';
import { useDrawerStore } from '@/store/Nav/useDrawerStore';
import { useUserStore } from '@/store/UserData/useUserStore';

const Sidebar = () => {
  const pathname = usePathname();
  const { isDrawerOpen, closeDrawer } = useDrawerStore();
  const { user, clearUser } = useUserStore();

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
      <NavItem
        icon={<LogOut size={20} />}
        text="Вихід"
        onClick={() => {
          const cookies = new Cookies();
          cookies.remove("local_access_token", { path: "/" });
          clearUser();
          closeDrawer();
          router.push("/login");
        }}
      />
    </div>
  );
};

const NavItem = ({
  icon,
  text,
  active,
  href,
  onClick
}: {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
  href?: string;
  onClick?: (() => void) | undefined;
}) => (
  <Link href={href ? href : ''} onClick={()=> onClick ? onClick() : null} className="block">
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

export default Sidebar;
