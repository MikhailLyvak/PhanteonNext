'use client'

import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
	currentPage: number
	pageCount: number
	onPageChange: (page: number) => void
}

function getPageItems(currentPage: number, pageCount: number): (number | 'ellipsis')[] {
	if (pageCount <= 7) {
		return Array.from({ length: pageCount }, (_, i) => i + 1)
	}

	const items: (number | 'ellipsis')[] = [1]

	if (currentPage <= 3) {
		items.push(2, 3, 4, 5, 'ellipsis', pageCount)
	} else if (currentPage >= pageCount - 2) {
		items.push(
			'ellipsis',
			pageCount - 4,
			pageCount - 3,
			pageCount - 2,
			pageCount - 1,
			pageCount,
		)
	} else {
		items.push('ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', pageCount)
	}

	return items
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, pageCount, onPageChange }) => {
	const items = getPageItems(currentPage, pageCount)
	const prevDisabled = currentPage <= 1
	const nextDisabled = currentPage >= pageCount

	const baseBtn =
		'h-8 min-w-8 px-2 rounded-md text-xs font-medium border border-[#262b38] transition-colors flex items-center justify-center'
	const idleBtn = 'text-[#D2D2FF] bg-[#1d212c] hover:bg-[#2F2F40]'
	const activeBtn = 'text-[#0A0E14] bg-[#8AA6FF] border-[#8AA6FF]'
	const disabledBtn = 'text-[#98A0B3] bg-[#1d212c]/50 cursor-not-allowed opacity-50'

	return (
		<nav
			aria-label='Pagination'
			className='flex items-center justify-end gap-1.5 px-3 py-3 border-t border-[#262b38] bg-[#161a22] flex-wrap'
		>
			<button
				type='button'
				aria-label='Previous page'
				onClick={() => !prevDisabled && onPageChange(currentPage - 1)}
				disabled={prevDisabled}
				className={`${baseBtn} ${prevDisabled ? disabledBtn : idleBtn}`}
			>
				<ChevronLeft size={14} />
			</button>

			{items.map((item, idx) =>
				item === 'ellipsis' ? (
					<span
						key={`ellipsis-${idx}`}
						className='h-8 min-w-8 flex items-center justify-center text-xs text-[#98A0B3]'
					>
						…
					</span>
				) : (
					<button
						key={item}
						type='button'
						onClick={() => onPageChange(item)}
						aria-current={item === currentPage ? 'page' : undefined}
						className={`${baseBtn} ${item === currentPage ? activeBtn : idleBtn}`}
					>
						{item}
					</button>
				),
			)}

			<button
				type='button'
				aria-label='Next page'
				onClick={() => !nextDisabled && onPageChange(currentPage + 1)}
				disabled={nextDisabled}
				className={`${baseBtn} ${nextDisabled ? disabledBtn : idleBtn}`}
			>
				<ChevronRight size={14} />
			</button>
		</nav>
	)
}

export default Pagination
