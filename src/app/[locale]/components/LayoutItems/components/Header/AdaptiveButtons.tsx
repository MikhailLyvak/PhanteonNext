'use client'

import LoginButton from '@components/HeaderComps/LoginButton';

const AdaptiveButtons = () => {
  return (
    <div className="flex gap-2 sm:gap-4">
      <div className='flex'>
        <LoginButton />
      </div>
    </div>
  )
}

export default AdaptiveButtons
