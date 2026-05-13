'use client'

/**
 * RobotsList — robots-tab view.
 *
 * Reads `GET /statistics/robots/users` via `useUserRobots`. Each card shows
 * title, exchange/symbol, deposit, PnL/ROI and a status pill (active/paused).
 * Click navigates to `?step=detail&robotId=…`.
 */
import React from 'react'
import { useRouter } from 'next/navigation'
import { Triangle } from 'react-loader-spinner'

import useUserRobots from '@/hooks/TradingBots/useUserRobots'
import type { UserRobotData } from '@/api/TradingBots/types'

const formatNumber = (n: number | null | undefined, digits = 2): string => {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—'
  return n.toFixed(digits)
}

const formatRoi = (roi: number | null | undefined): string => {
  if (roi === null || roi === undefined || !Number.isFinite(roi)) return '—'
  return `${(roi * 100).toFixed(2)}%`
}

const statusPill = (r: UserRobotData) => {
  if (r.paused) {
    return (
      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-[#3a2a1a] text-[#F5A623]">
        Пауза
      </span>
    )
  }
  if (r.active) {
    return (
      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-[#1a3a2a] text-[#3DD68C]">
        Активний
      </span>
    )
  }
  return (
    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-[#2a2a3a] text-[#8c8ca0]">
      Зупинено
    </span>
  )
}

const statusBarColor = (r: UserRobotData) => {
  if (r.paused) return '#F5A623'
  if (r.active) return '#3DD68C'
  return '#58587B'
}

export default function RobotsList() {
  const router = useRouter()
  const { data: entries, isLoading, error } = useUserRobots()

  const goToDetail = (id: string) => {
    router.replace(`/myCabinet/tradingBots?step=detail&robotId=${id}`)
  }

  const goToCreateRobot = () => {
    router.replace('/myCabinet/tradingBots?step=robot')
  }

  if (isLoading) {
    return (
      <div className="mt-4 p-6 bg-[#242433] rounded-2xl">
        <div className="flex items-center justify-center py-10">
          <Triangle
            visible
            height={32}
            width={32}
            color="#6A56E4"
            ariaLabel="triangle-loading"
          />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-4 p-6 bg-[#242433] rounded-2xl">
        <h6 className="text-[#D2D2FF] text-xl font-semibold">Мої роботи</h6>
        <p className="text-red-500 text-sm mt-2">
          Не вдалося завантажити список роботів.
        </p>
      </div>
    )
  }

  const list = entries ?? []
  const activeCount = list.filter(({ robot }) => robot.active && !robot.paused).length

  if (list.length === 0) {
    return (
      <div className="mt-4 p-6 bg-[#242433] rounded-2xl">
        <h6 className="text-[#D2D2FF] text-xl font-semibold">Мої роботи</h6>
        <p className="text-[#8c8ca0] text-sm mt-2">
          Поки що немає створених роботів.
        </p>
        <button
          type="button"
          onClick={goToCreateRobot}
          className="w-full mt-4 bg-[#6A56E4] text-white p-3 rounded-3xl hover:bg-[#5A4BC4] hover:shadow-xl transition-colors flex items-center justify-center gap-2"
        >
          + Створити новий
        </button>
      </div>
    )
  }

  return (
    <div className="mt-[30px] p-6 bg-[#242433] rounded-2xl">
      <div className="flex items-center justify-between gap-3">
        <h6 className="text-[#D2D2FF] text-xl font-semibold">Мої роботи</h6>
        <span className="text-[10px] uppercase tracking-[0.18em] text-[#8c8ca0]">
          {activeCount} активних · {list.length} всього
        </span>
      </div>

      <ul className="mt-4 space-y-3">
        {list.map(({ robot }) => {
          const pnlPositive = (robot.pnl ?? 0) > 0
          const pnlNegative = (robot.pnl ?? 0) < 0
          const symbol = robot.settings?.symbol
          const exchange = robot.api?.exchange
          const pnlColor = pnlPositive
            ? 'text-[#3DD68C]'
            : pnlNegative
            ? 'text-[#FF6B6B]'
            : 'text-[#D2D2FF]'
          return (
            <li key={robot.id}>
              <button
                type="button"
                onClick={() => goToDetail(robot.id)}
                className="group relative w-full text-left p-4 pl-5 bg-[#1D1D2A] rounded-xl ring-1 ring-white/5 hover:bg-[#2F2F40] hover:ring-[#6A56E4]/40 transition-colors overflow-hidden"
              >
                <span
                  aria-hidden
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                  style={{ background: statusBarColor(robot) }}
                />

                <span
                  aria-hidden
                  className="absolute top-3 right-3 text-[#6A56E4] opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </span>

                <div className="flex items-center justify-between gap-3 pr-6">
                  <span className="text-[#D2D2FF] font-semibold truncate">
                    {robot.title}
                  </span>
                  {statusPill(robot)}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {exchange && (
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#242433] text-[#8c8ca0]">
                      {exchange}
                    </span>
                  )}
                  {symbol && (
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#242433] text-[#8c8ca0]">
                      {symbol}
                    </span>
                  )}
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#242433] text-[#8c8ca0]">
                    Депозит: {formatNumber(robot.deposit)}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#58587B]">PnL</p>
                    <p className={`mt-0.5 text-sm font-semibold ${pnlColor}`}>
                      {formatNumber(robot.pnl, 4)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#58587B]">ROI</p>
                    <p className={`mt-0.5 text-sm font-semibold ${pnlColor}`}>
                      {formatRoi(robot.roi)}
                    </p>
                  </div>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
