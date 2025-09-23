'use client'

import { useId, useState } from 'react'

const YearSubscriptions = () => {
	const [selectedMonth, setSelectedMonth] = useState<'6' | '12'>('6')
	const nameId = useId()

	return (
		<div className='flex flex-col items-center justify-start bg-[#242433] rounded-[32px] pt-[30px] pb-[26px] flex-1 lg:border-none border-2 border-[#D2D2FF]'>
			<div className='mb-5'>
				<div className='flex gap-2 items-start mb-1'>
					<div className='line-through lg:text-2xl text-xl text-gray-300'>
						$1200/рік
					</div>
					<div className='lg:text-4xl font-bold  text-2xl'>$900/рік</div>
				</div>
				<div className='text-sx text-gray-400 text-center mx-auto'>
					Лише до 01.11
				</div>
			</div>
			<form className='flex items-start gap-3 mb-6'>
				<div className='flex gap-2.5 items-center'>
					<label
						className='relative flex items-center cursor-pointer justify-center'
						htmlFor='radio1'
					>
						<input
							id='radio1'
							name={`month-${nameId}`}
							type='radio'
							value='1'
							checked={selectedMonth === '6'}
							onChange={() => setSelectedMonth('6')}
							className='peer h-[28px] w-[28px] cursor-pointer appearance-none rounded-full border-2 border-[#d2d2ff8c] checked:border-[#d2d2ff8c] transition-opacity'
						/>
						<span
							className={`pointer-events-none absolute bg-[#D2D2FF] w-[18px] h-[18px] rounded-full transition-opacity duration-150 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
								selectedMonth === '6' ? 'opacity-100' : 'opacity-0'
							}`}
						/>
					</label>
					<div>6 місяців</div>
				</div>
				<div className='flex gap-2.5 items-center'>
					<label
						className='relative flex items-center cursor-pointer justify-center'
						htmlFor='radio1'
					>
						<input
							id='radio1'
							name={`month-${nameId}`}
							type='radio'
							value='1'
							checked={selectedMonth === '12'}
							onChange={() => setSelectedMonth('12')}
							className='peer h-[28px] w-[28px] cursor-pointer appearance-none rounded-full border-2 border-[#d2d2ff8c] checked:border-[#d2d2ff8c] transition-opacity'
						/>
						<span
							className={`pointer-events-none absolute bg-[#D2D2FF] w-[18px] h-[18px] rounded-full transition-opacity duration-150 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
								selectedMonth === '12' ? 'opacity-100' : 'opacity-0'
							}`}
						/>
					</label>
					<div>1 рік</div>
				</div>
			</form>
			<div className='flex-col gap-[36px] items-center justify-start w-full text-center font-bold hidden lg:flex'>
				<div className=''>Всі</div>
				<div className=''>Включений </div>
				<div className=''>Всі живі зустрічі, в рамках року</div>
				<div className=''>Необмежена кількість запитів</div>
				<div className=''>Безлім, на час підписки</div>
				<div className=''>Безлім, на час підписки</div>
				<div className=''>Безлім</div>
			</div>
			<div className='flex flex-col items-center justify-start mt-[22px] w-full px-5 text-center text-white lg:hidden'>
				<div className='mt-[8px] flex flex-col items-center w-full'>
					<div className='text-[13px] font-medium text-[#ffffff7c]'>Модулі</div>
					<div className='mt-[3px] mb-[11px] font-bold text-[13px]'>Всі</div>
					<div className=' h-px rounded-full w-full bg-[#FFFFFF1A]' />
				</div>
				<div className='mt-[8px] flex flex-col items-center w-full'>
					<div className='text-[13px] font-medium text-[#ffffff7c]'>
						Воркбук
					</div>
					<div className='mt-[3px] mb-[11px] font-bold text-[13px]'>
						Включений
					</div>
					<div className=' h-px rounded-full w-full bg-[#FFFFFF1A]' />
				</div>
				<div className='mt-[8px] flex flex-col items-center w-full'>
					<div className='text-[13px] font-medium text-[#ffffff7c]'>
						Воркшопи
					</div>
					<div className='mt-[3px] mb-[11px] font-bold text-[13px]'>
						Всі живі зустрічі, в рамках року
					</div>
					<div className=' h-px rounded-full w-full bg-[#FFFFFF1A]' />
				</div>
				<div className='mt-[8px] flex flex-col items-center w-full'>
					<div className='text-[13px] font-medium text-[#ffffff7c]'>
						Аі-агенти
					</div>
					<div className='mt-[3px] mb-[11px] font-bold text-[13px]'>
						Необмежена кількість запитів
					</div>
					<div className=' h-px rounded-full w-full bg-[#FFFFFF1A]' />
				</div>
				<div className='mt-[8px] flex flex-col items-center w-full'>
					<div className='text-[13px] font-medium text-[#ffffff7c]'>
						Скрінер
					</div>
					<div className='mt-[3px] mb-[11px] font-bold text-[13px]'>
						Безлім, на час підписки
					</div>
					<div className=' h-px rounded-full w-full bg-[#FFFFFF1A]' />
				</div>
				<div className='mt-[8px] flex flex-col items-center w-full'>
					<div className='text-[13px] font-medium text-[#ffffff7c]'>
						Авторські індекатори
					</div>
					<div className='mt-[3px] mb-[11px] font-bold text-[13px]'>
						Безлім, на час підписки
					</div>
					<div className=' h-px rounded-full w-full bg-[#FFFFFF1A]' />
				</div>
				<div className='mt-[8px] flex flex-col items-center w-full'>
					<div className='text-[13px] font-medium text-[#ffffff7c]'>Блог</div>
					<div className='mt-[3px] mb-[11px] font-bold text-[13px]'>Безлім</div>
					<div className=' h-px rounded-full w-full bg-[#FFFFFF1A]' />
				</div>
			</div>
			<button
				type='button'
				className='bg-[#6A56E4] rounded-full py-[19px] px-[39px] font-semibold mt-[36px]'
			>
				Придбати
			</button>
		</div>
	)
}

export default YearSubscriptions
