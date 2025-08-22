'use client'

import React from 'react';
import { useGetLastVebinar } from '@/hooks/Vebinars/useGetLastVebinar';
import { useUserStore } from '@/store/UserData/useUserStore';
import { useAuthModalStore } from '@/store/AuthModal/useAuthModalStore';
import { Calendar, Clock, Play, ExternalLink } from 'lucide-react';

const LatestVebinar = () => {
  const { data: lastVebinar, isLoading } = useGetLastVebinar();
  const { user } = useUserStore();
  const { toggleModal } = useAuthModalStore();

  const handleWatchClick = () => {
    if (!user) {
      toggleModal();
      return;
    }
    
    if (lastVebinar?.link) {
      window.open(lastVebinar.link, '_blank');
    }
  };

  if (isLoading) {
    return null;
  }

  // Якщо вебінарів немає, не показуємо компонент
  if (!lastVebinar) {
    return null;
  }

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

  return (
    <section className="py-16 bg-[#242433]">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Останній вебінар
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Дізнайтеся про наш найновіший вебінар та покращуйте свої знання
          </p>
        </div>

        <div className="bg-[#171723] rounded-2xl p-8 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Content */}
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  {lastVebinar.name}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {lastVebinar.description}
                </p>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{formatDate(lastVebinar.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>{formatTime(lastVebinar.date)}</span>
                </div>
              </div>

              <button
                onClick={handleWatchClick}
                className="flex items-center gap-2 px-6 py-3 bg-[#D2D2FF] text-[#171723] rounded-xl hover:bg-[#B8B8FF] transition-colors duration-200 font-medium"
              >
                {user ? (
                  <>
                    <ExternalLink size={16} />
                    Дивитися вебінар
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Увійти для перегляду
                  </>
                )}
              </button>
            </div>

            {/* Visual Element */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-64 h-48 bg-gradient-to-br from-[#D2D2FF] to-[#6A56E4] rounded-2xl flex items-center justify-center">
                <div className="text-center text-white">
                  <Play size={48} className="mx-auto mb-2" />
                  <p className="text-sm font-medium">Вебінар</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LatestVebinar;
