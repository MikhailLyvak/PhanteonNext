import { Cookies } from 'react-cookie';

import { Quiz } from './types';
import axiosInterceptor from '@/interceptor/axiosClient';

export const getQuizeDetail = async (id: string) => {
  const cookies = new Cookies();
  const token = cookies.get('local_access_token');
  const data = await axiosInterceptor.get(`/api/quiz/${id}/`, {
    headers: {
      Authorization: token,
    },
  });

  return data.data as Quiz;
}

