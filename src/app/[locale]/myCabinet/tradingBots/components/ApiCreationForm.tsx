'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { Triangle } from 'react-loader-spinner'
import { SUPPORTED_EXCHANGES } from '@/api/TradingBots/constants'
import useValidateApi from '@/hooks/TradingBots/useValidateApi'
import useSaveApi from '@/hooks/TradingBots/useSaveApi'
import useUserRobots from '@/hooks/TradingBots/useUserRobots'
import BackButton from './BackButton'
import { EXCHANGE_META } from './exchangeMeta'
import type { SupportedExchange } from '@/api/TradingBots/constants'

const EXCHANGE_INSTRUCTIONS: Record<SupportedExchange, { title: string; description: string; image: string }[]> = {
  BYBIT: [
    {
      title: 'Крок 1: Відкрийте меню акаунта',
      description: 'Авторизуйтесь на біржі Bybit. Справа вгорі натисніть на іконку профілю та у випадаючому меню на поле «API». Як показано на зображенні.',
      image: '/wiki/Bybit/bybit-account-menu-api-ukr.jpg',
    },
    {
      title: 'Крок 2: Відкрийте керування API',
      description: 'Натисніть Створити новий ключ.',
      image: '/wiki/Bybit/bybit-api-management-list-ukr.jpg',
    },
    {
      title: 'Крок 3: Створіть новий ключ API',
      description: 'Натисніть Згенеровані системою ключі API.',
      image: '/wiki/Bybit/bybit-choose-key-type-ukr.jpg',
    },
    {
      title: 'Крок 4: Обмежте права доступу',
      description: 'Додайте назву ключа API. Оберіть: Читання/запис, Обмежень по IP немає, Єдиний торговий акаунт, Ордери, Позиції. Натисніть Надіслати.',
      image: '/wiki/Bybit/bybit-create-key-permissions-ukr.jpg',
    },
    {
      title: 'Крок 5: Збережіть ключі',
      description: 'Скопіюйте Ключ API та Секретний ключ API у надійне місце. Далі натисніть Зрозуміло.',
      image: '/wiki/Bybit/bybit-api-key-added-ukr.jpg',
    },
    {
      title: 'Крок 6: Додайте ключі в застосунок',
      description: 'Поверніться на платформу та внесіть назву, Ключ API та Секретний ключ API. Натисніть Зберегти API. Надалі, ви зможете використовувати їх по назві для створення різних роботів.',
      image: '/wiki/save-api-keys.png',
    },
  ],
  BINANCE: [
    {
      title: 'Крок 1: Відкрийте меню акаунта',
      description: 'Авторизуйтесь на біржі Binance. Справа вгорі натисніть на іконку профілю та у випадаючому меню на поле «Акаунт». Як показано на зображенні.',
      image: '/wiki/Binance/binance-account-menu-ukr.jpg',
    },
    {
      title: 'Крок 2: Відкрийте Управління API',
      description: 'Натисніть Управління API.',
      image: '/wiki/Binance/binance-api-management-list-ukr.jpg',
    },
    {
      title: 'Крок 3: Створіть API',
      description: 'Приберіть галочку та натисніть Створити API.',
      image: '/wiki/Binance/binance-api-management-ukr.jpg',
    },
    {
      title: 'Крок 4: Згенеруйте ключі',
      description: 'Натисніть Згенеровані системою та Далі.',
      image: '/wiki/Binance/binance-choose-api-key-type-ukr.jpg',
    },
    {
      title: 'Крок 5: Відредагуйте ключі',
      description: 'Скопіюйте Ключ API та Секретний ключ у надійне місце. Далі натисніть Редагувати обмеження.',
      image: '/wiki/Binance/binance-api-key-details-ukr.jpg',
    },
    {
      title: 'Крок 6: Налаштуйте доступи',
      description: 'Поставте галочки на опціях Увімкнути фʼючерси та Необмежений доступ по IP. Далі натисніть Зберегти.',
      image: '/wiki/Binance/binance-api-key-edit-save-ukr.jpg',
    },
    {
      title: 'Крок 7: Додайте ключі в застосунок',
      description: 'Поверніться на платформу та внесіть назву, Ключ API та Секретний ключ API. Натисніть Зберегти API. Надалі, ви зможете використовувати їх по назві для створення різних роботів.',
      image: '/wiki/save-api-keys.png',
    },
  ],
  BINGX: [
    {
      title: 'Крок 1: Відкрийте керування API',
      description: 'Увійдіть на BingX. У правому верхньому куті натисніть на іконку профілю та у випадаючому меню оберіть «Керування API».',
      image: '/wiki/Bingx/account-menu.png',
    },
    {
      title: 'Крок 2: Створіть API',
      description: 'Натисніть «Створити API».',
      image: '/wiki/Bingx/api-access-keys-app.png',
    },
    {
      title: 'Крок 3: Налаштуйте дозволи',
      description: 'Вкажіть назву API-ключа. Оберіть опції «Спот торгівля» та «Безстрокова фʼючерсна торгівля». Натисніть «Підтвердити». Введіть коди верифікації.',
      image: '/wiki/Bingx/api-key-edit-restrictions.png',
    },
    {
      title: 'Крок 4: Збережіть ключі',
      description: 'Скопіюйте API ключ та Секретний ключ у безпечне місце.',
      image: '/wiki/Bingx/api-key-details.png',
    },
    {
      title: 'Крок 5: Додайте ключі на платформу',
      description: 'Поверніться на платформу, введіть назву, Публічний ключ та Секретний ключ. Натисніть «Зберегти API». Тепер ви зможете використовувати збережені ключі за назвою для створення нових роботів.',
      image: '/wiki/save-api-keys.png',
    },
  ],
}

