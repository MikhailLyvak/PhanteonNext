'use client'

import React, { useEffect, useRef, useState } from 'react'
import { AssetPair } from '@/lib/screener/types'
import { formatPrice } from '@/lib/screener/format'

interface Props {
	pair: AssetPair
}

const LivePrice: React.FC<Props> = ({ pair }) => {
	const [price, setPrice] = useState<number | null>(null)
	const [priceChange24h, setPriceChange24h] = useState<number>(0)
	const [priceDir, setPriceDir] = useState<'up' | 'down' | 'flat'>('flat')
	const prevPriceRef = useRef<number>(0)

	useEffect(() => {
		let cancelled = false

		const poll = async () => {
			try {
				const res = await fetch(
					`https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=${pair.code}`
				)
				if (!res.ok || cancelled) return
				const data = await res.json()
				const lastPrice = parseFloat(data.lastPrice)
				const changePct = parseFloat(data.priceChangePercent)

				const prev = prevPriceRef.current
				if (prev && lastPrice !== prev) {
					setPriceDir(lastPrice > prev ? 'up' : 'down')
				}
				prevPriceRef.current = lastPrice
				setPrice(lastPrice)
				setPriceChange24h(changePct)
			} catch {
				// ignore fetch errors
			}
		}

		poll()
		const iv = setInterval(poll, 1000)

		return () => {
			cancelled = true
			clearInterval(iv)
		}
	}, [pair.code])

	if (price === null) {
		return (
			<div className='flex items-baseline gap-2'>
				<span className='text-lg font-bold text-[#58587B]'>---</span>
			</div>
		)
	}

	const priceColor = priceDir === 'up'
		? 'text-[#4ade80]'
		: priceDir === 'down'
		? 'text-[#f87171]'
		: 'text-[#D2D2FF]'

	const changeColor = priceChange24h >= 0 ? 'text-[#4ade80]' : 'text-[#f87171]'
	const changeSign = priceChange24h >= 0 ? '+' : ''

	return (
		<div className='flex items-baseline gap-3'>
			<span className={`text-xl font-bold tabular-nums transition-colors ${priceColor}`}>
				{formatPrice(price, pair.precision)}
			</span>
			<span className={`text-sm font-medium ${changeColor}`}>
				{changeSign}{priceChange24h.toFixed(2)}%
			</span>
		</div>
	)
}

export default LivePrice
