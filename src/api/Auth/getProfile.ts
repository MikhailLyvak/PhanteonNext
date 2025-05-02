"use client";

import { Cookies } from "react-cookie";
import { User } from "./types";
import axiosInterceptor from "@/interceptor/axiosClient";

export const getProfile = async (): Promise<User> => {
  const cookies = new Cookies();
  const token = cookies.get("local_access_token");

  if (!token) {
    throw new Error("No token found");
  }

  const { data } = await axiosInterceptor.get<User>("/auth/api/me/", {
    headers: {
      Authorization: token,
    },
  });

  return data;
};
