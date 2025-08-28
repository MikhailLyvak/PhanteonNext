import { useState, useCallback } from 'react'

const useChatAgent = () => {
	const [isLoading, setIsLoading] = useState(false)
	const [threadId, setThreadId] = useState(null)

	const sendMessage = useCallback(
		async (message: string) => {
			setIsLoading(true)
			console.log(process.env.NEXT_PUBLIC_API_URL)

			try {
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/chat`,
					{
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							message,
							thread_id: threadId,
						}),
					}
				)

				if (!response.ok) throw new Error(`HTTP ${response.status}`)

				const data = await response.json()
				setThreadId(data.thread_id)
				return data
			} catch (error) {
				console.error('Chat error:', error)
				throw error
			} finally {
				setIsLoading(false)
			}
		},
		[threadId]
	)

	const resetChat = () => setThreadId(null)

	return { sendMessage, isLoading, resetChat }
}

export default useChatAgent
