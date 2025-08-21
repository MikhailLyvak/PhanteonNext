import { Cookies } from 'react-cookie';

import axiosInterceptor from '../../interceptor/axiosClient';

import { RegisterResponse, UserLoginData } from './types';

export const register = async (registerData: UserLoginData) => {
  console.log('Sending registration request with data:', registerData);
  console.log('Request URL:', '/auth/api/register/');
  
  try {
    const data = await axiosInterceptor.post<RegisterResponse>('/auth/api/register/', registerData, {});
    console.log('Registration response:', data);
    
    const cookies = new Cookies();
    cookies.remove('local_access_token');
    cookies.set('local_access_token', `Token ${data.data.token}`);

    return data.data;
  } catch (error: any) {
    console.error('Registration error:', error);
    console.error('Error response:', error.response);
    throw error;
  }
};