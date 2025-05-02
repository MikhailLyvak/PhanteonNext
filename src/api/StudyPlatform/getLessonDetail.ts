import { Cookies } from 'react-cookie';

import { LessonDetail } from './types';
import axiosInterceptor from '@/interceptor/axiosClient';

export const getLessonDetail = async (id: string) => {
  const cookies = new Cookies();
  const token = cookies.get('local_access_token');
  const data = await axiosInterceptor.get(`/api/lesson_detail/${id}/`, {
    headers: {
      Authorization: token,
    },
  });

  return data.data as LessonDetail;
}

