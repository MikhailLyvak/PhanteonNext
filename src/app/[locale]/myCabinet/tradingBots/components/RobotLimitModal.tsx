'use client'

import React from 'react'
import { useCustomTranslations } from '@/lib/contexts/translations/translations-context'
import { TKeys } from '@/i18n/t-keys'

interface RobotLimitModalProps {
  open: boolean
  active: number
  limit: number
  onClose: () => void
}

export default function RobotLimitModal({
  open,
  active,
  limit,
  onClose,
}: RobotLimitModalProps) {
  const { t } = useCustomTranslations(TKeys.tradingBots)

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-[90%] max-w-md p-6 bg-[#242433] rounded-2xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h6 className="text-[#D2D2FF] text-xl font-semibold">
          {t.robotLimitTitle}
        </h6>
        <p className="text-[#8c8ca0] text-sm mt-3">
          {t.robotLimitDesc({ active, limit })}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-6 bg-[#6A56E4] text-white p-3 rounded-3xl hover:shadow-xl"
        >
          {t.understood}
        </button>
      </div>
    </div>
  )
}
