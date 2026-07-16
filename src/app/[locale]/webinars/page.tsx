'use client'

import React from 'react';
import { useUserStore } from '@/store/UserData/useUserStore';
import { Triangle } from 'react-loader-spinner';
import { useGetWebinarsList } from '@/hooks/Webinars/useGetWebinarsList';
import WebinarCard from '../myCabinet/webinars/components/WebinarCard';

const WebinarsPage = () => {
  const { user } = useUserStore();
  const { data: webinars, isLoading, error } = useGetWebinarsList();


  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#171723] flex items-center justify-center">
        <Triangle
          height="80"
          width="80"
          color="#D2D2FF"
          ariaLabel="triangle-loading"
          wrapperStyle={{}}
          wrapperClass=""
          visible={true}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#171723] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg">Помилка завантаження вебінарів</p>
          <p className="text-gray-400 mt-2">Спробуйте оновити сторінку</p>
        </div>
      </div>
    );
  }

  if (!webinars || webinars.length === 0) {
    return (
      <div className="min-h-screen bg-[#171723] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg">Наразі немає доступних вебінарів</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#171723]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Вебінари
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Дізнайтеся нове з наших експертних вебінарів та покращуйте свої знання
          </p>
        </div>

                 {/* Webinars Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {webinars.map((webinar) => (
             <WebinarCard 
               key={webinar.id} 
               webinar={webinar} 
               hasAccess={webinar.has_access}
               subscriptionTypes={webinar.subscription_types}
             />
           ))}
         </div>
      </div>
    </div>
  );
};

export default WebinarsPage;
