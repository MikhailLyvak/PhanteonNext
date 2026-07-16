'use client'

import React from 'react';
import { useGetWebinarsList } from '@/hooks/Webinars/useGetWebinarsList';
import WebinarCard from './WebinarCard';
import { Triangle } from 'react-loader-spinner';
import { useCustomTranslations } from '@/lib/contexts/translations/translations-context'
import { TKeys } from '@/i18n/t-keys'

const WebinarsList = () => {
  const { data: webinars, isLoading, error } = useGetWebinarsList();
  const { t } = useCustomTranslations(TKeys.cabinet.webinars)

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
        <p className="text-red-400 text-lg">{t.loadError}</p>
        <p className="text-gray-400 mt-2">{t.tryRefresh}</p>
      </div>
    );
  }

  if (!webinars || webinars.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 text-lg">{t.noWebinars}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{t.title}</h2>
        <div className="text-sm text-gray-400">
          {t.total({ count: webinars.length })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
  );
};

export default WebinarsList;
