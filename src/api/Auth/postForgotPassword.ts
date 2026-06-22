import axiosInterceptor from '../../interceptor/axiosClient'

export interface ForgotPasswordPayload {
	email: string
}

// POST /auth/api/password-reset/ — the backend emails a reset link via Resend.
// Anti-enumeration: we never disclose whether an email is registered, so a 400
// { error: "User not found" } is treated exactly like a 200 and the UI always
// shows the same "check your email" screen. Only genuine failures (network /
// 5xx) propagate so the form can surface a real error.
export const requestPasswordReset = async (
	payload: ForgotPasswordPayload
): Promise<{ ok: true }> => {
	try {
		await axiosInterceptor.post('/auth/api/password-reset/', payload)
	} catch (error: any) {
		const status = error?.response?.status
		// 400 (user not found / invalid email) and 404/405 (route variations) are
		// swallowed to avoid leaking account existence; anything else is real.
		if (status && ![400, 404, 405].includes(status)) {
			throw error
		}
	}
	return { ok: true }
}
