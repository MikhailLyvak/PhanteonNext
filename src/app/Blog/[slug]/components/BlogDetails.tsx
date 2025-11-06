'use client'

import { useGetBlogDetail } from '@/hooks/Blog/useGetBlogDetail'
import BlogComments from './BlogComments'

type Props = {
	slug: string
}

export default function BlogDetail({ slug }: Props) {
	const { data, refetch } = useGetBlogDetail(slug)

	if (!data) {
		return (
			<div className='max-w-3xl mx-auto px-4 py-10 text-white'>
				Завантаження...
			</div>
		)
	}
	return (
		<div className='max-w-3xl mx-auto px-4 py-10 text-white'>
			<h1 className='text-3xl font-bold mb-4'>{data.title}</h1>

			{data.cover && (
				// eslint-disable-next-line @next/next/no-img-element
				<img
					src={data.cover}
					alt={data.title}
					className='w-full rounded-xl mb-6'
				/>
			)}

			<article
				className='prose prose-invert max-w-none 
          prose-ul:list-disc prose-ol:list-decimal prose-li:marker:text-gray-400'
				dangerouslySetInnerHTML={{ __html: data.content_html }}
			/>

			<BlogComments blog={data} onRefresh={refetch} />
		</div>
	)
}
