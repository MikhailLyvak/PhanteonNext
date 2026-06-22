import axiosInterceptor from "@/interceptor/axiosClient";

import { ChangePasswordPayload } from "./types";

export const postChangePassword = async (data: ChangePasswordPayload) => {
  const response = await axiosInterceptor.post(
    "/auth/api/change-password/",
    data
  );
  return response.data;
};
