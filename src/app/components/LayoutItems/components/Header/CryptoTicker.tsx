'use client'

import Marquee from 'react-fast-marquee'
import { useEffect, useState } from 'react'
import CryptoBadge from './CryptoBadge'

interface Price {
  symbol: string
  price: string
}

const symbolsToTrack = [
  'BTCUSDT',
  'ETHUSDT',
  'SOLUSDT',
  'ADAUSDT',
  'XRPUSDT',
  'DOGEUSDT',
  'DOTUSDT',
  'AVAXUSDT',
  'LINKUSDT',
  'MATICUSDT',
  'BNBUSDT',
]

export default function CryptoTicker() {
  const [prices, setPrices] = useState<Price[]>([])
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    let intervalId: NodeJS.Timeout

    async function fetchPrices() {
      if (isRetrying) return
      
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
        
        const res = await fetch('https://api.binance.com/api/v3/ticker/price', {
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        
        const data: Price[] = await res.json()
        const filtered = data.filter(item => symbolsToTrack.includes(item.symbol))
        setPrices(filtered)
        setRetryCount(0) // Reset retry count on success
        setIsRetrying(false)
      } catch (err) {
        console.error('Failed to fetch Binance prices:', err)
        setIsRetrying(true)
        
        // Exponential backoff: 5s, 10s, 20s, 40s, then 60s max
        const delay = Math.min(5000 * Math.pow(2, retryCount), 60000)
        setRetryCount(prev => prev + 1)
        
        timeoutId = setTimeout(() => {
          setIsRetrying(false)
        }, delay)
      }
    }

    fetchPrices()

    // Refresh prices every 60 seconds (reduced frequency)
    intervalId = setInterval(fetchPrices, 60000)

    // Cleanup function
    return () => {
      clearInterval(intervalId)
      clearTimeout(timeoutId)
    }
  }, [retryCount, isRetrying])

  return (
    <div className="mt-2">
      <Marquee speed={40} pauseOnHover gradient={false}>
        {prices.map((item, i) => (
          <CryptoBadge key={i} price={item.price} symbol={item.symbol} />
        ))}
      </Marquee>
    </div>
  )
}
