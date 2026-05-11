'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { Triangle } from 'react-loader-spinner'
import useValidateApi from '@/hooks/TradingBots/useValidateApi'
import useSaveApi from '@/hooks/TradingBots/useSaveApi'
import useUserRobots from '@/hooks/TradingBots/useUserRobots'
import BackButton from './BackButton'

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
  const searchParams = useSearchParams()
  const exchange = searchParams.get('exchange') ?? ''

  const validateApi = useValidateApi()
  const saveApi = useSaveApi()
  const { data: robots } = useUserRobots()
  const hasRobots = (robots ?? []).length > 0

  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showSecret, setShowSecret] = useState(false)

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
        exchange,
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
        exchange,
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

    router.replace(
      `/myCabinet/tradingBots?step=robot&exchange=${exchange}&apiId=${apiId}`
    )
  }

  return (
    <div className="w-full">
      {hasRobots && <BackButton />}
      <h6 className="text-[#D2D2FF] text-xl md:text-3xl font-bold mt-2">
        Під&apos;єднати API ({exchange})
      </h6>

      <div className="mt-[30px] p-6 bg-[#242433] rounded-2xl">
        <h6 className="text-[#D2D2FF] text-xl font-semibold">Дані API</h6>
        <form
          onSubmit={handleSubmit(onSubmit)}
          method="post"
        >
          <Controller
            control={control}
            name="title"
            render={({ field, fieldState }) => (
              <>
                <label className="text-[#D2D2FF] text-sm font-medium">Назва (необов&apos;язково)</label>
                <input
                  {...field}
                  value={field.value ?? ''}
                  type="text"
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
                  value={field.value ?? ''}
                  type="text"
                  autoComplete="off"
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
                    value={field.value ?? ''}
                    type={showSecret ? 'text' : 'password'}
                    autoComplete="off"
                    placeholder="Secret key"
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
