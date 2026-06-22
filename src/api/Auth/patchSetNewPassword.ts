import axiosInterceptor from '../../interceptor/axiosClient'

import { SetNewPasswordPayload } from './types'

// PATCH /auth/api/set-new-password/ — body { password, uidb64, token }.
// 200 → { message: "Password reset successful" }; 400 → field/form errors.
export const setNewPassword = async (payload: SetNewPasswordPayload) => {
	const { data } = await axiosInterceptor.patch(
		'/auth/api/set-new-password/',
		payload
	)
	return data
}
