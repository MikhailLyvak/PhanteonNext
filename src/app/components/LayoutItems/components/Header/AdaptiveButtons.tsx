'use client'

import { LuShoppingCart } from 'react-icons/lu';
import LoginButton from '@/app/components/HeaderComps/LoginButton';

import { Squash as Burger } from 'hamburger-react';
import { useState } from 'react';
import { useMainDrawerStore } from '@/store/Nav/useMainDrawerStore';

interface Props {
  textColor?: string;
  hoverTextColorClass?: string;
}

const AdaptiveButtons: React.FC<Props> = ({ textColor = 'text-black', hoverTextColorClass }) => {
  const { toggleMainDrawer } = useMainDrawerStore()
  return (
    <div className="flex gap-2 sm:gap-4">
      <div className={`border-[1px] border-[#D2D2FF] ${textColor} ${hoverTextColorClass} flex lg:hidden rounded-xl w-12 lg:w-16 h-12 lg:h-16 items-center justify-center font-bold`}>
        UA
      </div>
      <div className='flex'>
        <LoginButton />
      </div>
      <div className={`border-[1px] border-gray-500 ${textColor} ${hoverTextColorClass} hidden lg:flex rounded-3xl w-12 lg:w-16 h-12 lg:h-16 items-center justify-center font-bold`}>
        UA
      </div>
    </div>
  )
}

export default AdaptiveButtons
