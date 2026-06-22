import Link from 'next/link'

export default function NotFound() {
	return (
		<div className='w-full flex-1 flex items-center justify-center px-4 py-16'>
			<div className='max-w-xl w-full text-center bg-[#242433] rounded-2xl p-8 sm:p-12'>
				<p className='text-[#6A56E4] text-7xl sm:text-8xl font-extrabold leading-none'>
					404
				</p>
				<h1 className='mt-6 text-2xl sm:text-3xl font-bold text-[#D2D2FF]'>
					Сторінку не знайдено
				</h1>
				<p className='mt-4 text-sm sm:text-base text-[#98A0B3] leading-relaxed'>
					Можливо, посилання застаріло або сторінку перенесено. Перевірте адресу
					або поверніться на головну.
				</p>
				<div className='mt-8 flex flex-col sm:flex-row justify-center gap-3'>
					<Link
						href='/'
						className='bg-[#6A56E4] text-white px-6 py-3 rounded-3xl hover:shadow-xl transition'
					>
						На головну
					</Link>
					<Link
						href='/myCabinet/personalData'
						className='border border-[#58587B] text-[#D2D2FF] px-6 py-3 rounded-3xl hover:bg-[#2F2F40] transition'
					>
						Особистий кабінет
					</Link>
				</div>
			</div>
		</div>
	)
}
