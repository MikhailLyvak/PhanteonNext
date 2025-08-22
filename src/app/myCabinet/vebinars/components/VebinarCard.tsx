'use client'

import React from 'react';
import { Vebinar } from '@/api/Vebinars/types';
import { Calendar, Clock, ExternalLink } from 'lucide-react';

interface VebinarCardProps {
  vebinar: Vebinar;
}

const VebinarCard: React.FC<VebinarCardProps> = ({ vebinar }) => {
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

  const handleWatchClick = () => {
    window.open(vebinar.link, '_blank');
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
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            vebinar.is_active 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-red-500/20 text-red-400'
          }`}>
            {vebinar.is_active ? 'Активний' : 'Неактивний'}
          </div>
          
          <button
            onClick={handleWatchClick}
            className="flex items-center gap-2 px-4 py-2 bg-[#D2D2FF] text-[#171723] rounded-xl hover:bg-[#B8B8FF] transition-colors duration-200 font-medium"
          >
            <ExternalLink size={16} />
            Дивитися
          </button>
        </div>
      </div>
    </div>
  );
};

export default VebinarCard;
