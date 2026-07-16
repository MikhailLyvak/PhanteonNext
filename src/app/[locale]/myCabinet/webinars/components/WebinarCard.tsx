'use client'

import React from 'react';
import { Webinar } from '@/api/Webinars/types';
import { Calendar, Clock, ExternalLink, ShoppingCart } from 'lucide-react';
import { Cookies } from 'react-cookie';
import { useUserStore } from '@/store/UserData/useUserStore';
import { useAuthModalStore } from '@/store/AuthModal/useAuthModalStore';
import axiosInterceptor from '@/interceptor/axiosClient';
import { useCustomTranslations } from '@/lib/contexts/translations/translations-context'
import { TKeys } from '@/i18n/t-keys'
import { useFormatter } from 'next-intl'

interface WebinarCardProps {
  webinar: Webinar;
  hasAccess?: boolean;
  subscriptionTypes?: string[];
  purchaseStatus?: string;
}

const WebinarCard: React.FC<WebinarCardProps> = ({ webinar, hasAccess = false, subscriptionTypes = [], purchaseStatus }) => {
  const { user } = useUserStore();
  const { toggleModal, setActiveTab } = useAuthModalStore();
  const { t } = useCustomTranslations(TKeys.cabinet.webinars)
  const format = useFormatter()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format.dateTime(date, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return format.dateTime(date, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleWatchClick = async () => {
    if (hasAccess) {
      window.open(webinar.link, '_blank');
    } else {
      // If not logged in, open auth modal (register tab)
      if (!user) {
        setActiveTab('register');
        toggleModal();
        return;
      }

      // Handle purchase logic
      try {
        const { data } = await axiosInterceptor.post('/api/webinar/purchase/', {
          webinar_id: webinar.id,
        });

        if (data?.payment_url) {
          window.location.href = data.payment_url;
        } else {
          console.error('Purchase failed:', data);
          alert(t.paymentError + ': ' + (data?.error || ''));
        }
      } catch (error: any) {
        console.error('Purchase error:', error);
        const message = error?.response?.data?.error || t.paymentError;
        alert(message);
      }
    }
  };

  const handleCancelPurchase = async () => {
    try {
      await axiosInterceptor.post('/api/webinar/cancel-purchase/', {
        webinar_id: webinar.id,
      });
      alert(t.cancelSuccess);
      window.location.reload();
    } catch (error: any) {
      console.error('Cancel error:', error);
      const message = error?.response?.data?.error || t.cancelError;
      alert(message);
    }
  };

  const getSubscriptionBadges = () => {
    if (hasAccess) return null;

    const badges = [];
    if (subscriptionTypes.includes('monthly')) {
      badges.push(
        <span key="monthly" className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
          {t.monthlyBadge}
        </span>
      );
    }
    if (subscriptionTypes.includes('yearly')) {
      badges.push(
        <span key="yearly" className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
          {t.yearlyBadge}
        </span>
      );
    }
    return badges;
  };

  return (
    <div className="bg-[#242433] rounded-2xl p-6 hover:bg-[#2F2F40] transition-colors duration-200">
      <div className="space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white line-clamp-2">
            {webinar.name}
          </h3>
          <p className="text-gray-400 text-sm line-clamp-3">
            {webinar.description}
          </p>
        </div>

        {/* Date and Time */}
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span>{formatDate(webinar.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span>{formatTime(webinar.date)}</span>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              webinar.is_active
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
            }`}>
              {webinar.is_active ? t.active : t.inactive}
            </div>
            {/* Subscription badges */}
            <div className="flex flex-wrap gap-1">
              {getSubscriptionBadges()}
            </div>
          </div>

          <div className="flex gap-2">
            {purchaseStatus === 'PENDING' ? (
              <button
                onClick={handleCancelPurchase}
                className="flex items-center gap-2 px-4 py-2 bg-[#FFA500] text-white rounded-xl hover:bg-[#FF8C00] transition-colors duration-200 font-medium"
              >
                <ShoppingCart size={16} />
                {t.cancelPurchase}
              </button>
            ) : (
              <button
                onClick={handleWatchClick}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors duration-200 font-medium ${
                  hasAccess
                    ? 'bg-[#D2D2FF] text-[#171723] hover:bg-[#B8B8FF]'
                    : 'bg-[#FF6B6B] text-white hover:bg-[#FF5252]'
                }`}
              >
                {hasAccess ? (
                  <>
                    <ExternalLink size={16} />
                    {t.watch}
                  </>
                ) : (
                  <>
                    <ShoppingCart size={16} />
                    {t.buy}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebinarCard;
