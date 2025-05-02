import axios, { InternalAxiosRequestConfig } from 'axios';

const axiosInterceptor = axios.create({
	baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json',
	},
});

axiosInterceptor.interceptors.request.use((config: InternalAxiosRequestConfig) => {
	return config;
});

export default axiosInterceptor;
