'use client'
import useChatAgent from '@/hooks/AIAgent/useChatAgent'
import { ArrowUpRight, Loader, Send, Trash, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'
import MyCabinetBreadCrump from '../myCabinet/studyPlatform/components/BreadCrump'
import ConfirmDeleteChat from './components/ConfirmDeleteChat'

interface Message {
	text: string
	date: string // ISO string
	sender: 'user' | 'agent' | 'error'
}

// Custom components for markdown rendering
const markdownComponents = {
	code: ({ node, inline, className, children, ...props }: any) => {
		const match = /language-(\w+)/.exec(className || '')
		return !inline && match ? (
			<pre className='bg-gray-900 border border-gray-700 rounded-lg p-4 overflow-x-auto'>
				<code className={className} {...props}>
					{children}
				</code>
			</pre>
		) : (
			<code
				className='bg-gray-800 text-blue-300 px-1 py-0.5 rounded text-sm'
				{...props}
			>
				{children}
			</code>
		)
	},
	blockquote: ({ children }: any) => (
		<blockquote className='border-l-4 border-gray-600 bg-gray-800 rounded-lg px-4 py-2 text-gray-300'>
			{children}
		</blockquote>
	),
	table: ({ children }: any) => (
		<div className='overflow-x-auto'>
			<table className='min-w-full border-collapse border border-gray-700'>
				{children}
			</table>
		</div>
	),
	th: ({ children }: any) => (
		<th className='border border-gray-700 bg-gray-800 px-4 py-2 text-left text-white font-semibold'>
			{children}
		</th>
	),
	td: ({ children }: any) => (
		<td className='border border-gray-700 px-4 py-2 text-white'>{children}</td>
	),
}

export default function AIPage() {
	const [message, setMessage] = useState('')
	const [conversation, setConversation] = useState<Message[]>([])
	const { sendMessage, isLoading, resetChat } = useChatAgent()
	const [isConversationLoaded, setIsConversationLoaded] = useState(false)
	const messagesEndRef = useRef<HTMLDivElement>(null)
	const inputRef = useRef<HTMLDivElement>(null)
	const [isConfirmOpen, setConfirmOpen] = useState(false)

	const handleDeleteClick = () => {
		setConfirmOpen(true)
	}

	const handleConfirm = () => {
		resetChat()
		setConversation([])
		localStorage.removeItem('ai_conversation')
		setConfirmOpen(false)
	}

	const handleCancel = () => {
		setConfirmOpen(false)
	}

	useEffect(() => {
		const stored = localStorage.getItem('ai_conversation')
		if (stored) {
			try {
				setConversation(JSON.parse(stored))
			} catch {
				setConversation([
					{
						sender: 'agent',
						text: 'Привіт! Як я можу допомогти вам сьогодні у світі криптовалют та фінансової грамотності?',
						date: new Date().toISOString(),
					},
				])
				localStorage.removeItem('ai_conversation')
			}
		}
		setIsConversationLoaded(true)
	}, [])

	useEffect(() => {
		if (isConversationLoaded) {
			localStorage.setItem('ai_conversation', JSON.stringify(conversation))
		}
		if (isConversationLoaded && conversation.length === 0) {
			setConversation([
				{
					sender: 'agent',
					text: 'Привіт! Як я можу допомогти вам сьогодні у світі криптовалют та фінансової грамотності?',
					date: new Date().toISOString(),
				},
			])
		}
		if (messagesEndRef.current && inputRef.current) {
			messagesEndRef.current.scrollIntoView({
				behavior: 'auto',
				block: 'end',
			})
			inputRef.current.scrollIntoView({
				behavior: 'smooth',
				block: 'end',
			})
		}
	}, [conversation, isConversationLoaded])

	const handleSubmit = async (e: Event) => {
		e.preventDefault()
		if (!message.trim()) return
		if (isLoading) return

		const userMessage = {
			sender: 'user',
			text: message,
			date: new Date().toISOString(),
		} as Message
		setConversation(prev => [...prev, userMessage])
		setMessage('')

		try {
			const response = await sendMessage(message)

			const agentMessage = {
				sender: 'agent',
				text: response.response,
				date: new Date().toISOString(),
			} as Message
			setConversation(prev => [...prev, agentMessage])
		} catch (error) {
			const errorMessage = {
				sender: 'error',
				text: 'Виникла неочікувана помилка, спробуйте будь ласка ще раз',
				date: new Date().toISOString(),
			} as Message
			setConversation(prev => [...prev, errorMessage])
		}
	}

	return (
		<div
			style={{ minHeight: 'calc(100vh - 361px)' }}
			className='max-md:!min-h-screen flex flex-col max-w-6xl mx-auto px-4 text-white'
		>
			<div className='mt-6'>
				<MyCabinetBreadCrump currentPageTitle='Theon' />
			</div>
			<div className='flex flex-col flex-1'>
				{conversation.length < 2 ? (
					<div className='mx-auto lg:mt-[200px] mt-[100px]'>
						<div className='text-5xl font-extrabold text-center'>Theon</div>
						<p className='text-center mt-2.5 mb-10'>
							Привіт! Як я можу допомогти вам сьогодні у світі криптовалют та
							фінансової грамотності?
						</p>
					</div>
				) : (
					<div
						className='max-md:!min-h-screen p-6 flex-1 overflow-y-auto scrollbar-hide'
						style={{ maxHeight: 'calc(100vh - 576px)', scrollbarWidth: 'none' }}
					>
						{conversation
							.sort(
								(a, b) =>
									new Date(a.date).getTime() - new Date(b.date).getTime()
							)
							.map((msg, index) => (
								<div
									key={index}
									className={`mb-4 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}
								>
									<div
										className={`inline-block max-w-[80%] rounded-2xl ${msg.sender === 'user' ? 'bg-[#FFFFFF0D] text-white p-3' : msg.sender === 'agent' ? 'bg-transparent text-white' : 'bg-red-600 text-white p-3'}`}
									>
										{msg.sender === 'agent' ? (
											<div
												className='prose prose-invert prose-sm max-w-none 
											prose-headings:text-white prose-headings:font-semibold
											prose-p:text-white prose-p:leading-relaxed
											prose-strong:text-white prose-strong:font-semibold
											prose-em:text-gray-300 prose-em:italic
											prose-ul:text-white prose-ol:text-white prose-li:text-white
											prose-a:text-blue-400 prose-a:underline prose-a:decoration-blue-400 prose-a:underline-offset-2
											prose-hr:border-gray-600'
											>
												<ReactMarkdown
													remarkPlugins={[remarkGfm]}
													rehypePlugins={[rehypeHighlight]}
													components={markdownComponents}
												>
													{msg.text}
												</ReactMarkdown>
											</div>
										) : (
											msg.text
										)}
									</div>
								</div>
							))}
						<div ref={messagesEndRef} />
					</div>
				)}

				<form
					className='flex gap-[15px]'
					onSubmit={handleSubmit as unknown as (e: React.FormEvent) => void}
				>
					<div className='flex gap-4 justify-between bg-[#77777733] border border-[#FFFFFF0F]  w-full rounded-full text-white placeholder-white'>
						<input
							type='text'
							name='message'
							placeholder='Запитайте будь що'
							autoComplete='off'
							value={message}
							onChange={e => setMessage(e.target.value)}
							className='bg-transparent rounded-full p-4 w-full focus:outline-none'
						/>
						<button
							type='submit'
							disabled={isLoading}
							className='bg-[#6A56E4] text-white p-2.5 rounded-full text-base font-semibold hover:bg-[#5848c2] transition disabled:opacity-50 disabled:cursor-not-allowed m-3'
						>
							{isLoading ? (
								<Loader className='animate-spin' />
							) : (
								<ArrowUpRight size={20} />
							)}
						</button>
					</div>
					{conversation.length > 2 && (
						<div className='relative inline-block group self-center'>
							<button
								type='button'
								onClick={handleDeleteClick}
								className='h-11 w-11 text-[#D2D2FF] flex items-center justify-center  transition bg-[#77777733] p-3 border border-[#FFFFFF0F] rounded-full'
							>
								<Trash2 size={16} />
							</button>
							<div
								role='tooltip'
								className='pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 -translate-y-full
                   whitespace-nowrap rounded-lg bg-[#1f1f2b] text-white/95 text-sm font-medium
                   px-3 py-1 shadow-lg border border-white/10
                   opacity-0 scale-95 transition-all duration-150
                   group-hover:opacity-100 group-hover:scale-100
                   group-focus-within:opacity-100 group-focus-within:scale-100'
							>
								Видалити чат
								{/* Arrow */}
								<span
									className='absolute left-1/2 top-full -translate-x-1/2
                     h-2 w-2 rotate-45 bg-[#1f1f2b] border-r border-b border-white/10'
								/>
							</div>
						</div>
					)}
				</form>
				<div ref={inputRef} />
			</div>
			<ConfirmDeleteChat
				isOpen={isConfirmOpen}
				onConfirm={handleConfirm}
				onCancel={handleCancel}
			/>
		</div>
	)
}
