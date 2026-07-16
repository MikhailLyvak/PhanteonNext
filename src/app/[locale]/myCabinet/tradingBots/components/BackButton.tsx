'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

interface BackButtonProps {
  /** Where to go on click. Defaults to the trading-bots landing. */
  href?: string
  label?: string
}

export default function BackButton({
  href = '/myCabinet/tradingBots',
  label = '← Назад',
}: BackButtonProps) {
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={() => router.replace(href)}
      className="text-sm text-[#8c8ca0] hover:text-[#D2D2FF] focus:outline-none"
    >
      {label}
    </button>
  )
}
