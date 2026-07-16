import { getCustomTranslations } from '@/lib/contexts/translations/translations-server'
import { TKeys } from '@/i18n/t-keys'
import { Link } from '@/i18n/navigation'

export default async function NotFound() {
	const { t } = await getCustomTranslations(TKeys.notFound)
	return (
		<div className='w-full flex-1 flex items-center justify-center px-4 py-16'>
			<div className='max-w-xl w-full text-center bg-[#242433] rounded-2xl p-8 sm:p-12'>
				<p className='text-[#6A56E4] text-7xl sm:text-8xl font-extrabold leading-none'>
					404
				</p>
				<h1 className='mt-6 text-2xl sm:text-3xl font-bold text-[#D2D2FF]'>
					{t.title}
				</h1>
				<p className='mt-4 text-sm sm:text-base text-[#98A0B3] leading-relaxed'>
					{t.description}
				</p>
				<div className='mt-8 flex flex-col sm:flex-row justify-center gap-3'>
					<Link
						href='/'
						className='bg-[#6A56E4] text-white px-6 py-3 rounded-3xl hover:shadow-xl transition'
					>
						{t.goHome}
					</Link>
					<Link
						href='/myCabinet/personalData'
						className='border border-[#58587B] text-[#D2D2FF] px-6 py-3 rounded-3xl hover:bg-[#2F2F40] transition'
					>
						{t.myAccount}
					</Link>
				</div>
			</div>
		</div>
	)
}