const formSchema = z.object({
  title: z
    .string()
    .optional()
    .refine((v) => !v || v.length >= 3, {
      message: 'Назва має містити щонайменше 3 символи',
    }),
  apiKey: z.string().min(1, 'API ключ обов\u2019язковий'),
  secretKey: z.string().min(1, 'Секретний ключ обов\u2019язковий'),
})

type FormValues = z.infer<typeof formSchema>

export default function ApiCreationForm() {
  const router = useRouter()

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
      setSubmitError('З\u2019єднання не вдалося')
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
        errAny?.response?.data?.message ?? errAny?.message ?? 'Не вдалося зберегти API'
      setSubmitError(backendMsg)
      return
    }

    router.replace(`/myCabinet/tradingBots?step=robot&apiId=${apiId}`)
  }

  if (showInstructions) {
    return (
      <div className="w-full">
        <button
          type="button"
          onClick={() => setShowInstructions(false)}
          className="text-sm text-[#8c8ca0] hover:text-[#D2D2FF] focus:outline-none"
        >
          &larr; Назад
        </button>
        <h6 className="text-[#D2D2FF] text-xl font-semibold mt-[30px]">
          Інструкції
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
            {EXCHANGE_INSTRUCTIONS[instructionExchange].map((step, idx) => (
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
        Під&apos;єднати API
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
                      Підтримується
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
          Інструкції
        </button>

        <h6 className="text-[#D2D2FF] text-xl font-semibold">Дані API</h6>
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
                <label className="text-[#D2D2FF] text-sm font-medium">Назва (необов&apos;язково)</label>
                <input
                  {...field}
                  name="bot-api-title"
                  value={field.value ?? ''}
                  type="text"
                  autoComplete="off"
                  placeholder="Назва API"
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
                <label className="text-[#D2D2FF] text-sm font-medium mt-4 block">API ключ</label>
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
                <label className="text-[#D2D2FF] text-sm font-medium mt-4 block">Секретний ключ</label>
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
                      showSecret ? 'Сховати секрет' : 'Показати секрет'
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
            Зберегти та продовжити
          </button>
        </form>
      </div>
    </div>
  )
}
