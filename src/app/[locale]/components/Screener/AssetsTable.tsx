'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, Columns3 } from 'lucide-react'
import { useScreenerStore, SortKey } from '@/store/Screener/useScreenerStore'
import { DashboardAssetData } from '@/lib/screener/types'
import TableRow from './TableRow'
import Pagination from './Pagination'
import { useCustomTranslations } from '@/lib/contexts/translations/translations-context'
import { TKeys } from '@/i18n/t-keys'

interface Column {
	key: SortKey
	label: string
	align?: 'left' | 'right'
}

const DEFAULT_COLUMN_WIDTHS: Record<SortKey, number> = {
	pair: 120,
	price: 140,
	volume24h: 110,
	oi_1h: 100,
	oi_4h: 100,
	oi_24h: 100,
	cvd_1h: 120,
	cvd_4h: 120,
	liq_total_1h: 110,
	funding: 110,
}

const ACTIONS_COL_WIDTH = 40
const MIN_COL_WIDTH = 60
const MAX_COL_WIDTH = 600
const COLUMN_WIDTHS_STORAGE_KEY = 'screener.assets.columnWidths'

const AssetsTable: React.FC = () => {
	const searchTerm = useScreenerStore(s => s.searchTerm)
	const sortKey = useScreenerStore(s => s.sortKey)
	const sortDir = useScreenerStore(s => s.sortDir)
	const setSort = useScreenerStore(s => s.setSort)
	const preset = useScreenerStore(s => s.preset)
	const currentPage = useScreenerStore(s => s.currentPage)
	const pageSize = useScreenerStore(s => s.pageSize)
	const setPage = useScreenerStore(s => s.setPage)

	const { t } = useCustomTranslations(TKeys.screener)

	const COLUMNS: Column[] = useMemo(
		() => [
			{ key: 'pair', label: t.table.pair, align: 'left' },
			{ key: 'price', label: t.table.priceAndChange, align: 'right' },
			{ key: 'oi_1h', label: 'OI 1h', align: 'right' },
			{ key: 'oi_4h', label: 'OI 4h', align: 'right' },
			{ key: 'oi_24h', label: 'OI 24h', align: 'right' },
			{ key: 'cvd_1h', label: 'CVD 1h', align: 'right' },
			{ key: 'cvd_4h', label: 'CVD 4h', align: 'right' },
			{ key: 'liq_total_1h', label: 'Liq 1h', align: 'right' },
			{ key: 'funding', label: 'Funding', align: 'right' },
		],
		[t]
	)

	const [hiddenColumns, setHiddenColumns] = useState<Set<SortKey>>(new Set())
	const [columnsMenuOpen, setColumnsMenuOpen] = useState(false)
	const [columnWidths, setColumnWidths] = useState<Record<SortKey, number>>(
		DEFAULT_COLUMN_WIDTHS
	)
	const colResizeStartRef = useRef<{
		x: number
		key: SortKey
		startWidth: number
	} | null>(null)

	useEffect(() => {
		try {
			const stored = window.localStorage.getItem(COLUMN_WIDTHS_STORAGE_KEY)
			if (!stored) return
			const parsed = JSON.parse(stored) as Partial<Record<SortKey, number>>
			setColumnWidths(prev => {
				const next = { ...prev }
				for (const k of Object.keys(parsed) as SortKey[]) {
					const v = parsed[k]
					if (typeof v === 'number' && Number.isFinite(v)) {
						next[k] = Math.min(MAX_COL_WIDTH, Math.max(MIN_COL_WIDTH, v))
					}
				}
				return next
			})
		} catch {}
	}, [])

	const persistColumnWidths = (widths: Record<SortKey, number>) => {
		try {
			window.localStorage.setItem(COLUMN_WIDTHS_STORAGE_KEY, JSON.stringify(widths))
		} catch {}
	}

	const handleColResizeStart = (key: SortKey) => (e: React.PointerEvent<HTMLDivElement>) => {
		e.preventDefault()
		e.stopPropagation()
		e.currentTarget.setPointerCapture(e.pointerId)
		colResizeStartRef.current = {
			x: e.clientX,
			key,
			startWidth: columnWidths[key] ?? DEFAULT_COLUMN_WIDTHS[key],
		}
		document.body.style.cursor = 'col-resize'
		document.body.style.userSelect = 'none'
	}

	const handleColResizeMove = (e: React.PointerEvent<HTMLDivElement>) => {
		const start = colResizeStartRef.current
		if (!start) return
		const delta = e.clientX - start.x
		const next = Math.min(MAX_COL_WIDTH, Math.max(MIN_COL_WIDTH, start.startWidth + delta))
		setColumnWidths(prev => {
			if (prev[start.key] === next) return prev
			return { ...prev, [start.key]: next }
		})
	}

	const handleColResizeEnd = (e: React.PointerEvent<HTMLDivElement>) => {
		if (!colResizeStartRef.current) return
		colResizeStartRef.current = null
		try {
			e.currentTarget.releasePointerCapture(e.pointerId)
		} catch {}
		document.body.style.cursor = ''
		document.body.style.userSelect = ''
		setColumnWidths(prev => {
			persistColumnWidths(prev)
			return prev
		})
	}

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
		[COLUMNS, hiddenColumns]
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
				<table className='w-full' style={{ tableLayout: 'fixed' }}>
					<colgroup>
						{visibleColumns.map(col => (
							<col
								key={col.key}
								style={{ width: `${columnWidths[col.key] ?? DEFAULT_COLUMN_WIDTHS[col.key]}px` }}
							/>
						))}
						<col style={{ width: `${ACTIONS_COL_WIDTH}px` }} />
					</colgroup>
					<thead className='bg-[#1d212c]'>
						<tr>
							{visibleColumns.map(col => (
								<th
									key={col.key}
									onClick={() => setSort(col.key)}
									className={`relative px-3 py-3 text-xs font-semibold text-[#D2D2FF] cursor-pointer select-none overflow-hidden ${
										col.align === 'right' ? 'text-right' : 'text-left'
									}`}
								>
									<span className='inline-flex items-center gap-1 truncate max-w-full align-middle'>
										{col.label}
										{sortKey === col.key &&
											(sortDir === 'asc' ? (
												<ArrowUp size={12} />
											) : (
												<ArrowDown size={12} />
											))}
									</span>
									<div
										onPointerDown={handleColResizeStart(col.key)}
										onPointerMove={handleColResizeMove}
										onPointerUp={handleColResizeEnd}
										onPointerCancel={handleColResizeEnd}
										onClick={e => e.stopPropagation()}
										role='separator'
										aria-orientation='vertical'
										aria-label={`Resize ${col.label} column`}
										title={t.tooltips.dragResizeColumn}
										className='group absolute top-0 bottom-0 right-0 w-4 flex items-center justify-end cursor-col-resize touch-none z-10'
									>
										<div className='w-1 h-full bg-[#262b38] group-hover:bg-[#8AA6FF] transition-colors' />
									</div>
								</th>
							))}
							<th className='relative'>
								<button
									onClick={() => setColumnsMenuOpen(v => !v)}
									className='p-1 rounded hover:bg-[#2F2F40] text-[#98A0B3] hover:text-[#D2D2FF] transition-colors'
									title={t.tooltips.toggleColumns}
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
									{t.table.noPairs}
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
