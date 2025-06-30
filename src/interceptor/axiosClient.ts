import axios, { InternalAxiosRequestConfig } from 'axios';
import { Cookies } from 'react-cookie';

const axiosInterceptor = axios.create({
	baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json',
	},
});

axiosInterceptor.interceptors.request.use((config: InternalAxiosRequestConfig) => {
	// Skip token for login and register endpoints
	const isAuthEndpoint = config.url?.includes('/auth/api/login/') || config.url?.includes('/auth/api/register/');
	
	if (!isAuthEndpoint) {
		const cookies = new Cookies();
		const token = cookies.get('local_access_token');
		
		if (token && !config.headers.Authorization) {
			config.headers.Authorization = token;
		}
	}
	
	return config;
});

export default axiosInterceptor;
