'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Columns3 } from 'lucide-react'
import { useScreenerStore, SortKey } from '@/store/Screener/useScreenerStore'
import { DashboardAssetData } from '@/lib/screener/types'
import TableRow from './TableRow'
import Pagination from './Pagination'

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

const AssetsTable: React.FC = () => {
	const searchTerm = useScreenerStore(s => s.searchTerm)
	const sortKey = useScreenerStore(s => s.sortKey)
	const sortDir = useScreenerStore(s => s.sortDir)
	const setSort = useScreenerStore(s => s.setSort)
	const preset = useScreenerStore(s => s.preset)
	const currentPage = useScreenerStore(s => s.currentPage)
	const pageSize = useScreenerStore(s => s.pageSize)
	const setPage = useScreenerStore(s => s.setPage)

	const [hiddenColumns, setHiddenColumns] = useState<Set<SortKey>>(new Set())
	const [columnsMenuOpen, setColumnsMenuOpen] = useState(false)

	const toggleColumn = (key: SortKey) => {
		setHiddenColumns(prev => {
			const next = new Set(prev)
			if (next.has(key)) next.delete(key)
			else next.add(key)
			return next
		})
	}

	const visibleColumns = useMemo(
		() => COLUMNS.filter(c => !hiddenColumns.has(c.key)),
		[hiddenColumns]
	)

	const pairs = useScreenerStore(s => s.pairs)
	const data = useScreenerStore(s => s.data)

	useEffect(() => useScreenerStore.getState().subscribe(), [])

	const hasData = pairs.length > 0 && Object.keys(data).length > 0
	const loading = !hasData

	const display = useMemo(() => {
		if (!hasData) return { pageItems: [], totalCount: 0 }
		const rows = data
		const term = searchTerm.trim().toLowerCase()
		const list = pairs.filter(p => {
			if (!term) return true
			return p.code.toLowerCase().includes(term) || p.coin.toLowerCase().includes(term)
		})
			.map(p => ({ pair: p, data: rows[p.code] }))
			.filter(x => !!x.data)
			.filter(() => {
				if (preset === 'all') return true
				return true
			})

		const sortValue = (d: DashboardAssetData, pairCoin: string): number | string => {
			switch (sortKey) {
				case 'pair':
					return pairCoin
				case 'price':
					return d.ohlcv?.close_latest ?? 0
				case 'volume24h':
					return d.quote_volume_24h ?? 0
				case 'oi_1h':
					return d.oi?.ointerest_1h ?? 0
				case 'oi_4h':
					return d.oi?.ointerest_4h ?? 0
				case 'oi_24h':
					return d.oi?.ointerest_24h ?? 0
				case 'cvd_1h':
					return d.cvd?.cvd_1h ?? 0
				case 'cvd_4h':
					return d.cvd?.cvd_4h ?? 0
				case 'liq_total_1h':
					return d.liquidations?.total_turnover_1h ?? 0
				case 'funding':
					return d.funding?.close_latest ?? 0
				default:
					return d.quote_volume_24h ?? 0
			}
		}

		list.sort((a, b) => {
			// Pin BTCUSDT to the top when no sort is active
			if (!sortKey) {
				if (a.pair.code === 'BTCUSDT') return -1
				if (b.pair.code === 'BTCUSDT') return 1
			}

			const va = sortValue(a.data, a.pair.coin)
			const vb = sortValue(b.data, b.pair.coin)
			if (typeof va === 'string' && typeof vb === 'string') {
				return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
			}
			const na = Number(va)
			const nb = Number(vb)
			return sortDir === 'asc' ? na - nb : nb - na
		})

		const totalCount = list.length
		const pageCount = Math.max(1, Math.ceil(totalCount / pageSize))
		const safePage = Math.min(Math.max(1, currentPage), pageCount)
		const start = (safePage - 1) * pageSize
		const pageItems = list.slice(start, start + pageSize)
		return { pageItems, totalCount }
	}, [pairs, data, hasData, searchTerm, sortKey, sortDir, preset, currentPage, pageSize])

	const pageCount = Math.max(1, Math.ceil(display.totalCount / pageSize))

	const effectiveSortDir = !sortKey ? 'desc' : sortDir

	const totalColumns = visibleColumns.length + 1

	return (
		<div className='bg-[#161a22] border border-[#262b38] rounded-2xl overflow-hidden'>
			<div className='overflow-x-auto'>
				<table className='w-full'>
					<thead className='bg-[#1d212c]'>
						<tr>
							{visibleColumns.map(col => (
								<th
									key={col.key}
									onClick={() => setSort(col.key)}
									className={`px-3 py-3 text-xs font-semibold text-[#D2D2FF] cursor-pointer select-none ${
										col.align === 'right' ? 'text-right' : 'text-left'
									}${col.key === 'pair' ? ' w-px whitespace-nowrap' : ''}`}
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
							<th className='w-8 relative'>
								<button
									onClick={() => setColumnsMenuOpen(v => !v)}
									className='p-1 rounded hover:bg-[#2F2F40] text-[#98A0B3] hover:text-[#D2D2FF] transition-colors'
									title='Toggle columns'
								>
									<Columns3 size={14} />
								</button>
								{columnsMenuOpen && (
									<>
										<div
											className='fixed inset-0 z-20'
											onClick={() => setColumnsMenuOpen(false)}
										/>
										<div className='absolute right-0 top-full mt-1 z-30 bg-[#1d212c] border border-[#262b38] rounded-lg shadow-lg py-1 min-w-[140px]'>
											{COLUMNS.filter(c => c.key !== 'pair').map(col => (
												<label
													key={col.key}
													className='flex items-center gap-2 px-3 py-1.5 hover:bg-[#2F2F40]/50 cursor-pointer text-xs text-[#D2D2FF] whitespace-nowrap'
												>
													<input
														type='checkbox'
														checked={!hiddenColumns.has(col.key)}
														onChange={() => toggleColumn(col.key)}
														className='accent-[#8AA6FF]'
													/>
													{col.label}
												</label>
											))}
										</div>
									</>
								)}
							</th>
						</tr>
					</thead>
					<tbody className='divide-y divide-[#262b38]'>
						{loading &&
							Array.from({ length: 12 }).map((_, i) => (
								<tr key={`skeleton-${i}`} className='animate-pulse'>
									{visibleColumns.map(col => {
										if (col.key === 'pair') {
											return (
												<td key={col.key} className='px-3 py-3 whitespace-nowrap'>
													<div className='h-3.5 w-20 rounded bg-[#1A1A28]' />
												</td>
											)
										}
										if (col.key === 'price') {
											return (
												<td key={col.key} className='px-3 py-3'>
													<div className='flex flex-col items-end gap-1.5'>
														<div className='h-3 w-16 rounded bg-[#1A1A28]' />
														<div className='h-2.5 w-10 rounded bg-[#1A1A28]/70' />
													</div>
												</td>
											)
										}
										return (
											<td key={col.key} className='px-3 py-3'>
												<div className='h-3 rounded bg-[#1A1A28] ml-auto w-14' />
											</td>
										)
									})}
									<td className='pr-3 py-3 w-6' />
								</tr>
							))}
						{!loading && display.totalCount === 0 && (
							<tr>
								<td colSpan={totalColumns} className='py-10 text-center text-sm text-[#98A0B3]'>
									Пар не знайдено
								</td>
							</tr>
						)}
						{!loading &&
							display.pageItems.map(({ pair, data }) => (
								<TableRow key={pair.code} pair={pair} data={data} hiddenColumns={hiddenColumns} />
							))}
					</tbody>
				</table>
			</div>
			{!loading && display.totalCount > pageSize && (
				<Pagination
					currentPage={Math.min(currentPage, pageCount)}
					pageCount={pageCount}
					onPageChange={setPage}
				/>
			)}
		</div>
	)
}

export default AssetsTable
