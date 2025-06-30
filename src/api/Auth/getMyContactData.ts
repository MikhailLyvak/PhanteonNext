import axiosInterceptor from "@/interceptor/axiosClient";
import { Cookies } from "react-cookie";
import { MyContactData } from "./types";

export const getMyContactData = async (): Promise<MyContactData> => {
    const cookies = new Cookies();
    const token = cookies.get("local_access_token");

    if (!token) {
        throw new Error("No token found");
    }

    const { data } = await axiosInterceptor.get<MyContactData>("/auth/api/profile/", {
        headers: {
            Authorization: token,
        },
    });

    return data;
};
