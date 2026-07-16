'use client'

import React from 'react';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { User, Settings, LogOut, GraduationCap, Video, Award, CreditCard, Bot, Radar } from "lucide-react";
import { useUserStore } from "@/store/UserData/useUserStore";
import { useAlgonixSessionStore } from "@/store/TradingBots/useAlgonixSessionStore";
import { Cookies } from "react-cookie";
import { useCustomTranslations } from '@/lib/contexts/translations/translations-context'
import { TKeys } from '@/i18n/t-keys'

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { clearUser } = useUserStore();
  const { t } = useCustomTranslations(TKeys.cabinet.common)

  const logout = () => {
    const cookies = new Cookies();
    cookies.remove("local_access_token", { path: "/" });
    clearUser();
    useAlgonixSessionStore.getState().clearSession();
    router.push("/");
  };

  return (
    <div className="min-w-[312px] p-4 bg-[#242433] rounded-2xl flex flex-col gap-1">
      <NavItem
        icon={<User size={20} />}
        text={t.personalData}
        href="/myCabinet/personalData"
        active={pathname === '/myCabinet/personalData'}
      />
      <NavItem
        icon={<GraduationCap size={20} />}
        text={t.academy}
        href="/myCabinet/studyPlatform"
        active={pathname === '/myCabinet/studyPlatform'}
      />
      <NavItem
        icon={<Award size={20} />}
        text={t.certificates}
        href="/myCabinet/certificates"
        active={pathname === '/myCabinet/certificates'}
      />
      <NavItem
        icon={<CreditCard size={20} />}
        text={t.subscriptions}
        href="/myCabinet/subscriptions"
        active={pathname === '/myCabinet/subscriptions'}
      />
      <NavItem
        icon={<Bot size={20} />}
        text={t.algoTrading}
        href="/myCabinet/tradingBots"
        active={pathname === '/myCabinet/tradingBots'}
      />
      <NavItem
        icon={<Radar size={20} />}
        text={t.screener}
        href="/myCabinet/screener"
        active={pathname.includes('/myCabinet/screener')}
      />
      <NavItem
        icon={<Video size={20} />}
        text={t.webinars}
        href="/myCabinet/webinars"
        active={pathname.includes('/myCabinet/webinars')}
      />
      <NavItem
        icon={<Settings size={20} />}
        text={t.settings}
        href="/myCabinet/settings"
        active={pathname === '/myCabinet/settings'}
      />
      <LogoutNavItem
        icon={<LogOut size={20} />}
        text={t.logout}
        onClick={logout}
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
