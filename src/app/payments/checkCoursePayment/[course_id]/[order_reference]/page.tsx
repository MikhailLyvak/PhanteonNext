'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import InnerWhiteHeader from '@/app/components/LayoutItems/components/Header/InnerWhiteHeader';
import { Triangle } from 'react-loader-spinner';
import { usePostCkeckPaymentStatus } from '@/hooks/StudyPlatform/usePostCkeckPaymentStatus';

const PaymentStatusPage: React.FC = () => {
  const params = useParams();
  const rawCourseId = params.course_id;
  const rawOrderRef = params.order_reference;

  const courseId = Array.isArray(rawCourseId)
    ? parseInt(rawCourseId[0], 10)
    : parseInt(rawCourseId!, 10);
  const orderReference = Array.isArray(rawOrderRef)
    ? rawOrderRef[0]
    : rawOrderRef!;

  const { mutate } = usePostCkeckPaymentStatus();

  useEffect(() => {
    if (!orderReference || isNaN(courseId)) {
      console.error('Invalid params', { courseId, orderReference });
      return;
    }

    mutate(
      { courseId, orderReference },
      {
        onSuccess: (res) => {
          if (res.status === 'SUCCESS') {
            window.location.href = `/myCabinet/studyPlatform/${courseId}`;
          } else {
            console.warn('Payment not yet SUCCESS', res);
          }
        },
        onError: (err) => {
          console.error('Check payment status failed', err);
        },
      }
    );
  }, [courseId, orderReference, mutate]);

  return (
    <>
      <InnerWhiteHeader />
      <div className="max-w-7xl mx-auto pt-[120px] px-4">
        <div className="rounded-2xl border border-[#C1C1C1] shadow-lg py-40 px-4 mt-16 mb-24">
          <div className="flex flex-col gap-4 items-center">
            <Triangle
              visible
              height={100}
              width={100}
              color="#007E6C"
              ariaLabel="triangle-loading"
            />
            <h2 className="text-gray-800 text-center lg:text-4xl font-semibold">
              Зачекайте, ми перевіряємо вашу оплату...
            </h2>
            <h6 className="text-xs lg:text-lg text-center font-normal text-gray-500">
              Як тільки оплата підтверджена — вас автоматично перенаправить на курс!
            </h6>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentStatusPage;