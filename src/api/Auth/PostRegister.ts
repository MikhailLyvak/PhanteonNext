import { Cookies } from 'react-cookie';

import axiosInterceptor from '../../interceptor/axiosClient';

import { RegisterResponse, UserLoginData } from './types';

export const register = async (registerData: UserLoginData) => {
  const data = await axiosInterceptor.post<RegisterResponse>('/auth/api/register/', registerData, {});

  const cookies = new Cookies();
  cookies.remove('local_access_token');
  cookies.set('local_access_token', `Token ${data.data.token}`);

  return data.data;
};