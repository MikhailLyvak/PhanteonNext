import { useState, useCallback } from 'react'
import axiosInterceptor from '@/interceptor/axiosClient'

export interface ChatResponse {
	response: string
	thread_id: string
	status?: string
	search_count?: number
}

export interface UseChatAgentReturn {
	sendMessage: (message: string) => Promise<ChatResponse>
	isLoading: boolean
	resetChat: () => void
	isLimited: boolean
}

const useChatAgent = (): UseChatAgentReturn => {
	const [isLoading, setIsLoading] = useState(false)
	const [threadId, setThreadId] = useState<string | null>(null)
	const [isLimited, setIsLimited] = useState(false)

	const sendMessage = useCallback(
		async (message: string): Promise<ChatResponse> => {
			if (isLimited) {
				throw new Error('Daily limit reached')
			}
			setIsLoading(true)
			try {
				const resp = await axiosInterceptor.post('/auth/api/ai/chat/', {
					message,
					thread_id: threadId,
				})
				const data = resp.data as ChatResponse
				if (data?.thread_id) setThreadId(data.thread_id)
				return data
			} catch (err: any) {
				if (err?.response?.status === 429) {
					setIsLimited(true)
				}
				throw err
			} finally {
				setIsLoading(false)
			}
		},
		[threadId, isLimited]
	)

	const resetChat = () => setThreadId(null)

	return { sendMessage, isLoading, resetChat, isLimited }
}

export default useChatAgent
