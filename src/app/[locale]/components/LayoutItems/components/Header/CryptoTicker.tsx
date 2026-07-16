'use client'

import Marquee from 'react-fast-marquee'
import { useEffect, useMemo, useState } from 'react'
import CryptoBadge from './CryptoBadge'
import { useScreenerStore } from '@/store/Screener/useScreenerStore'

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
  'BNBUSDT',
]

export default function CryptoTicker() {
  const [isDesktop, setIsDesktop] = useState(true)
  const data = useScreenerStore(s => s.data)

  useEffect(() => {
    function handleResize() {
      setIsDesktop(window.innerWidth >= 1024)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => useScreenerStore.getState().subscribe(), [])

  const prices = useMemo(() => {
    return symbolsToTrack
      .map(symbol => {
        const close = data[symbol]?.ohlcv?.close_latest
        return typeof close === 'number' ? { symbol, price: String(close) } : null
      })
      .filter((x): x is { symbol: string; price: string } => x !== null)
  }, [data])

  return (
    <div className="mt-2">
      <Marquee speed={40}  pauseOnHover={isDesktop} gradient={false}>
        {prices.map((item, i) => (
          <CryptoBadge key={i} price={item.price} symbol={item.symbol} />
        ))}
      </Marquee>
    </div>
  )
}
