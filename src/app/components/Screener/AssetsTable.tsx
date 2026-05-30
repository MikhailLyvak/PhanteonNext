'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { useScreenerStore, SortKey } from '@/store/Screener/useScreenerStore'
import { getDashboardSnapshot } from '@/lib/screener/mock/dashboard'
import { PAIRS } from '@/lib/screener/mock/pairs'
import { DashboardAssetData } from '@/lib/screener/types'
import TableRow from './TableRow'

interface Column {
	key: SortKey
	label: string
	align?: 'left' | 'right'
}

const COLUMNS: Column[] = [
	{ key: 'pair', label: 'Пара', align: 'left' },
	{ key: 'price', label: 'Ціна / 24h%', align: 'right' },
	{ key: 'oi_1h', label: 'OI 1h', align: 'right' },
	{ key: 'oi_4h', label: 'OI 4h', align: 'right' },
	{ key: 'oi_24h', label: 'OI 24h', align: 'right' },
	{ key: 'cvd_1h', label: 'CVD 1h', align: 'right' },
	{ key: 'cvd_4h', label: 'CVD 4h', align: 'right' },
	{ key: 'liq_total_1h', label: 'Liq 1h', align: 'right' },
	{ key: 'funding', label: 'Funding', align: 'right' },
]

const OI_SPIKE_THRESHOLD = 3 // |%| in 1h

function pctChange(curr: number, prev: number | undefined): number {
	if (!prev) return 0
	return ((curr - prev) / prev) * 100
}

const AssetsTable: React.FC = () => {
	const searchTerm = useScreenerStore(s => s.searchTerm)
	const sortKey = useScreenerStore(s => s.sortKey)
	const sortDir = useScreenerStore(s => s.sortDir)
	const setSort = useScreenerStore(s => s.setSort)
	const preset = useScreenerStore(s => s.preset)

	const [rows, setRows] = useState<Record<string, DashboardAssetData> | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		let active = true
		setLoading(true)
		// TODO(real-data): swap for Axios GET /api/screener/dashboard and merge /ws/all updates.
		getDashboardSnapshot().then(snap => {
			if (!active) return
			setRows(snap)
			setLoading(false)
		})
		return () => {
			active = false
		}
	}, [])

	const display = useMemo(() => {
		if (!rows) return []
		const term = searchTerm.trim().toLowerCase()
		const list = PAIRS.filter(p => {
			if (!term) return true
			return p.code.toLowerCase().includes(term) || p.coin.toLowerCase().includes(term)
		})
			.map(p => ({ pair: p, data: rows[p.code] }))
			.filter(x => !!x.data)
			.filter(({ data }) => {
				if (preset === 'all') return true
				if (preset === 'oi_spike') {
					const oi1h = pctChange(data.oi.ointerest_latest, data.oi.ointerest_1h)
					return Math.abs(oi1h) >= OI_SPIKE_THRESHOLD
				}
				if (preset === 'negative_funding') {
					return (data.funding?.close_latest ?? 0) < 0
				}
				return true
			})

		const sortValue = (d: DashboardAssetData, pairCoin: string): number | string => {
			const oiNow = d.oi.ointerest_latest
			switch (sortKey) {
				case 'pair':
					return pairCoin
				case 'price':
					return d.ohlcv.close_latest
				case 'oi_1h':
					return pctChange(oiNow, d.oi.ointerest_1h)
				case 'oi_4h':
					return pctChange(oiNow, d.oi.ointerest_4h)
				case 'oi_24h':
					return pctChange(oiNow, d.oi.ointerest_24h)
				case 'cvd_1h':
					return d.cvd.cvd_1h ?? 0
				case 'cvd_4h':
					return d.cvd.cvd_4h ?? 0
				case 'liq_total_1h':
					return d.liquidations.total_turnover_1h ?? 0
				case 'funding':
					return d.funding?.close_latest ?? 0
			}
		}

		list.sort((a, b) => {
			const va = sortValue(a.data, a.pair.coin)
			const vb = sortValue(b.data, b.pair.coin)
			if (typeof va === 'string' && typeof vb === 'string') {
				return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
			}
			const na = Number(va)
			const nb = Number(vb)
			return sortDir === 'asc' ? na - nb : nb - na
		})
		return list
	}, [rows, searchTerm, sortKey, sortDir, preset])

	const totalColumns = COLUMNS.length + 1

	return (
		<div className='bg-[#161a22] border border-[#262b38] rounded-2xl overflow-hidden'>
			<div className='overflow-x-auto'>
				<table className='w-full'>
					<thead className='bg-[#1d212c]'>
						<tr>
							{COLUMNS.map(col => (
								<th
									key={col.key}
									onClick={() => setSort(col.key)}
									className={`px-3 py-3 text-xs font-semibold text-[#D2D2FF] cursor-pointer select-none ${
										col.align === 'right' ? 'text-right' : 'text-left'
									}`}
								>
									<span className='inline-flex items-center gap-1'>
										{col.label}
										{sortKey === col.key &&
											(sortDir === 'asc' ? (
												<ArrowUp size={12} />
											) : (
												<ArrowDown size={12} />
											))}
									</span>
								</th>
							))}
							<th className='w-6' aria-hidden='true' />
						</tr>
					</thead>
					<tbody className='divide-y divide-[#262b38]'>
						{loading &&
							Array.from({ length: 8 }).map((_, i) => (
								<tr key={`skeleton-${i}`} className='animate-pulse'>
									<td className='px-3 py-3'>
										<div className='flex items-center gap-2'>
											<div className='w-6 h-6 rounded-full bg-[#1A1A28]' />
											<div className='h-3 w-12 rounded bg-[#1A1A28]' />
										</div>
									</td>
									{Array.from({ length: COLUMNS.length - 1 }).map((__, j) => (
										<td key={j} className='px-3 py-3'>
											<div className='h-3 rounded bg-[#1A1A28] ml-auto w-14' />
										</td>
									))}
									<td className='pr-3 py-3 w-6' />
								</tr>
							))}
						{!loading && display.length === 0 && (
							<tr>
								<td colSpan={totalColumns} className='py-10 text-center text-sm text-[#98A0B3]'>
									Пар не знайдено
								</td>
							</tr>
						)}
						{!loading &&
							display.map(({ pair, data }) => (
								<TableRow key={pair.code} pair={pair} data={data} />
							))}
					</tbody>
				</table>
			</div>
		</div>
	)
}

export default AssetsTable
