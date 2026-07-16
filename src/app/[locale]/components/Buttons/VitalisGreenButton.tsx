import React from 'react';
import { Triangle } from 'react-loader-spinner'

interface Props {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  isPending?: boolean;
}

const VitalisGreenButton: React.FC<Props> = ({
  children,
  onClick,
  disabled = false,
  isPending = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isPending}
      className="h-12 px-9 bg-[#6A56E4] hover:shadow-xl text-white rounded-3xl text-base font-semibold"
    >
      <div className="w-full flex gap-2 items-center justify-center">
        {isPending && (
          <Triangle
            visible={true}
            height={16}
            width={16}
            color="#fff"
            ariaLabel="triangle-loading"

          />
        )}
        {children}
      </div>
    </button>
  );
}

export default VitalisGreenButton;
