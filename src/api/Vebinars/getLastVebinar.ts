import { Cookies } from 'react-cookie';

import { Vebinar } from './types';
import axiosInterceptor from '@/interceptor/axiosClient';

export const getLastVebinar = async () => {
  const cookies = new Cookies();
  const token = cookies.get('local_access_token');
  const data = await axiosInterceptor.get('/api/vebinar/latest/', {
    headers: {
      Authorization: token,
    },
  });

  return data.data as Vebinar;
}