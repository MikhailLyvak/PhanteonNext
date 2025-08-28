'use client'
import useChatAgent from '@/hooks/AIAgent/useChatAgent'
import { Send, Trash } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface Message {
	text: string
	date: string // ISO string
	sender: 'user' | 'agent' | 'error'
}

export default function AIPage() {
	const [message, setMessage] = useState('')
	const [conversation, setConversation] = useState<Message[]>([])
	const { sendMessage, isLoading, resetChat } = useChatAgent()
	const [isConversationLoaded, setIsConversationLoaded] = useState(false)
	const messagesEndRef = useRef<HTMLDivElement>(null)
	const inputRef = useRef<HTMLDivElement>(null)

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
				text: 'Sorry, something went wrong. Please try again.',
				date: new Date().toISOString(),
			} as Message
			setConversation(prev => [...prev, errorMessage])
		}
	}

	return (
		<div
			style={{ minHeight: 'calc(100vh - 361px)' }}
			className='max-md:!min-h-screen flex flex-col max-w-6xl mx-auto px-4 py-10 text-white'
		>
			<div className='w-full flex justify-between items-center mb-6'>
				<h1 className='text-3xl font-bold'>AI Агент</h1>
				<button
					onClick={() => {
						resetChat()
						setConversation([])
						localStorage.removeItem('ai_conversation')
					}}
					className='bg-red-600 text-white px-4 py-2 rounded-3xl text-base font-semibold h-fit self-center hover:bg-red-700 transition'
				>
					<Trash />
				</button>
			</div>
			<div className='flex flex-col flex-1 rounded-xl bg-[#242433]'>
				<div
					className='max-md:!min-h-screen p-6 flex-1 overflow-y-auto scrollbar-hide'
					style={{ maxHeight: 'calc(100vh - 576px)', scrollbarWidth: 'none' }}
				>
					{conversation
						.sort(
							(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
						)
						.map((msg, index) => (
							<div
								key={index}
								className={`mb-4 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}
							>
								<div
									className={`inline-block max-w-[80%] p-3 rounded-lg ${msg.sender === 'user' ? 'bg-[#1f1f30] text-white' : msg.sender === 'agent' ? 'bg-gray-700 text-white' : 'bg-red-600 text-white'}`}
								>
									{msg.text}
								</div>
								<div className='text-xs text-gray-400 mt-1'>
									{new Date(msg.date).toLocaleTimeString()}
								</div>
							</div>
						))}
					<div ref={messagesEndRef} />
				</div>

				<form
					className='p-4 border-t border-gray-600  '
					onSubmit={handleSubmit as unknown as (e: React.FormEvent) => void}
				>
					<div className='flex gap-4 justify-between bg-[#171723] border border-gray-600 w-full rounded-full text-[#D2D2FF] placeholder-[#58587B]'>
						<input
							type='text'
							name='message'
							placeholder='Type your message...'
							value={message}
							onChange={e => setMessage(e.target.value)}
							className='bg-[#171723] rounded-full p-4 w-full focus:outline-none'
						/>
						<button
							type='submit'
							disabled={isLoading}
							className='bg-[#6A56E4] text-white p-4 rounded-full text-base font-semibold hover:bg-[#5848c2] transition disabled:opacity-50 disabled:cursor-not-allowed'
						>
							<Send />
						</button>
					</div>
				</form>
				<div ref={inputRef} />
			</div>
		</div>
	)
}
