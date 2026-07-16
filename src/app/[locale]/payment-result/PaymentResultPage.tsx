'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Link, useRouter } from '@/i18n/navigation'
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

  const getStatusTitle = () => {
    switch (status) {
      case 'success':
        return 'Оплата успішна!'
      case 'error':
        return 'Помилка оплати'
      case 'pending':
        return 'Оплата обробляється'
      default:
        return 'Перевірка статусу...'
    }
  }

  const getActionButtons = () => {
    switch (status) {
      case 'success':
        return (
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
        )
      case 'error':
        return (
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
        )
      case 'pending':
        return (
          <Link
            href="/myCabinet/subscriptions"
            className="block w-full bg-[#D2D2FF] text-[#171723] font-semibold py-3 px-6 rounded-lg hover:bg-[#C0C0FF] transition-colors"
          >
            Перейти до кабінету
          </Link>
        )
      default:
        return (
          <>
            <Link
              href="/paywall"
              className="block w-full bg-[#D2D2FF] text-[#171723] font-semibold py-3 px-6 rounded-lg hover:bg-[#C0C0FF] transition-colors"
            >
              До оплати
            </Link>
            <Link
              href="/myCabinet"
              className="block w-full bg-[#2F2F40] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#3F3F50] transition-colors"
            >
              Особистий кабінет
            </Link>
          </>
        )
    }
  }

  return (
    <div className="min-h-screen bg-[#171723] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-[#242433] rounded-2xl p-8 text-center">
        <div className="mb-6">
          {getStatusIcon()}
        </div>
        
        <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
          {getStatusTitle()}
        </h1>
        
        <p className="text-[#58587B] mb-8">
          {message || 'Обробляємо ваш платіж...'}
        </p>
        
        <div className="space-y-4">
          {getActionButtons()}
        </div>
        
        <div className="mt-8 pt-6 border-t border-[#2F2F40]">
          <p className="text-sm text-[#58587B]">
            Якщо у вас виникли питання, зверніться до служби підтримки
          </p>
        </div>
      </div>
    </div>
  )
}
