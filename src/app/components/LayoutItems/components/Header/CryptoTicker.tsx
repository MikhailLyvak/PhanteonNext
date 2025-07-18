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

  useEffect(() => {
    async function fetchPrices() {
      try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/price')
        const data: Price[] = await res.json()
        const filtered = data.filter(item => symbolsToTrack.includes(item.symbol))
        setPrices(filtered)
      } catch (err) {
        console.error('Failed to fetch Binance prices:', err)
      }
    }

    fetchPrices()

    // Add event listener for window focus
    window.addEventListener('focus', fetchPrices)

    // Cleanup function
    return () => {
      window.removeEventListener('focus', fetchPrices)
    }
  }, [])

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
