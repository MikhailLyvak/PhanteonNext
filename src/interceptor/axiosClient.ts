'use client'

import axios, { InternalAxiosRequestConfig } from 'axios';
import { Cookies } from 'react-cookie';

const axiosInterceptor = axios.create({
	baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000',
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

// Add response interceptor for better error handling
axiosInterceptor.interceptors.response.use(
	(response) => {
		console.log('Response received:', response);
		return response;
	},
	(error) => {
		console.error('Axios error:', error);
		if (error.response) {
			console.error('Error response data:', error.response.data);
			console.error('Error response status:', error.response.status);
			console.error('Error response headers:', error.response.headers);
		} else if (error.request) {
			console.error('Error request:', error.request);
		} else {
			console.error('Error message:', error.message);
		}
		return Promise.reject(error);
	}
);

export default axiosInterceptor;
