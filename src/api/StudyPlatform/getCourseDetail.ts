import { Cookies } from 'react-cookie';

import { CourseDetail } from './types';
import axiosInterceptor from '@/interceptor/axiosClient';

export const getCourseDetail = async (id: string) => {
  const cookies = new Cookies();
  const token = cookies.get('local_access_token');
  const data = await axiosInterceptor.get(`/api/courses/${id}`, {
    headers: {
      Authorization: token,
    },
  });

  return data.data as CourseDetail;
}

