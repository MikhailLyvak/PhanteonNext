import React from 'react';
import HeaderNav from '../LayoutItems/components/Header/HeaderNav';

interface Props {
  children: React.ReactNode;
}

const AdaptiveHeader: React.FC<Props> = ({ children }) => {
  return (
    <header>
      <section className="relative w-full h-screen pt-[120px] bg-gradient-to-r from-[#313131] via-[#007E6C] to-[#313131] bg-cover bg-center rounded-b-3xl">
        <HeaderNav textColor="text-gray-200" />
        <div className="w-full">{children}</div>
      </section>
    </header>
  );
};

export default AdaptiveHeader;
