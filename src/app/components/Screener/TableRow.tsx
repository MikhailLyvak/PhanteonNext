'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import { AssetPair, DashboardAssetData } from '@/lib/screener/types'
import { formatPercent, formatPrice, formatUsdShort } from '@/lib/screener/format'

interface Props {
	pair: AssetPair
	data: DashboardAssetData
}

function pctChange(curr: number, prev: number | undefined): number {
	if (!prev) return 0
	return ((curr - prev) / prev) * 100
}

// Funding rate in lightweight-charts mock is a fraction (e.g. 0.0008 = 0.08%).
// Spec: extreme |fr| >= 0.05% = warn yellow; >= 0.1% = bad red.
function fundingColor(funding: number): string {
	const absPct = Math.abs(funding) * 100
	if (absPct >= 0.1) return 'text-[#f87171] font-semibold'
	if (absPct >= 0.05) return 'text-[#fbbf24] font-semibold'
	if (absPct < 0.005) return 'text-[#7A7AA0]'
	return funding >= 0 ? 'text-[#4ade80]' : 'text-[#f87171]'
}

// Mute deltas below 0.5% so only meaningful movers carry color.
function oiCellClass(delta: number): string {
	const abs = Math.abs(delta)
	if (abs < 0.5) return 'text-[#7A7AA0]'
	if (abs >= 5) return delta >= 0 ? 'text-[#4ade80] font-semibold' : 'text-[#f87171] font-semibold'
	return delta >= 0 ? 'text-[#4ade80]' : 'text-[#f87171]'
}

const CVD_NOISE_FLOOR = 1000
function cvdCellClass(value: number): string {
	if (Math.abs(value) < CVD_NOISE_FLOOR) return 'text-[#7A7AA0]'
	return value >= 0 ? 'text-[#4ade80]' : 'text-[#f87171]'
}

const TableRow: React.FC<Props> = ({ pair, data }) => {
	const router = useRouter()
	const [imgError, setImgError] = useState(false)

	const price = data.ohlcv.close_latest
	const priceDelta24h = pctChange(price, data.ohlcv.close_24h)

	const oi = data.oi.ointerest_latest
	const oi1h = pctChange(oi, data.oi.ointerest_1h)
	const oi4h = pctChange(oi, data.oi.ointerest_4h)
	const oi24h = pctChange(oi, data.oi.ointerest_24h)

	const cvd1h = data.cvd.cvd_1h ?? 0
	const cvd4h = data.cvd.cvd_4h ?? 0

	const liqTotal1h = data.liquidations.total_turnover_1h ?? 0
	const funding = data.funding?.close_latest ?? 0

	const onClick = () => router.push(`/myCabinet/screener/terminal/${pair.code}`)

	const priceDeltaMuted = Math.abs(priceDelta24h) < 0.1

	return (
		<tr
			onClick={onClick}
			className='group cursor-pointer hover:bg-[#2F2F40]/50 transition-colors'
		>
			<td className='px-3 py-3'>
				<div className='flex items-center gap-2'>
					{!imgError ? (
						<Image
							src={pair.iconUrl}
							alt={pair.coin}
							width={24}
							height={24}
							className='rounded-full'
							onError={() => setImgError(true)}
							unoptimized
						/>
					) : (
						<span className='inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#1A1A28] text-[10px] text-[#D2D2FF] font-bold'>
							{pair.coin.slice(0, 3)}
						</span>
					)}
					<span className='text-sm font-semibold text-[#D2D2FF]'>{pair.coin}</span>
					<span className='text-xs text-[#7A7AA0]'>USDT</span>
				</div>
			</td>
			<td className='px-3 py-3 text-right'>
				<div className='text-sm text-[#D2D2FF]'>
					{formatPrice(price, pair.precision)}
				</div>
				<div
					className={`text-xs ${
						priceDeltaMuted
							? 'text-[#7A7AA0]'
							: priceDelta24h >= 0
							? 'text-[#4ade80]'
							: 'text-[#f87171]'
					}`}
				>
					{formatPercent(priceDelta24h)}
				</div>
			</td>
			<td className={`px-3 py-3 text-right text-sm ${oiCellClass(oi1h)}`}>
				{formatPercent(oi1h)}
			</td>
			<td className={`px-3 py-3 text-right text-sm ${oiCellClass(oi4h)}`}>
				{formatPercent(oi4h)}
			</td>
			<td className={`px-3 py-3 text-right text-sm ${oiCellClass(oi24h)}`}>
				{formatPercent(oi24h)}
			</td>
			<td className='px-3 py-3 text-right'>
				<span className={`text-sm ${cvdCellClass(cvd1h)}`}>
					{formatUsdShort(cvd1h)}
				</span>
			</td>
			<td className='px-3 py-3 text-right'>
				<span className={`text-sm ${cvdCellClass(cvd4h)}`}>
					{formatUsdShort(cvd4h)}
				</span>
			</td>
			<td className='px-3 py-3 text-right text-sm text-[#D2D2FF]'>
				{formatUsdShort(liqTotal1h)}
			</td>
			<td className='px-3 py-3 text-right'>
				<span className={`text-sm ${fundingColor(funding)}`}>
					{formatPercent(funding * 100, 4)}
				</span>
			</td>
			<td className='pr-3 py-3 w-6 text-right'>
				<ChevronRight
					size={14}
					className='inline text-[#58587B] opacity-0 group-hover:opacity-100 transition-opacity'
				/>
			</td>
		</tr>
	)
}

export default TableRow
