'use client'

import React from 'react'
import { X, User, Wallet } from 'lucide-react'
import Link from 'next/link'

interface PersonalDataModalProps {
  isOpen: boolean
  onClose: () => void
  missingFields: string[]
}

const PersonalDataModal: React.FC<PersonalDataModalProps> = ({
  isOpen,
  onClose,
  missingFields
}) => {
  if (!isOpen) return null

  const getFieldName = (field: string): string => {
    switch (field) {
      case 'first_name':
        return "Ім'я"
      case 'last_name':
        return 'Прізвище'
      case 'solana_wallet':
        return 'Solana гаманець'
      default:
        return field
    }
  }

  const getFieldIcon = (field: string) => {
    switch (field) {
      case 'first_name':
      case 'last_name':
        return <User size={16} />
      case 'solana_wallet':
        return <Wallet size={16} />
      default:
        return <User size={16} />
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#242433] rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[#D2D2FF] text-xl font-bold">
            Заповніть персональні дані
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="bg-[#1D1D2A] rounded-2xl p-4">
            <p className="text-white text-sm leading-relaxed mb-4">
              Для отримання сертифікату необхідно заповнити наступні поля в розділі "Персональні дані":
            </p>
            
            <div className="space-y-3">
              {missingFields.map((field) => (
                <div key={field} className="flex items-center gap-3 p-3 bg-[#242433] rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-red-600 text-white">
                    {getFieldIcon(field)}
                  </div>
                  <span className="text-white font-medium">
                    {getFieldName(field)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-600 bg-opacity-20 border border-blue-600 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <Wallet size={20} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-blue-400 font-semibold text-sm mb-1">
                  Solana гаманець
                </h4>
                <p className="text-white text-xs leading-relaxed">
                  Введіть адресу вашого Solana гаманця для отримання NFT сертифікатів. 
                  Це поле обов'язкове для випуску сертифікатів.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-2xl font-semibold transition-colors"
          >
            Скасувати
          </button>
          <Link
            href="/myCabinet/personalData"
            className="flex-1 px-4 py-3 bg-[#6A56E4] hover:bg-[#5A4BC4] text-white rounded-2xl font-semibold transition-colors text-center"
            onClick={onClose}
          >
            Заповнити дані
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PersonalDataModal
