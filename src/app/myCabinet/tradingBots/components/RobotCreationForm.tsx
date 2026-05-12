'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Triangle } from 'react-loader-spinner'

import useValidateApi from '@/hooks/TradingBots/useValidateApi'
import usePresets from '@/hooks/TradingBots/usePresets'
import useCreateRobot from '@/hooks/TradingBots/useCreateRobot'
import useUserInfo from '@/hooks/TradingBots/useUserInfo'
import { selectPreset } from '@/api/TradingBots/selectPreset'

const formSchema = z.object({
  title: z.string().min(3, 'Назва повинна містити мінімум 3 символи'),
  deposit: z
    .union([z.number(), z.null()])
    .refine((v) => v !== null && Number.isFinite(v) && v > 0, {
      message: 'Депозит повинен бути більше 0',
    }),
  reinvest: z.boolean(),
  notifTrades: z.boolean(),
  notifBalance: z.boolean(),
  notifApi: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

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
      <label className="text-[#D2D2FF] text-sm font-medium mt-4 block">Назва робота</label>
        <Controller
          control={control}
          name="title"
          render={({ field, fieldState }) => (
            <>
              <input
                {...field}
                value={field.value ?? ''}
                type="text"
                placeholder="Мій робот"
                className="w-full mt-4 p-3 border rounded-lg text-gray-800 focus:ring focus:ring-[#6A56E4] focus:outline-none"
              />
              {fieldState.error && (
                <p className="text-red-500 text-sm">{fieldState.error.message}</p>
              )}
            </>
          )}
        />

        <label className="text-[#D2D2FF] text-sm font-medium mt-4 block">Депозит</label>
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
                className={`w-full mt-4 p-3 border rounded-lg text-gray-800 focus:ring focus:ring-[#6A56E4] focus:outline-none ${
                  reinvest ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
              {fieldState.error && (
                <p className="text-red-500 text-sm">{fieldState.error.message}</p>
              )}
            </>
          )}
        />
        {depositBelowPreset && minOfAllPresets !== null && (
          <p className="text-red-500 text-sm">
            Депозит занадто малий — мінімум для цієї біржі: {minOfAllPresets}
          </p>
        )}
        {!presetsQuery.isLoading &&
          presetsForExchange.length === 0 &&
          exchange && (
            <p className="text-red-500 text-sm">
              Для цієї біржі немає доступних пресетів.
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
              <span>Реінвестувати весь баланс</span>
            </label>
          )}
        />

        <div className="mt-6 flex items-center gap-2 flex-wrap">
          <h6 className="text-[#D2D2FF] text-base font-semibold">
            Сповіщення
          </h6>
          {isTelegramConnected && (
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#242433] text-[#8c8ca0]">
              Підключено: @{telegramUsername}
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
            <span>Завантаження…</span>
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
                  <span>Сповіщення про торги</span>
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
                  <span>Сповіщення про баланс</span>
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
                  <span>Сповіщення про API</span>
                </label>
              )}
            />
          </>
        ) : (
          <div className="mt-2 p-4 rounded-xl bg-[#1D1D2A] ring-1 ring-white/5">
            <p className="text-[#D2D2FF] text-sm">
              Щоб отримувати сповіщення про торги, баланс та API, підключіть Telegram-бот.
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
                Підключити Telegram
              </a>
              <button
                type="button"
                onClick={() => userInfoQuery.refetch()}
                disabled={userInfoQuery.isFetching}
                className="text-[#8c8ca0] hover:text-[#D2D2FF] text-sm underline underline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {userInfoQuery.isFetching ? 'Перевіряємо…' : 'Перевірити підключення'}
              </button>
            </div>
          </div>
        )}

        {createRobotMutation.error && (
          <p className="text-red-500 text-sm mt-4">
            {createRobotMutation.error.message ||
              'Не вдалося створити робота. Спробуйте ще раз.'}
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
        Створити робота
      </button>
    </form>
  )
}
