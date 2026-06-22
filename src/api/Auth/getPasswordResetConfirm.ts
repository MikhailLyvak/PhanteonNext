import axiosInterceptor from '../../interceptor/axiosClient'

import { PasswordResetConfirmResponse } from './types'

// GET /auth/api/password-reset-confirm/{uidb64}/{token}/
// Validates the emailed reset link on page load. uidb64/token come straight
// from the URL and are forwarded verbatim. 200 → link valid (show the form);
// 400/401 → link invalid or expired (the caller offers "request a new link").
export const confirmPasswordReset = async (
	uidb64: string,
	token: string
): Promise<PasswordResetConfirmResponse> => {
	const { data } = await axiosInterceptor.get<PasswordResetConfirmResponse>(
		`/auth/api/password-reset-confirm/${uidb64}/${token}/`
	)
	return data
}
