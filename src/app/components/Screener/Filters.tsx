'use client'

import React from 'react'
import { Search } from 'lucide-react'
import { useScreenerStore, Preset } from '@/store/Screener/useScreenerStore'

interface PresetButton {
	value: Preset
	label: string
}

const PRESETS: PresetButton[] = [
	{ value: 'all', label: 'Усі' },
	{ value: 'oi_spike', label: 'OI Spike' },
	{ value: 'negative_funding', label: 'Negative Funding' },
]

const Filters: React.FC = () => {
	const searchTerm = useScreenerStore(s => s.searchTerm)
	const setSearchTerm = useScreenerStore(s => s.setSearchTerm)
	const preset = useScreenerStore(s => s.preset)
	const setPreset = useScreenerStore(s => s.setPreset)

	return (
		<div className='flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4'>
			<div className='flex items-center gap-2 flex-1 max-w-md'>
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
			<div className='flex items-center gap-2 flex-wrap'>
				{PRESETS.map(p => {
					const active = preset === p.value
					return (
						<button
							key={p.value}
							onClick={() => setPreset(p.value)}
							className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-colors ${
								active
									? 'bg-[#2F2F40] text-[#D2D2FF] border border-[#8AA6FF]'
									: 'bg-[#1A1A28] border border-[#262b38] text-[#98A0B3] hover:text-[#D2D2FF]'
							}`}
						>
							{p.label}
						</button>
					)
				})}
			</div>
		</div>
	)
}

export default Filters
