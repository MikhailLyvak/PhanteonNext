'use client'
import { useParams } from 'next/navigation'
import { useGetBlogDetail } from '@/hooks/Blog/useGetBlogDetail'
import { useUserStore } from '@/store/UserData/useUserStore'
import { useAuthModalStore } from '@/store/AuthModal/useAuthModalStore'
import axiosClient from '@/interceptor/axiosClient'
import { useState } from 'react'

const allowed = ['👍','👎','♥'] as const

export default function BlogDetailPage() {
  const params = useParams<{ slug: string }>()
  const slug = params?.slug
  const { data, refetch } = useGetBlogDetail(slug)
  const user = useUserStore(s => s.user)
  const { toggleModal } = useAuthModalStore()
  const [comment, setComment] = useState('')

  const requireAuth = () => {
    if (!user) {
      toggleModal()
      return false
    }
    return true
  }

  const submitComment = async () => {
    if (!requireAuth() || !comment.trim()) return
    await axiosClient.post(`/api/blog/${slug}/comments/`, { content: comment })
    setComment('')
    refetch()
  }

  const react = async (emoji: string) => {
    if (!requireAuth()) return
    await axiosClient.post(`/api/blog/${slug}/reaction/`, { emoji })
    refetch()
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-white">
      {data && (
        <>
          <h1 className="text-3xl font-bold mb-4">{data.title}</h1>
          {data.cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.cover} alt={data.title} className="w-full rounded-xl mb-6" />
          )}
          <article
            className="prose prose-invert max-w-none 
            prose-ul:list-disc prose-ol:list-decimal prose-li:marker:text-gray-400"
            dangerouslySetInnerHTML={{ __html: data.content_html }}
          />
          <div className="mt-6 flex gap-4 text-xl">
            {allowed.map(e => (
              <button key={e} onClick={() => react(e)} className="bg-[#242433] px-4 py-2 rounded-lg">{e} {data.reactions[e as keyof typeof data.reactions]}</button>
            ))}
          </div>
          <section className="mt-10">
            <h2 className="text-2xl font-semibold mb-3">Коментарі</h2>
            <div className="space-y-3">
              {data.comments.map(c => (
                <div key={c.id} className="bg-[#242433] rounded-lg p-3">
                  <div className="text-sm text-[#9ea0c7]">{c.user_name} • {new Date(c.created_at).toLocaleString('uk-UA')}</div>
                  <div className="mt-1">{c.content}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <input value={comment} onChange={e=>setComment(e.target.value)} placeholder="Ваш коментар..." className="flex-1 bg-[#242433] rounded-lg px-3 py-2 outline-none" />
              <button onClick={submitComment} className="bg-[#5b5bd6] px-4 py-2 rounded-lg">Надіслати</button>
            </div>
          </section>
        </>
      )}
    </div>
  )
}


