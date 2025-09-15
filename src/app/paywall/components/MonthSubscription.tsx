'use client'

import { useId, useState } from 'react'

const MonthSubscriptions = () => {
	const [selectedMonth, setSelectedMonth] = useState<'1' | '3'>('1')
	const nameId = useId()


	return (
		<div className='flex flex-col items-center justify-start bg-[#242433] rounded-[32px] pt-[30px] pb-[26px] flex-1 lg:border-none border-2 border-[#D2D2FF]'>
			<div className='lg:text-4xl font-bold mb-5 text-2xl'>€13.99/ міс.</div>
			<form className='flex items-start lg:gap-3 gap-6 mb-6'>
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
							checked={selectedMonth === '1'}
							onChange={() => setSelectedMonth('1')}
							className='peer h-[28px] w-[28px] cursor-pointer appearance-none rounded-full border-2 border-[#d2d2ff8c] checked:border-[#d2d2ff8c] transition-opacity'
						/>
						<span
							className={`pointer-events-none absolute bg-[#D2D2FF] w-[18px] h-[18px] rounded-full transition-opacity duration-150 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
								selectedMonth === '1' ? 'opacity-100' : 'opacity-0'
							}`}
						/>
					</label>
					<div>1 місяць</div>
				</div>
				<div className='flex gap-2.5 items-center'>
					<label
						className='relative flex items-center cursor-pointer justify-center'
						htmlFor='radio2'
					>
						<input
							id='radio2'
							name={`month-${nameId}`}
							type='radio'
							value='3'
							checked={selectedMonth === '3'}
							onChange={() => setSelectedMonth('3')}
							className='peer h-[28px] w-[28px] cursor-pointer appearance-none rounded-full border-2 border-[#d2d2ff8c] checked:border-[#d2d2ff8c] transition-opacity'
						/>
						<span
							className={`pointer-events-none absolute bg-[#D2D2FF] w-[18px] h-[18px] rounded-full transition-opacity duration-150 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
								selectedMonth === '3' ? 'opacity-100' : 'opacity-0'
							}`}
						/>
					</label>
					<div>3 місяці</div>
				</div>
			</form>
			<div className=' flex-col gap-[36px] items-center justify-start w-full text-center font-bold hidden lg:flex'>
				<div className=''>Всі</div>
				<div className=''>За додаткову оплату</div>
				<div className=' xl:text-sm text-[10px]'>
					В рамках місяця + запити попередніх зустрічей
				</div>
				<div className=''>Обмежена кількість запитів</div>
				<div className=''>Безлім, на час підписки</div>
				<div className=''>Безлім, на час підписки</div>
				<div className=''>Безлім, на час підписки</div>
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
						За додаткову оплату
					</div>
					<div className=' h-px rounded-full w-full bg-[#FFFFFF1A]' />
				</div>
				<div className='mt-[8px] flex flex-col items-center w-full'>
					<div className='text-[13px] font-medium text-[#ffffff7c]'>
						Воркшопи
					</div>
					<div className='mt-[3px] mb-[11px] font-bold text-[13px]'>
						В рамках місяця + запити попередніх зустрічей
					</div>
					<div className=' h-px rounded-full w-full bg-[#FFFFFF1A]' />
				</div>
				<div className='mt-[8px] flex flex-col items-center w-full'>
					<div className='text-[13px] font-medium text-[#ffffff7c]'>
						Аі-агенти
					</div>
					<div className='mt-[3px] mb-[11px] font-bold text-[13px]'>
						Обмежена кількість запитів
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
					<div className='mt-[3px] mb-[11px] font-bold text-[13px]'>
						Безлім, на час підписки
					</div>
					<div className=' h-px rounded-full w-full bg-[#FFFFFF1A]' />
				</div>
			</div>
			<button
				type='button'
				className='bg-[#6A56E4] rounded-full py-[19px] px-[39px] font-semibold mt-[36px] text-white'
			>
				Придбати
			</button>
		</div>
	)
}

export default MonthSubscriptions
