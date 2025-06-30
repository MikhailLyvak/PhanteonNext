import axiosInterceptor from "@/interceptor/axiosClient";

import { Cookies } from "react-cookie";
import { ProfileData } from "./types";
import { ProfileUpdateData } from "./types";

export const putMyContactData = async (data: ProfileUpdateData): Promise<ProfileData> => {
  const cookies = new Cookies();
  const token = cookies.get('local_access_token');

  const response = await axiosInterceptor.put(
    '/auth/api/profile/',
    data,
    {
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
}
