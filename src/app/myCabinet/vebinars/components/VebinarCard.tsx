'use client'

import React from 'react';
import { Vebinar } from '@/api/Vebinars/types';
import { Calendar, Clock, ExternalLink, ShoppingCart } from 'lucide-react';
import { Cookies } from 'react-cookie';
import { useUserStore } from '@/store/UserData/useUserStore';
import { useAuthModalStore } from '@/store/AuthModal/useAuthModalStore';
import axiosInterceptor from '@/interceptor/axiosClient';

interface VebinarCardProps {
  vebinar: Vebinar;
  hasAccess?: boolean;
  subscriptionTypes?: string[];
  purchaseStatus?: string;
}

const VebinarCard: React.FC<VebinarCardProps> = ({ vebinar, hasAccess = false, subscriptionTypes = [], purchaseStatus }) => {
  const { user } = useUserStore();
  const { toggleModal, setActiveTab } = useAuthModalStore();
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleWatchClick = async () => {
    if (hasAccess) {
      window.open(vebinar.link, '_blank');
    } else {
      // If not logged in, open auth modal (register tab)
      if (!user) {
        setActiveTab('register');
        toggleModal();
        return;
      }

      // Handle purchase logic
      try {
        const { data } = await axiosInterceptor.post('/api/vebinar/purchase/', {
          vebinar_id: vebinar.id,
        });

        if (data?.payment_url) {
          window.location.href = data.payment_url;
        } else {
          console.error('Purchase failed:', data);
          alert('Помилка при створенні платежу: ' + (data?.error || 'Невідома помилка'));
        }
      } catch (error: any) {
        console.error('Purchase error:', error);
        const message = error?.response?.data?.error || 'Помилка при створенні платежу';
        alert(message);
      }
    }
  };

  const handleCancelPurchase = async () => {
    try {
      await axiosInterceptor.post('/api/vebinar/cancel-purchase/', {
        vebinar_id: vebinar.id,
      });
      alert('Покупку скасовано успішно');
      window.location.reload();
    } catch (error: any) {
      console.error('Cancel error:', error);
      const message = error?.response?.data?.error || 'Помилка при скасуванні покупки';
      alert(message);
    }
  };

  const getSubscriptionBadges = () => {
    if (hasAccess) return null;
    
    const badges = [];
    if (subscriptionTypes.includes('monthly')) {
      badges.push(
        <span key="monthly" className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
          Частина Місячної підписки
        </span>
      );
    }
    if (subscriptionTypes.includes('yearly')) {
      badges.push(
        <span key="yearly" className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
          Частина Річної підписки
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
            {vebinar.name}
          </h3>
          <p className="text-gray-400 text-sm line-clamp-3">
            {vebinar.description}
          </p>
        </div>

        {/* Date and Time */}
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span>{formatDate(vebinar.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span>{formatTime(vebinar.date)}</span>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              vebinar.is_active 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {vebinar.is_active ? 'Активний' : 'Неактивний'}
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
                Скасувати покупку
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
                    Дивитися
                  </>
                ) : (
                  <>
                    <ShoppingCart size={16} />
                    Придбати
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

export default VebinarCard;
