import { Cookies } from 'react-cookie';

import axiosInterceptor from '../../interceptor/axiosClient';

import { LoginResponse, UserLoginData } from './types';

export const login = async (loginData: UserLoginData) => {
  const data = await axiosInterceptor.post<LoginResponse>('/auth/api/login/', loginData, {});

  const cookies = new Cookies();
  cookies.remove('local_access_token');
  cookies.set('local_access_token', `Token ${data.data.token}`, { path: '/' });

  return data.data;
};
