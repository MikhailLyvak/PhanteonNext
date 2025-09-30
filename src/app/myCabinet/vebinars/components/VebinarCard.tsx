'use client'

import React from 'react';
import { Vebinar } from '@/api/Vebinars/types';
import { Calendar, Clock, ExternalLink, ShoppingCart } from 'lucide-react';
import { Cookies } from 'react-cookie';

interface VebinarCardProps {
  vebinar: Vebinar;
  hasAccess?: boolean;
  subscriptionTypes?: string[];
  purchaseStatus?: string;
}

const VebinarCard: React.FC<VebinarCardProps> = ({ vebinar, hasAccess = false, subscriptionTypes = [], purchaseStatus }) => {
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
      // Handle purchase logic
      try {
        const cookies = new Cookies();
        const token = cookies.get('local_access_token');
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/vebinar/purchase/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
          },
          body: JSON.stringify({
            vebinar_id: vebinar.id
          })
        });

        const data = await response.json();
        
        if (response.ok && data.payment_url) {
          // Redirect to payment page
          window.location.href = data.payment_url;
        } else {
          console.error('Purchase failed:', data.error);
          alert('Помилка при створенні платежу: ' + (data.error || 'Невідома помилка'));
        }
      } catch (error) {
        console.error('Purchase error:', error);
        alert('Помилка при створенні платежу');
      }
    }
  };

  const handleCancelPurchase = async () => {
    try {
      const cookies = new Cookies();
      const token = cookies.get('local_access_token');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/vebinar/cancel-purchase/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({
          vebinar_id: vebinar.id
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Покупку скасовано успішно');
        // Reload the page to update the status
        window.location.reload();
      } else {
        console.error('Cancel failed:', data.error);
        alert('Помилка при скасуванні покупки: ' + (data.error || 'Невідома помилка'));
      }
    } catch (error) {
      console.error('Cancel error:', error);
      alert('Помилка при скасуванні покупки');
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
