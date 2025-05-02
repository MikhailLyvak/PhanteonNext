import React from 'react'

interface Props {
  innerText: string;
}

const VitalisButton: React.FC<Props> = ({ innerText }) => {
  return (
    <button className="border-2 max-w-[165px] sm:max-w-[300px] mt-[13px] border-[#037F6A] text-[#037F6A] text-xs sm:text-base px-[10px] sm:px-5 py-2 rounded-3xl flex items-center justify-center whitespace-nowrap overflow-hidden">
      {innerText} ...
    </button>
  )
}

export default VitalisButton
