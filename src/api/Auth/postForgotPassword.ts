import axiosInterceptor from '../../interceptor/axiosClient'

export interface ForgotPasswordPayload {
	email: string
}

// Frontend stub. Backend endpoint not implemented yet — when it is, point this
// at the real route (likely POST /auth/api/password-reset/) and remove the
// simulated success below.
export const requestPasswordReset = async (
	payload: ForgotPasswordPayload
): Promise<{ ok: true }> => {
	try {
		await axiosInterceptor.post('/auth/api/password-reset/', payload)
	} catch (error: any) {
		// 404 / network errors are expected until the backend ships. Swallow them
		// so the UX matches the eventual "we sent you a link if the email exists"
		// flow and we never disclose whether an email is registered.
		const status = error?.response?.status
		if (status && status !== 404 && status !== 405) {
			throw error
		}
	}
	return { ok: true }
}
