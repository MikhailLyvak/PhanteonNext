'use client'

/**
 * LandingTabs — top-level switch between "Роботи" (default) and "API" lists.
 * Rendered on /myCabinet/tradingBots when the user has at least one created
 * robot. Local tab state — no URL coupling.
 */
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import useUserRobots from '@/hooks/TradingBots/useUserRobots'
import useUserApis from '@/hooks/TradingBots/useUserApis'
import RobotsList from './RobotsList'
import AllApisList from './AllApisList'

type Tab = 'robots' | 'apis'

export default function LandingTabs() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('robots')
  const { data: robots } = useUserRobots()
  const { data: apis } = useUserApis()

  const robotsCount = robots?.length
  const apisCount = apis?.length

  const tabClasses = (tab: Tab) =>
    `relative flex items-center px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
      activeTab === tab
        ? 'bg-[#6A56E4] text-white shadow-[0_4px_14px_-4px_rgba(106,86,228,0.55)]'
        : 'text-[#8c8ca0] hover:text-[#D2D2FF] hover:bg-[#242433]'
    }`

  const countBadge = (n: number | undefined, active: boolean) => {
    if (n === undefined) return null
    return (
      <span
        className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
          active ? 'bg-white/20 text-white' : 'bg-white/5 text-[#D2D2FF]'
        }`}
      >
        {n}
      </span>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="inline-flex items-center gap-1 p-1 bg-[#1D1D2A] rounded-xl ring-1 ring-white/5">
          <button
            type="button"
            onClick={() => setActiveTab('robots')}
            className={tabClasses('robots')}
          >
            Роботи
            {countBadge(robotsCount, activeTab === 'robots')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('apis')}
            className={tabClasses('apis')}
          >
            API
            {countBadge(apisCount, activeTab === 'apis')}
          </button>
        </div>
        {activeTab === 'robots' && (
          <button
            type="button"
            onClick={() => router.replace('/myCabinet/tradingBots?step=robot')}
            className="bg-[#6A56E4] text-white px-4 py-2 rounded-2xl hover:bg-[#5A4BC4] hover:shadow-xl transition-colors text-sm font-medium"
          >
            + Створити новий
          </button>
        )}
      </div>

      {activeTab === 'robots' && <RobotsList />}
      {activeTab === 'apis' && <AllApisList />}
    </div>
  )
}
