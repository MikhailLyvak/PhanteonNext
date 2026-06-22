import axiosInterceptor from "@/interceptor/axiosClient";

import { ChangeLoginData } from "./types";

export const postChangeLogin = async (data: ChangeLoginData) => {
  const response = await axiosInterceptor.post(
    "/auth/api/change-login/",
    data
  );
  return response.data;
};
