'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the TradingView widget with no SSR
const TradingViewWidget = dynamic(
  () => import('react-ts-tradingview-widgets').then((mod) => mod.AdvancedRealTimeChart),
  { ssr: false }
);

const DashboardPage = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center">
        <div className="text-[#D2D2FF]">Loading chart...</div>
      </div>
    );
  }

  return (
    <div className='max-w-[1320px] mx-auto'>
      <div style={{ height: 500 }}>
        <TradingViewWidget
          symbol="NASDAQ:AAPL"
          theme="dark"
          interval="1"
          autosize
        />
      </div>
    </div>
  );
};

export default DashboardPage;
