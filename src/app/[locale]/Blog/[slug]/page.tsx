import type { Metadata } from 'next'
import BlogDetail from './components/BlogDetails'
import { BlogDetail as BlogDetailsType } from '@/api/Blog/getBlogDetail'

async function getBlogForMeta(slug: string): Promise<BlogDetailsType | null> {
	try {
		const res = await fetch(`https://pantheonx.club/api/blog/${slug}`)

		if (!res.ok) {
			return null
		}

		const data = res.json()

		return data
	} catch {
		return null
	}
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>
}): Promise<Metadata> {
	const { slug } = await params
	const blog = await getBlogForMeta(slug)

	if (!blog) {
		return {
			title: 'Блог не знайдено',
			description: 'Ця стаття блогу не знайдена або була видалена.',
		}
	}

	const title = blog.title
	const description =
		blog.slug || blog.content_html.replace(/<[^>]+>/g, '').slice(0, 160)

	const url = `https://pantheonx.club/blog/${slug}`

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			url,
			type: 'article',
			images: blog.cover ? [{ url: blog.cover, alt: blog.title }] : undefined,
		},
		alternates: {
			canonical: url,
		},
	}
}
export default async function BlogDetailPage({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	return <BlogDetail slug={slug} />
}
