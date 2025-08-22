'use client'

import React from 'react';
import { useGetVebinarsList } from '@/hooks/Vebinars/useGetVebinarsList';
import VebinarCard from './VebinarCard';
import { Triangle } from 'react-loader-spinner';

const VebinarsList = () => {
  const { data: vebinars, isLoading, error } = useGetVebinarsList();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
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
      <div className="text-center py-8">
        <p className="text-red-400 text-lg">Помилка завантаження вебінарів</p>
        <p className="text-gray-400 mt-2">Спробуйте оновити сторінку</p>
      </div>
    );
  }

  if (!vebinars || vebinars.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 text-lg">Наразі немає доступних вебінарів</p>
        <p className="text-gray-500 text-sm mt-2">Спробуйте оновити сторінку або зверніться до адміністратора</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Вебінари</h2>
        <div className="text-sm text-gray-400">
          Всього: {vebinars.length}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vebinars.map((vebinar) => (
          <VebinarCard key={vebinar.id} vebinar={vebinar} />
        ))}
      </div>
    </div>
  );
};

export default VebinarsList;
