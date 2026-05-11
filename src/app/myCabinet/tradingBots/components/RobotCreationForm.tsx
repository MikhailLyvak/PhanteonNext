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
  reinvest: true,
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
        notifications_trades: values.notifTrades,
        notifications_balance: values.notifBalance,
        notifications_api: values.notifApi,
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

  const refreshBalance = () => {
    if (!apiId) return
    validateMutation.mutate({ id: apiId })
  }

  return (
    <div className="mt-[30px] p-6 bg-[#242433] rounded-2xl">
      <h6 className="text-[#D2D2FF] text-xl font-semibold">Створення робота</h6>
      <p className="text-[#8c8ca0] text-sm mt-1">
        Біржа: <span className="text-[#D2D2FF]">{exchange || '—'}</span>
      </p>

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

        <label className="text-[#D2D2FF] text-sm font-medium mt-4 block">Баланс</label>
        <div className="flex items-center gap-3">
          <span className="text-[#D2D2FF]">
            {balance === null
              ? validateMutation.isPending
                ? 'Завантаження…'
                : 'Не вдалося отримати'
              : balance}
          </span>
          {balance === null && !validateMutation.isPending && (
            <button
              type="button"
              className="px-3 py-1 bg-[#1D1D2A] text-[#D2D2FF] text-sm rounded-lg hover:shadow-xl"
              onClick={refreshBalance}
            >
              Оновити баланс
            </button>
          )}
        </div>

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

        <h6 className="text-[#D2D2FF] text-base font-semibold mt-6">
          Сповіщення
        </h6>
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
    </div>
  )
}
