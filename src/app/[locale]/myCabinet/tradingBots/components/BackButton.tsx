'use client'

import React from 'react'
import { useRouter } from '@/i18n/navigation'
import { useCustomTranslations } from '@/lib/contexts/translations/translations-context'
import { TKeys } from '@/i18n/t-keys'

interface BackButtonProps {
  /** Where to go on click. Defaults to the trading-bots landing. */
  href?: string
  label?: string
}

export default function BackButton({
  href = '/myCabinet/tradingBots',
  label,
}: BackButtonProps) {
  const router = useRouter()
  const { t } = useCustomTranslations(TKeys.tradingBots)
  return (
    <button
      type="button"
      onClick={() => router.replace(href)}
      className="text-sm text-[#8c8ca0] hover:text-[#D2D2FF] focus:outline-none"
    >
      {label ?? t.back}
    </button>
  )
}
