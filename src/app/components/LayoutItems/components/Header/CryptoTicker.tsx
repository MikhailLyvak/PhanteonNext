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
    let retryTimeoutId: NodeJS.Timeout
    let intervalId: NodeJS.Timeout
    let abortController: AbortController | null = null

    async function fetchPrices() {
      if (isRetrying) return
      
      try {
        abortController = new AbortController()
        const fetchTimeoutId = setTimeout(() => {
          if (abortController) {
            abortController.abort()
          }
        }, 30000) // Increased timeout to 30 seconds
        
        const res = await fetch('https://api.binance.com/api/v3/ticker/price', {
          signal: abortController.signal
        })
        
        clearTimeout(fetchTimeoutId)
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        
        const data: Price[] = await res.json()
        const filtered = data.filter(item => symbolsToTrack.includes(item.symbol))
        setPrices(filtered)
        setRetryCount(0) // Reset retry count on success
        setIsRetrying(false)
      } catch (err) {
        // Only log error if it's not an abort error from cleanup
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Failed to fetch Binance prices:', err)
        }
        
        // Don't retry if component is unmounting (aborted)
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }
        
        setIsRetrying(true)
        
        // Exponential backoff: 5s, 10s, 20s, 40s, then 60s max
        const delay = Math.min(5000 * Math.pow(2, retryCount), 60000)
        setRetryCount(prev => prev + 1)
        
        retryTimeoutId = setTimeout(() => {
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
      clearTimeout(retryTimeoutId)
      if (abortController) {
        abortController.abort()
      }
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
