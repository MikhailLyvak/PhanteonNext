'use client'

import React from 'react'
import { Search } from 'lucide-react'
import { useScreenerStore } from '@/store/Screener/useScreenerStore'

const Filters: React.FC = () => {
	const searchTerm = useScreenerStore(s => s.searchTerm)
	const setSearchTerm = useScreenerStore(s => s.setSearchTerm)

	return (
		<div className='mb-4'>
			<div className='flex items-center gap-2 max-w-md'>
				<div className='relative flex-1'>
					<Search
						size={16}
						className='absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7AA0]'
					/>
					<input
						type='text'
						value={searchTerm}
						onChange={e => setSearchTerm(e.target.value)}
						placeholder='Пошук пари…'
						className='w-full pl-9 pr-3 py-2 bg-[#1A1A28] border border-[#262b38] rounded-xl text-sm text-[#D2D2FF] placeholder-[#7A7AA0] focus:outline-none focus:border-[#8AA6FF]'
					/>
				</div>
			</div>
		</div>
	)
}

export default Filters
