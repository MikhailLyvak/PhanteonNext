'use client'

import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { SUPPORTED_EXCHANGES } from '@/api/TradingBots/constants'
import useUserRobots from '@/hooks/TradingBots/useUserRobots'
import BackButton from './BackButton'
import { EXCHANGE_META } from './exchangeMeta'

export default function ExchangePicker() {
  const router = useRouter()
  const { data: robots } = useUserRobots()
  const hasRobots = (robots ?? []).length > 0

  const handlePick = (exchange: string) => {
    router.replace(`/myCabinet/tradingBots?step=api&exchange=${exchange}`)
  }

  return (
    <div className="w-full">
      {hasRobots && <BackButton />}
      <h6 className="text-[#D2D2FF] text-xl md:text-3xl font-bold mt-2">
        Виберіть біржу
      </h6>
      <p className="text-gray-400 text-sm mt-2">
        Оберіть біржу, до якої хочете під&apos;єднати API ключ.
      </p>

      <div className="mt-[30px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {SUPPORTED_EXCHANGES.map((exchange) => {
          const meta = EXCHANGE_META[exchange]
          return (
            <button
              key={exchange}
              type="button"
              onClick={() => handlePick(exchange)}
              style={
                {
                  '--accent': meta.accent,
                  '--glow': meta.glow,
                } as React.CSSProperties
              }
              className="group relative overflow-hidden p-6 rounded-2xl text-left transition-all duration-300
                         bg-gradient-to-br from-[#2B2B40] to-[#1E1E2C]
                         ring-1 ring-white/5
                         hover:ring-[var(--accent)] hover:-translate-y-1
                         hover:shadow-[0_18px_40px_-12px_var(--glow)]
                         focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -top-16 -right-16 w-44 h-44 rounded-full opacity-20
                           blur-3xl transition-opacity duration-300 group-hover:opacity-60"
                style={{ background: meta.accent }}
              />

              <div className="relative flex items-center gap-4">
                <div className="flex items-center justify-center w-16 h-16 transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src={meta.icon}
                    alt={`${meta.label} logo`}
                    width={56}
                    height={56}
                    className="object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <h6 className="text-[#F2F2FF] text-2xl font-bold leading-tight">
                    {meta.label}
                  </h6>
                  <p className="text-[10px] uppercase tracking-[0.18em] mt-1 font-semibold"
                     style={{ color: meta.accent }}>
                    Біржа
                  </p>
                </div>
              </div>

              <div className="relative mt-6 flex items-center justify-between">
                <p className="text-gray-400 text-xs">
                  Під&apos;єднати новий API ключ
                </p>
                <span
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/5
                             text-[var(--accent)] transition-all duration-300
                             group-hover:bg-[var(--accent)] group-hover:text-black
                             group-hover:translate-x-1"
                  aria-hidden
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
