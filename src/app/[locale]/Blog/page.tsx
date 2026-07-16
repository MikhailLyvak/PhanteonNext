'use client'
import Link from 'next/link'
import { useGetBlogs } from '@/hooks/Blog/useGetBlogs'
import { useUserStore } from '@/store/UserData/useUserStore'

export default function BlogListPage() {
	const { data, isLoading } = useGetBlogs()
	const user = useUserStore(state => state.user)

	return (
		<div className='max-w-6xl mx-auto px-4 py-10 text-white'>
			<h1 className='text-3xl font-bold mb-6'>Блог</h1>
			{isLoading && <div>Завантаження...</div>}
			<div className='grid gap-6 md:grid-cols-2'>
				{data?.map(post => (
					<Link
						key={post.id}
						href={user ? `/Blog/${post.slug}` : '/login'}
						className='bg-[#242433] rounded-lg overflow-hidden hover:ring-2 ring-[#58587B] transition'
					>
						{post.cover && (
							<div className='relative w-full h-56'>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={post.cover}
									alt={post.title}
									className='w-full h-full object-cover'
								/>
							</div>
						)}
						<div className='p-4'>
							<div className='text-xl font-semibold mb-2'>{post.title}</div>
							<div className='text-sm text-[#9ea0c7]'>
								{new Date(post.created_at).toLocaleDateString('uk-UA')}
							</div>
							<div className='mt-3 flex gap-4 text-lg'>
								<span>👍 {post.reactions['👍']}</span>
								<span>👎 {post.reactions['👎']}</span>
								<span>♥ {post.reactions['♥']}</span>
							</div>
						</div>
					</Link>
				))}
			</div>
		</div>
	)
}
