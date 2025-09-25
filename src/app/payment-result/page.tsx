'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Clock, CreditCard } from 'lucide-react'

export default function PaymentResultPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'pending'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Перевіряємо параметри URL для визначення статусу
    const statusParam = searchParams.get('status')
    const messageParam = searchParams.get('message')
    
    if (statusParam) {
      setStatus(statusParam as any)
      setMessage(messageParam || '')
    } else {
      // Симулюємо обробку результату оплати
      const timer = setTimeout(() => {
        // Для демонстрації встановлюємо успішний статус
        setStatus('success')
        setMessage('Ваша підписка успішно активована!')
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [searchParams])

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle size={64} className="text-green-500" />
      case 'error':
        return <XCircle size={64} className="text-red-500" />
      case 'pending':
        return <Clock size={64} className="text-yellow-500" />
      default:
        return <CreditCard size={64} className="text-blue-500 animate-pulse" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-500'
      case 'error':
        return 'text-red-500'
      case 'pending':
        return 'text-yellow-500'
      default:
        return 'text-blue-500'
    }
  }

  return (
    <div className="min-h-screen bg-[#171723] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-[#242433] rounded-2xl p-8 text-center">
        <div className="mb-6">
          {getStatusIcon()}
        </div>
        
        <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
          {status === 'loading' && 'Обробка платежу...'}
          {status === 'success' && 'Оплата успішна!'}
          {status === 'error' && 'Помилка оплати'}
          {status === 'pending' && 'Очікування'}
        </h1>
        
        <p className="text-[#58587B] mb-8">
          {status === 'loading' && 'Будь ласка, зачекайте поки ми обробимо ваш платіж...'}
          {status === 'success' && message}
          {status === 'error' && 'Сталася помилка при обробці платежу. Спробуйте ще раз.'}
          {status === 'pending' && 'Ваш платіж обробляється. Ви отримаєте підтвердження на email.'}
        </p>
        
        <div className="space-y-4">
          {status === 'success' && (
            <>
              <Link
                href="/myCabinet/subscriptions"
                className="block w-full bg-[#D2D2FF] text-[#171723] font-semibold py-3 px-6 rounded-lg hover:bg-[#C0C0FF] transition-colors"
              >
                Перейти до підписок
              </Link>
              <Link
                href="/myCabinet/studyPlatform"
                className="block w-full bg-[#2F2F40] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#3F3F50] transition-colors"
              >
                Перейти до курсів
              </Link>
            </>
          )}
          
          {status === 'error' && (
            <>
              <Link
                href="/paywall"
                className="block w-full bg-[#D2D2FF] text-[#171723] font-semibold py-3 px-6 rounded-lg hover:bg-[#C0C0FF] transition-colors"
              >
                Спробувати ще раз
              </Link>
              <Link
                href="/myCabinet/subscriptions"
                className="block w-full bg-[#2F2F40] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#3F3F50] transition-colors"
              >
                Мої підписки
              </Link>
            </>
          )}
          
          {status === 'pending' && (
            <Link
              href="/myCabinet/subscriptions"
              className="block w-full bg-[#D2D2FF] text-[#171723] font-semibold py-3 px-6 rounded-lg hover:bg-[#C0C0FF] transition-colors"
            >
              Перейти до кабінету
            </Link>
          )}
          
          {status === 'loading' && (
            <div className="text-[#58587B]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D2D2FF] mx-auto mb-4"></div>
              <p>Обробка...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
