'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import { useRouter } from '@/i18n/navigation'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Triangle } from 'react-loader-spinner'

import useValidateApi from '@/hooks/TradingBots/useValidateApi'
import usePresets from '@/hooks/TradingBots/usePresets'
import useCreateRobot from '@/hooks/TradingBots/useCreateRobot'
import useUserInfo from '@/hooks/TradingBots/useUserInfo'
import { selectPreset } from '@/api/TradingBots/selectPreset'
import { useCustomTranslations } from '@/lib/contexts/translations/translations-context'
import { TKeys } from '@/i18n/t-keys'

const formatBalance = (n: number): string => {
  if (!Number.isFinite(n)) return '—'
  // Show up to 2 decimals, drop trailing zeros so whole numbers stay tight.
  return n
    .toFixed(2)
    .replace(/\.?0+$/, '')
}

type FormValues = {
  title: string
  deposit: number | null
  reinvest: boolean
  notifTrades: boolean
  notifBalance: boolean
  notifApi: boolean
}

const DEFAULT_VALUES: FormValues = {
  title: '',
  deposit: null,
  reinvest: false,
  notifTrades: true,
  notifBalance: true,
  notifApi: true,
}

interface RobotCreationFormProps {
  apiId: string
  exchange: string
}

export default function RobotCreationForm({
  apiId,
  exchange,
}: RobotCreationFormProps) {
  const router = useRouter()
  const { t } = useCustomTranslations(TKeys.tradingBots)

  const formSchema = useMemo(() => z.object({
    title: z.string().min(3, t.robotNameError),
    deposit: z
      .union([z.number(), z.null()])
      .refine((v) => v !== null && Number.isFinite(v) && v > 0, {
        message: t.depositError,
      }),
    reinvest: z.boolean(),
    notifTrades: z.boolean(),
    notifBalance: z.boolean(),
    notifApi: z.boolean(),
  }), [t])

  const validateMutation = useValidateApi()
  const presetsQuery = usePresets()
  const createRobotMutation = useCreateRobot()
  const userInfoQuery = useUserInfo()

  const telegramUsername = userInfoQuery.data?.telegram_username?.trim() ?? ''
  const isTelegramConnected = telegramUsername.length > 0
  const telegramDeeplink = userInfoQuery.data?.id
    ? `https://t.me/artrader_help_bot?start=${userInfoQuery.data.id}`
    : null

  const balance: number | null = validateMutation.data?.balance ?? null

  useEffect(() => {
    if (!apiId) return
    validateMutation.mutate({ id: apiId })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiId])

  const {
    control,
    handleSubmit,
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  })

  const title = watch('title')
  const deposit = watch('deposit')
  const reinvest = watch('reinvest')

  // Reinvest lock: when on, deposit = balance and the input is disabled.
  useEffect(() => {
    if (reinvest && balance !== null) {
      setValue('deposit', balance, { shouldValidate: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reinvest, balance])

  const autoFilledRef = useRef(false)
  useEffect(() => {
    if (autoFilledRef.current) return
    if (reinvest) return
    if (deposit !== null && deposit !== undefined) return
    if (balance === null) return
    setValue('deposit', balance, { shouldValidate: true })
    autoFilledRef.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balance, reinvest, deposit])

  const presets = presetsQuery.data ?? []
  const chosenPreset = useMemo(() => {
    if (!exchange || deposit === null || deposit === undefined) return null
    return selectPreset(presets, exchange, deposit)
  }, [presets, exchange, deposit])

  const presetsForExchange = useMemo(
    () => presets.filter((p) => p.exchange === exchange),
    [presets, exchange],
  )
  const minOfAllPresets = useMemo(() => {
    if (presetsForExchange.length === 0) return null
    return Math.min(...presetsForExchange.map((p) => p.min_deposit))
  }, [presetsForExchange])

  const depositBelowPreset =
    deposit !== null &&
    deposit !== undefined &&
    deposit > 0 &&
    !chosenPreset &&
    minOfAllPresets !== null

  const submitDisabled =
    !apiId ||
    !exchange ||
    !title ||
    title.trim().length < 3 ||
    deposit === null ||
    deposit === undefined ||
    deposit <= 0 ||
    !chosenPreset ||
    createRobotMutation.isPending ||
    presetsQuery.isLoading

  const onSubmit = async (values: FormValues) => {
    if (!chosenPreset) return
    if (values.deposit === null || values.deposit === undefined) return

    try {
      const robotId = await createRobotMutation.mutateAsync({
        title: values.title,
        deposit: values.deposit,
        reinvest: values.reinvest,
        depositStop: 0,
        notifications_trades: isTelegramConnected ? values.notifTrades : false,
        notifications_balance: isTelegramConnected ? values.notifBalance : false,
        notifications_api: isTelegramConnected ? values.notifApi : false,
        api: { id: apiId, balance: 0 },
        settings: {
          id: chosenPreset.id,
          isDefault: false,
          mock: false,
          orders: [],
        },
      })

      router.replace(
        `/myCabinet/tradingBots?step=detail&robotId=${robotId}`,
      )
    } catch {
      // Error rendered inline below via createRobotMutation.error.
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label className="text-[#D2D2FF] text-sm font-medium mt-4 block">{t.robotNameLabel}</label>
        <Controller
          control={control}
          name="title"
          render={({ field, fieldState }) => (
            <>
              <input
                {...field}
                value={field.value ?? ''}
                type="text"
                placeholder={t.robotNamePlaceholder}
                className="w-full mt-4 p-3 border rounded-lg text-gray-800 focus:ring focus:ring-[#6A56E4] focus:outline-none"
              />
              {fieldState.error && (
                <p className="text-red-500 text-sm">{fieldState.error.message}</p>
              )}
            </>
          )}
        />

        <div className="mt-4 flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <label className="text-[#D2D2FF] text-sm font-medium block h-5">
              {t.depositLabel}
            </label>
            <Controller
              control={control}
              name="deposit"
              render={({ field, fieldState }) => (
                <>
                  <input
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const raw = e.target.value
                      if (raw === '') {
                        field.onChange(null)
                        return
                      }
                      const num = Number(raw)
                      field.onChange(Number.isFinite(num) ? num : null)
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    type="number"
                    step="any"
                    inputMode="decimal"
                    placeholder="0"
                    readOnly={reinvest}
                    className={`w-full mt-2 h-12 px-3 border rounded-lg text-gray-800 focus:ring focus:ring-[#6A56E4] focus:outline-none ${
                      reinvest ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                  {fieldState.error && (
                    <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                  )}
                </>
              )}
            />
          </div>

          <div className="shrink-0 w-[148px]">
            <span className="text-[#D2D2FF] text-sm font-medium block h-5">
              {t.balance}
            </span>
            <button
              type="button"
              onClick={() => {
                if (!apiId || validateMutation.isPending) return
                if (!reinvest && balance !== null) {
                  setValue('deposit', balance, { shouldValidate: true })
                }
                validateMutation.mutate({ id: apiId })
              }}
              disabled={!apiId || validateMutation.isPending}
              title={
                reinvest
                  ? t.updateBalance
                  : t.updateBalanceAndFill
              }
              className="w-full mt-2 h-12 px-3 inline-flex items-center justify-center gap-2 rounded-lg ring-1 ring-white/10 bg-[#1D1D2A] hover:ring-[#6A56E4]/60 hover:bg-[#242433] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-[#6A56E4] font-semibold">$</span>
              <span className="text-[#D2D2FF] font-semibold tabular-nums">
                {balance !== null ? formatBalance(balance) : '—'}
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`text-[#8c8ca0] ${
                  validateMutation.isPending ? 'animate-spin' : ''
                }`}
              >
                <path d="M21 12a9 9 0 1 1-3-6.7" />
                <polyline points="21 3 21 9 15 9" />
              </svg>
            </button>
          </div>
        </div>
        {depositBelowPreset && minOfAllPresets !== null && (
          <p className="text-red-500 text-sm">
            {t.depositTooSmall({ min: minOfAllPresets })}
          </p>
        )}
        {!presetsQuery.isLoading &&
          presetsForExchange.length === 0 &&
          exchange && (
            <p className="text-red-500 text-sm">
              {t.noPresets}
            </p>
          )}

        <Controller
          control={control}
          name="reinvest"
          render={({ field }) => (
            <label className="flex items-center gap-2 mt-4 text-[#D2D2FF] cursor-pointer">
              <input
                type="checkbox"
                checked={!!field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
              <span>{t.reinvest}</span>
            </label>
          )}
        />

        <div className="mt-6 flex items-center gap-2 flex-wrap">
          <h6 className="text-[#D2D2FF] text-base font-semibold">
            {t.notifications}
          </h6>
          {isTelegramConnected && (
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#242433] text-[#8c8ca0]">
              {t.telegramConnected({ username: telegramUsername })}
            </span>
          )}
        </div>

        {userInfoQuery.isLoading || userInfoQuery.isPending ? (
          <div className="mt-2 flex items-center gap-2 text-[#8c8ca0] text-sm">
            <Triangle
              visible
              height={16}
              width={16}
              color="#6A56E4"
              ariaLabel="triangle-loading"
            />
            <span>{t.loadingTelegram}</span>
          </div>
        ) : isTelegramConnected ? (
          <>
            <Controller
              control={control}
              name="notifTrades"
              render={({ field }) => (
                <label className="flex items-center gap-2 mt-2 text-[#D2D2FF] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                  <span>{t.notifTrades}</span>
                </label>
              )}
            />
            <Controller
              control={control}
              name="notifBalance"
              render={({ field }) => (
                <label className="flex items-center gap-2 mt-2 text-[#D2D2FF] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                  <span>{t.notifBalance}</span>
                </label>
              )}
            />
            <Controller
              control={control}
              name="notifApi"
              render={({ field }) => (
                <label className="flex items-center gap-2 mt-2 text-[#D2D2FF] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                  <span>{t.notifApi}</span>
                </label>
              )}
            />
          </>
        ) : (
          <div className="mt-2 p-4 rounded-xl bg-[#1D1D2A] ring-1 ring-white/5">
            <p className="text-[#D2D2FF] text-sm">
              {t.connectTelegramDesc}
            </p>
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <a
                href={telegramDeeplink ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={!telegramDeeplink}
                className={`bg-[#6A56E4] text-white px-4 py-2 rounded-2xl text-sm font-medium transition-colors ${
                  telegramDeeplink
                    ? 'hover:bg-[#5A4BC4] hover:shadow-xl'
                    : 'opacity-50 cursor-not-allowed pointer-events-none'
                }`}
              >
                {t.connectTelegram}
              </a>
              <button
                type="button"
                onClick={() => userInfoQuery.refetch()}
                disabled={userInfoQuery.isFetching}
                className="text-[#8c8ca0] hover:text-[#D2D2FF] text-sm underline underline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {userInfoQuery.isFetching ? t.checkingConnection : t.checkConnection}
              </button>
            </div>
          </div>
        )}

        {createRobotMutation.error && (
          <p className="text-red-500 text-sm mt-4">
            {createRobotMutation.error.message
              ? t.createRobotError({ detail: createRobotMutation.error.message })
              : t.createRobotErrorGeneric}
          </p>
        )}

        <button
          type="submit"
          disabled={submitDisabled}
          className="w-full mt-4 bg-[#6A56E4] text-white p-3 rounded-3xl hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createRobotMutation.isPending && (
            <Triangle
              visible
              height={16}
              width={16}
              color="#fff"
              ariaLabel="triangle-loading"
            />
          )}
        {t.createRobot}
      </button>
    </form>
  )
}
