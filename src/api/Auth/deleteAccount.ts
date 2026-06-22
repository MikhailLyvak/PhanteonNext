import axiosInterceptor from "@/interceptor/axiosClient";

import { DeleteAccountData } from "./types";

export const deleteAccount = async (data: DeleteAccountData) => {
  // DELETE with a body — password confirmation is sent via the request config
  // (the backend reads request.data).
  const response = await axiosInterceptor.delete("/auth/api/delete-account/", {
    data,
  });
  return response.data;
};
