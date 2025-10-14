'use client'

import axios, { InternalAxiosRequestConfig } from 'axios'
import { Cookies } from 'react-cookie'

const axiosInterceptor = axios.create({
	baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json',
	},
})

axiosInterceptor.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		// Skip token for login and register endpoints
		const isAuthEndpoint =
			config.url?.includes('/auth/api/login/') ||
			config.url?.includes('/auth/api/register/')

		if (!isAuthEndpoint) {
			const cookies = new Cookies()
			const token = cookies.get('local_access_token')

			if (token && !config.headers.Authorization) {
				config.headers.Authorization = token
			}
		}

		return config
	}
)

// Add response interceptor for better error handling
let isLoggingOut = false
const LOGIN_PATH = '/login'
const REDIRECT_GUARD_KEY = 'auth:redirected'
const REDIRECT_TTL_MS = 5000

axiosInterceptor.interceptors.response.use(
	response => {
		//console.log('Response received:', response)
		return response
	},
	async error => {
		console.error('Axios error:', error)

		const status = error?.response?.status
		const url = error?.config?.url ?? ''

		if (status === 401) {
			const isAuthEndpoint =
				url.includes('/auth/api/login/') || url.includes('/auth/api/register/')

			if (!isAuthEndpoint && !isLoggingOut) {
				const onLoginPage =
					typeof window !== 'undefined' &&
					window.location.pathname.startsWith(LOGIN_PATH)

				if (!onLoginPage) {
					let alreadyRedirected = false
					if (typeof window !== 'undefined') {
						const stamp = Number(
							sessionStorage.getItem(REDIRECT_GUARD_KEY) || '0'
						)
						const fresh = Date.now() - stamp < REDIRECT_TTL_MS
						alreadyRedirected = fresh
					}

					if (!alreadyRedirected) {
						isLoggingOut = true
						try {
							const cookies = new Cookies()
							cookies.remove('local_access_token', { path: '/' })
							console.log('remove local storage')

							localStorage.removeItem('user-store')
						} finally {
							if (typeof window !== 'undefined') {
								sessionStorage.setItem(REDIRECT_GUARD_KEY, String(Date.now()))
								window.location.assign(`${LOGIN_PATH}`)
							}
						}
					}
				}
			}
		} else {
			if (error.response) {
				console.error('Error response data:', error.response.data)
				console.error('Error response status:', error.response.status)
				console.error('Error response headers:', error.response.headers)
			} else if (error.request) {
				console.error('Error request:', error.request)
			} else {
				console.error('Error message:', error.message)
			}
		}

		return Promise.reject(error)
	}
)

export default axiosInterceptor
