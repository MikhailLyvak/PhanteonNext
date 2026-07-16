'use client'
import { BlogDetail } from '@/api/Blog/getBlogDetail'
import axiosClient from '@/interceptor/axiosClient'
import { useAuthModalStore } from '@/store/AuthModal/useAuthModalStore'
import { useUserStore } from '@/store/UserData/useUserStore'
import { useState } from 'react'
import { useCustomTranslations } from '@/lib/contexts/translations/translations-context'
import { TKeys } from '@/i18n/t-keys'

const allowed = ['👍', '👎', '♥'] as const

interface BlogCommentsProps {
	blog: BlogDetail
	onRefresh: VoidFunction
}

const BlogComments = ({ blog, onRefresh }: BlogCommentsProps) => {
	const user = useUserStore(s => s.user)
	const { toggleModal } = useAuthModalStore()
	const [comment, setComment] = useState('')
	const { t } = useCustomTranslations(TKeys.blog)

	const requireAuth = () => {
		if (!user) {
			toggleModal()
			return false
		}
		return true
	}
	const submitComment = async () => {
		if (!requireAuth() || !comment.trim()) return
		await axiosClient.post(`/api/blog/${blog.slug}/comments/`, {
			content: comment,
		})
		setComment('')
		onRefresh()
	}

	const react = async (emoji: string) => {
		if (!requireAuth()) return
		await axiosClient.post(`/api/blog/${blog.slug}/reaction/`, { emoji })
		onRefresh()
	}
	return (
		<section className='mt-10'>
			<div className=' flex gap-4 text-xl mb-10'>
				{allowed.map(e => (
					<button
						key={e}
						onClick={() => react(e)}
						className='bg-[#242433] px-4 py-2 rounded-lg'
					>
						{e} {blog.reactions[e as keyof typeof blog.reactions]}
					</button>
				))}
			</div>
			<h2 className='text-2xl font-semibold mb-3'>{t.commentsTitle}</h2>
			<div className='space-y-3'>
				{blog.comments.map(c => (
					<div key={c.id} className='bg-[#242433] rounded-lg p-3'>
						<div className='text-sm text-[#9ea0c7]'>
							{c.user_name} • {new Date(c.created_at).toLocaleString('uk-UA')}
						</div>
						<div className='mt-1'>{c.content}</div>
					</div>
				))}
			</div>
			<div className='mt-4 flex gap-2'>
				<input
					value={comment}
					onChange={e => setComment(e.target.value)}
					placeholder={t.commentPlaceholder}
					className='flex-1 bg-[#242433] rounded-lg px-3 py-2 outline-none'
				/>
				<button
					onClick={submitComment}
					className='bg-[#5b5bd6] px-4 py-2 rounded-lg'
				>
					{t.send}
				</button>
			</div>
		</section>
	)
}

export default BlogComments
