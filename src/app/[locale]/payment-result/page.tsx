import { Suspense } from 'react'
import PaymentResultPage from './PaymentResultPage'
import { setRequestLocale } from 'next-intl/server'
import { getCustomTranslations } from '@/lib/contexts/translations/translations-server'
import { TKeys } from '@/i18n/t-keys'

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const { t } = await getCustomTranslations(TKeys.payments)

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#171723] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-[#242433] rounded-2xl p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-[#D2D2FF] rounded-full animate-pulse mx-auto"></div>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-[#D2D2FF]">
            {t.pageLoading}
          </h1>
          <p className="text-[#58587B]">
            {t.pageLoadingDesc}
          </p>
        </div>
      </div>
    }>
      <PaymentResultPage />
    </Suspense>
  )
}
