'use client'

import React, { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/i18n/navigation'
import { Triangle } from 'react-loader-spinner'
import { Pause, Square } from 'lucide-react'

import useStopRobot from '@/hooks/TradingBots/useStopRobot'
import usePauseRobot from '@/hooks/TradingBots/usePauseRobot'
import useResumeRobot from '@/hooks/TradingBots/useResumeRobot'
import useUserRobots from '@/hooks/TradingBots/useUserRobots'
import useUserInfo from '@/hooks/TradingBots/useUserInfo'
import BackButton from './BackButton'
import RobotLimitModal from './RobotLimitModal'
import { useCustomTranslations } from '@/lib/contexts/translations/translations-context'
import { TKeys } from '@/i18n/t-keys'

const formatNumber = (n: number | null | undefined, digits = 2): string => {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—'
  return n.toFixed(digits)
}

const formatRoi = (roi: number | null | undefined): string => {
  if (roi === null || roi === undefined || !Number.isFinite(roi)) return '—'
  return `${(roi * 100).toFixed(2)}%`
}

export default function RobotDetailCard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const robotId = searchParams.get('robotId') ?? ''
  const { t } = useCustomTranslations(TKeys.tradingBots)
  const { t: tErrors } = useCustomTranslations(TKeys.errors)

  const { data: entries, isLoading } = useUserRobots()
  const { data: userInfo } = useUserInfo()
  const entry = entries?.find((e) => e.robot.id === robotId)

  const stopMutation = useStopRobot()
  const pauseMutation = usePauseRobot()
  const resumeMutation = useResumeRobot()

  const [limitModalOpen, setLimitModalOpen] = useState(false)

  const handleStop = async () => {
    if (!robotId) return
    try {
      await stopMutation.mutateAsync(robotId)
    } catch {
      // Inline error rendered below.
    }
  }

  const handlePause = async () => {
    if (!robotId) return
    try {
      await pauseMutation.mutateAsync(robotId)
    } catch {
      // Inline error rendered below.
    }
  }

  // Resume from Stopped consumes a slot — block via modal if at the limit.
  const handleResume = async (checkLimit: boolean) => {
    if (!robotId) return
    if (
      checkLimit &&
      userInfo &&
      userInfo.robots_active !== undefined &&
      userInfo.robots_limit !== undefined &&
      userInfo.robots_active >= userInfo.robots_limit
    ) {
      setLimitModalOpen(true)
      return
    }
    try {
      await resumeMutation.mutateAsync(robotId)
    } catch {
      // Inline error rendered below.
    }
  }

  if (isLoading) {
    return (
      <div className="mt-[30px] p-6 bg-[#242433] rounded-2xl">
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

  if (!entry) {
    return (
      <div className="mt-[30px] p-6 bg-[#242433] rounded-2xl">
        <h6 className="text-[#D2D2FF] text-xl font-semibold">{t.robotNotFound}</h6>
        <p className="text-[#8c8ca0] text-sm mt-2">
          {t.robotNotFoundDesc}
        </p>
        <button
          type="button"
          className="w-full mt-4 bg-[#1D1D2A] text-[#D2D2FF] p-3 rounded-3xl hover:shadow-xl flex items-center justify-center gap-2"
          onClick={() => router.replace('/myCabinet/tradingBots')}
        >
          {t.backToList}
        </button>
      </div>
    )
  }

  const { robot } = entry
  const rowClass = 'flex justify-between items-center mt-3 text-[#D2D2FF]'
  const labelMutedClass = 'text-[#8c8ca0] text-sm'
  const pnlPositive = (robot.pnl ?? 0) > 0
  const pnlNegative = (robot.pnl ?? 0) < 0
  const pnlColor = pnlPositive
    ? 'text-[#3DD68C]'
    : pnlNegative
    ? 'text-[#FF6B6B]'
    : 'text-[#D2D2FF]'

  const isRunning = !!robot.active && !robot.paused
  const isPaused = !!robot.active && !!robot.paused
  const isStopped = !robot.active

  const statusBadge = isRunning
    ? {
        label: t.statusActive,
        icon: null,
        className: 'bg-[#3DD68C]/15 text-[#3DD68C]',
        showPulse: true,
      }
    : isPaused
    ? {
        label: t.statusPause,
        icon: <Pause size={12} fill="currentColor" />,
        className: 'bg-[#F5C842]/15 text-[#F5C842]',
        showPulse: false,
      }
    : {
        label: t.statusStopped,
        icon: <Square size={12} fill="currentColor" />,
        className: 'bg-[#FF6B6B]/15 text-[#FF6B6B]',
        showPulse: false,
      }

  // Map error codes from useAlgonixSession; unknown errors pass through as-is
  const known: Record<string, string> = {
    userEmailNotFound: tErrors.userEmailNotFound,
    platformSessionNotFound: tErrors.platformSessionNotFound,
  }
  const resolveError = (err: Error | null) => {
    if (!err) return null
    return known[err.message] ?? err.message
  }

  const actionError =
    stopMutation.error || pauseMutation.error || resumeMutation.error

  const primaryClass =
    'w-full mt-4 bg-[#6A56E4] text-white p-3 rounded-3xl hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
  const secondaryClass =
    'w-full mt-4 bg-[#1D1D2A] text-[#D2D2FF] p-3 rounded-3xl hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const renderSpinner = (visible: boolean) =>
    visible ? (
      <Triangle
        visible
        height={16}
        width={16}
        color="#fff"
        ariaLabel="triangle-loading"
      />
    ) : null

  return (
    <div className="mt-[30px] p-6 bg-[#242433] rounded-2xl">
      <div className="mb-3">
        <BackButton />
      </div>
      <h6 className="text-[#D2D2FF] text-xl font-semibold">{robot.title}</h6>

      <div className="mt-2">
        <div className={rowClass}>
          <span className={labelMutedClass}>{t.status}</span>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge.className}`}
          >
            {statusBadge.showPulse && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-current opacity-60 animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
              </span>
            )}
            {statusBadge.icon}
            {statusBadge.label}
          </span>
        </div>
        <div className={rowClass}>
          <span className={labelMutedClass}>{t.exchange}</span>
          <span>{robot.api?.exchange ?? '—'}</span>
        </div>
        {robot.settings?.symbol && (
          <div className={rowClass}>
            <span className={labelMutedClass}>{t.coin}</span>
            <span>{robot.settings.symbol}</span>
          </div>
        )}
        <div className={rowClass}>
          <span className={labelMutedClass}>{t.deposit}</span>
          <span>{formatNumber(robot.deposit)}</span>
        </div>
        <div className={rowClass}>
          <span className={labelMutedClass}>{t.pnl}</span>
          <span className={pnlColor}>{formatNumber(robot.pnl)}</span>
        </div>
        <div className={rowClass}>
          <span className={labelMutedClass}>{t.roi}</span>
          <span className={pnlColor}>{formatRoi(robot.roi)}</span>
        </div>
      </div>

      {actionError && (
        <p className="text-red-500 text-sm mt-4">
          {resolveError(actionError) || t.actionError}
        </p>
      )}

      {isRunning && (
        <>
          <button
            type="button"
            onClick={handleStop}
            disabled={stopMutation.isPending}
            className={primaryClass}
          >
            {renderSpinner(stopMutation.isPending)}
            {t.stopRobot}
          </button>
          <button
            type="button"
            onClick={handlePause}
            disabled={pauseMutation.isPending}
            className={secondaryClass}
          >
            {renderSpinner(pauseMutation.isPending)}
            {t.pause}
          </button>
        </>
      )}

      {isPaused && (
        <>
          <button
            type="button"
            onClick={() => handleResume(false)}
            disabled={resumeMutation.isPending}
            className={primaryClass}
          >
            {renderSpinner(resumeMutation.isPending)}
            {t.resume}
          </button>
          <button
            type="button"
            onClick={handleStop}
            disabled={stopMutation.isPending}
            className={secondaryClass}
          >
            {renderSpinner(stopMutation.isPending)}
            {t.stopRobot}
          </button>
        </>
      )}

      {isStopped && (
        <button
          type="button"
          onClick={() => handleResume(true)}
          disabled={resumeMutation.isPending}
          className={primaryClass}
        >
          {renderSpinner(resumeMutation.isPending)}
          {t.start}
        </button>
      )}

      <RobotLimitModal
        open={limitModalOpen}
        active={userInfo?.robots_active ?? 0}
        limit={userInfo?.robots_limit ?? 0}
        onClose={() => setLimitModalOpen(false)}
      />
    </div>
  )
}
