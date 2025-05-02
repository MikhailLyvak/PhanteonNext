'use client'

import React from 'react';
import Link from 'next/link';
import { User, Settings, LogOut, GraduationCap, CheckCircle } from "lucide-react";
import { usePathname } from 'next/navigation';

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="min-w-[312px] p-4 bg-[#242433] rounded-2xl flex flex-col gap-1">
      <NavItem
        icon={<User size={20} />}
        text="Персональні дані"
        href="/myCabinet/profile"
        active={pathname === '/myCabinet/profile'}
      />
      <NavItem
        icon={<GraduationCap size={20} />}
        text="Навчальна платформа"
        href="/myCabinet/studyPlatform"
        active={pathname.includes('/myCabinet/studyPlatform')}
      />
      <NavItem
        icon={<CheckCircle size={20} />}
        text="Опитування"
        href="/myCabinet/surveys"
        active={pathname === '/myCabinet/surveys'}
      />
      <NavItem
        icon={<Settings size={20} />}
        text="Налаштування"
        href="/myCabinet/settings"
        active={pathname === '/myCabinet/settings'}
      />
      <NavItem
        icon={<LogOut size={20} />}
        text="Вихід"
        href="/logout"
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

export default Sidebar;
