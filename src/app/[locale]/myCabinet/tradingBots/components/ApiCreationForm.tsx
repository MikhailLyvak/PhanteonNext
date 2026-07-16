'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from '@/i18n/navigation'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { Triangle } from 'react-loader-spinner'
import { useMessages } from 'next-intl'
import { SUPPORTED_EXCHANGES } from '@/api/TradingBots/constants'
import useValidateApi from '@/hooks/TradingBots/useValidateApi'
import useSaveApi from '@/hooks/TradingBots/useSaveApi'
import useUserRobots from '@/hooks/TradingBots/useUserRobots'
import BackButton from './BackButton'
import { EXCHANGE_META } from './exchangeMeta'
import type { SupportedExchange } from '@/api/TradingBots/constants'
import { useCustomTranslations } from '@/lib/contexts/translations/translations-context'
import { TKeys } from '@/i18n/t-keys'

type InstructionStep = { title: string; description: string; image: string }

const EXCHANGE_KEY: Record<SupportedExchange, string> = {
  BYBIT: 'instructionsBybit',
  BINANCE: 'instructionsBinance',
  BINGX: 'instructionsBingx',
}

type FormValues = {
  title?: string
  apiKey: string
  secretKey: string
}

export default function ApiCreationForm() {
  const router = useRouter()
  const { t } = useCustomTranslations(TKeys.tradingBots)
  const messages = useMessages()

  // useMessages() is used here because the typed TKeys wrapper cannot express
  // array-valued translation keys — only scalar strings and ICU callables are
  // generated. The ?? [] guard ensures a missing key renders no steps rather
  // than throwing.
  const getInstructions = (exchange: SupportedExchange): InstructionStep[] => {
    const tb = (messages as Record<string, unknown>)['tradingBots'] as Record<string, unknown>
    return (tb?.[EXCHANGE_KEY[exchange]] as InstructionStep[]) ?? []
  }

  const formSchema = z.object({
    title: z
      .string()
      .optional()
      .refine((v) => !v || v.length >= 3, {
        message: t.apiNameTooShort,
      }),
    apiKey: z.string().min(1, t.apiKeyRequired),
    secretKey: z.string().min(1, t.secretKeyRequired),
  })

  const validateApi = useValidateApi()
  const saveApi = useSaveApi()
  const { data: robots } = useUserRobots()
  const hasRobots = (robots ?? []).length > 0

  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showSecret, setShowSecret] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [instructionExchange, setInstructionExchange] = useState<SupportedExchange>(SUPPORTED_EXCHANGES[0])

  const { control, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '', apiKey: '', secretKey: '' },
  })

  const isPending = validateApi.isPending || saveApi.isPending

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null)

    try {
      await validateApi.mutateAsync({
        key: values.apiKey,
        secret: values.secretKey,
      })
    } catch {
      setSubmitError(t.connectFailed)
      return
    }

    let apiId: string
    try {
      apiId = await saveApi.mutateAsync({
        title: values.title || undefined,
        key: values.apiKey,
        secret: values.secretKey,
      })
    } catch (err) {
      const errAny = err as {
        response?: { data?: { message?: string } }
        message?: string
      }
      const backendMsg =
        errAny?.response?.data?.message ?? errAny?.message ?? t.saveFailed
      setSubmitError(backendMsg)
      return
    }

    router.replace(`/myCabinet/tradingBots?step=robot&apiId=${apiId}`)
  }

  if (showInstructions) {
    const steps = getInstructions(instructionExchange)
    return (
      <div className="w-full">
        <button
          type="button"
          onClick={() => setShowInstructions(false)}
          className="text-sm text-[#8c8ca0] hover:text-[#D2D2FF] focus:outline-none"
        >
          &larr; {t.back.replace('← ', '')}
        </button>
        <h6 className="text-[#D2D2FF] text-xl font-semibold mt-[30px]">
          {t.instructions}
        </h6>

        <div className="mt-[30px] inline-flex items-center gap-1 p-1 bg-[#1D1D2A] rounded-xl ring-1 ring-white/5">
          {SUPPORTED_EXCHANGES.map((ex) => {
            const meta = EXCHANGE_META[ex]
            const active = ex === instructionExchange
            return (
              <button
                key={ex}
                type="button"
                onClick={() => setInstructionExchange(ex)}
                className={`relative flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  active
                    ? 'bg-[#6A56E4] text-white shadow-[0_4px_14px_-4px_rgba(106,86,228,0.55)]'
                    : 'text-[#8c8ca0] hover:text-[#D2D2FF] hover:bg-[#242433]'
                }`}
              >
                <Image src={meta.icon} alt={meta.label} width={20} height={20} className="object-contain" />
                {meta.label}
              </button>
            )
          })}
        </div>

        <div className="mt-4 py-6 bg-[#242433] rounded-2xl">
          <div className="space-y-6">
            {steps.map((step, idx) => (
              <div key={idx}>
                <p className="text-[#D2D2FF] text-sm font-bold mb-1">{step.title}</p>
                <p className="text-[#8c8ca0] text-sm mb-3">{step.description}</p>
                <Image
                  src={step.image}
                  alt={step.title}
                  width={600}
                  height={400}
                  className="w-full rounded-xl"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {hasRobots && <BackButton />}
      <h6 className="text-[#D2D2FF] text-xl font-semibold mt-[30px]">
        {t.connectApi}
      </h6>

      <div className="mt-[30px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUPPORTED_EXCHANGES.map((exchange) => {
            const meta = EXCHANGE_META[exchange]
            return (
              <div
                key={exchange}
                style={
                  {
                    '--accent': meta.accent,
                  } as React.CSSProperties
                }
                className="group relative overflow-hidden p-5 rounded-xl bg-[#1D1D2A] ring-1 ring-white/5 transition-all duration-300 hover:-translate-y-0.5 hover:ring-[color:var(--accent)]/60"
              >
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-[2px] opacity-70 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: 'var(--accent)' }}
                />

                <div className="relative flex items-center gap-4">
                  <div className="flex items-center justify-center w-14 h-14 shrink-0">
                    <Image
                      src={meta.icon}
                      alt={`${meta.label} logo`}
                      width={52}
                      height={52}
                      className="object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h6 className="text-[#F2F2FF] text-xl font-bold leading-tight">
                      {meta.label}
                    </h6>
                    <span
                      className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white"
                    >
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      {t.supported}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
      </div>

      <div className="mt-[30px] py-6 bg-[#242433] rounded-2xl">
        <button
          type="button"
          onClick={() => setShowInstructions(true)}
          className="w-full mb-4 bg-[#6A56E4] text-white p-3 rounded-3xl hover:bg-[#5A4BC4] hover:shadow-xl transition-colors flex items-center justify-center gap-2 text-sm font-medium"
        >
          {t.instructions}
        </button>

        <h6 className="text-[#D2D2FF] text-xl font-semibold">{t.apiData}</h6>
        <form
          onSubmit={handleSubmit(onSubmit)}
          method="post"
          autoComplete="off"
        >
          <Controller
            control={control}
            name="title"
            render={({ field, fieldState }) => (
              <>
                <label className="text-[#D2D2FF] text-sm font-medium">{t.apiNameLabel}</label>
                <input
                  {...field}
                  name="bot-api-title"
                  value={field.value ?? ''}
                  type="text"
                  autoComplete="off"
                  placeholder={t.apiNamePlaceholder}
                  className="w-full mt-4 p-3 border rounded-lg text-gray-800 focus:ring focus:ring-[#6A56E4] focus:outline-none"
                />
                {fieldState.error && (
                  <p className="text-red-500 text-sm">{fieldState.error.message}</p>
                )}
              </>
            )}
          />

          <Controller
            control={control}
            name="apiKey"
            render={({ field, fieldState }) => (
              <>
                <label className="text-[#D2D2FF] text-sm font-medium mt-4 block">{t.apiKeyLabel}</label>
                <input
                  {...field}
                  name="bot-api-public-key"
                  value={field.value ?? ''}
                  type="text"
                  autoComplete="off"
                  readOnly
                  onFocus={(e) => e.currentTarget.removeAttribute('readonly')}
                  placeholder="API key"
                  className="w-full mt-4 p-3 border rounded-lg text-gray-800 focus:ring focus:ring-[#6A56E4] focus:outline-none"
                />
                {fieldState.error && (
                  <p className="text-red-500 text-sm">{fieldState.error.message}</p>
                )}
              </>
            )}
          />

          <Controller
            control={control}
            name="secretKey"
            render={({ field, fieldState }) => (
              <>
                <label className="text-[#D2D2FF] text-sm font-medium mt-4 block">{t.secretKeyLabel}</label>
                <div className="relative">
                  <input
                    {...field}
                    name="bot-api-private-key"
                    value={field.value ?? ''}
                    type="text"
                    autoComplete="off"
                    readOnly
                    onFocus={(e) => e.currentTarget.removeAttribute('readonly')}
                    placeholder="Secret key"
                    style={
                      showSecret
                        ? undefined
                        : ({
                            WebkitTextSecurity: 'disc',
                            textSecurity: 'disc',
                          } as React.CSSProperties)
                    }
                    className="w-full mt-4 p-3 border rounded-lg text-gray-800 focus:ring focus:ring-[#6A56E4] focus:outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 mt-2 text-gray-600 hover:text-gray-800 focus:outline-none"
                    aria-label={
                      showSecret ? t.hideSecret : t.showSecret
                    }
                  >
                    {showSecret ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {fieldState.error && (
                  <p className="text-red-500 text-sm">{fieldState.error.message}</p>
                )}
              </>
            )}
          />

          {submitError && <p className="text-red-500 text-sm mt-3">{submitError}</p>}

          <button
            type="submit"
            disabled={isPending || formState.isSubmitting}
            className="w-full mt-4 bg-[#6A56E4] text-white p-3 rounded-3xl hover:shadow-xl flex items-center justify-center gap-2"
          >
            {isPending && (
              <Triangle
                visible={true}
                height={16}
                width={16}
                color="#fff"
                ariaLabel="triangle-loading"
              />
            )}
            {t.saveAndContinue}
          </button>
        </form>
      </div>
    </div>
  )
}
