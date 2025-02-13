'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@tremor/react';
import { CommunityMapProps } from '@/types';

// 動態導入地圖組件，禁用 SSR
const MapComponent = dynamic(
  () => import('@/components/MapComponent').then((mod) => mod.MapComponent),
  {
    ssr: false,
    loading: () => (
      <Card className="w-full h-[500px] bg-white dark:bg-gray-800 shadow-lg">
        <div className="w-full h-full flex items-center justify-center">
          <p>載入地圖中...</p>
        </div>
      </Card>
    ),
  }
);

const PriceMap: React.FC<CommunityMapProps> = ({ locations, selectedCommunities }) => {
  return (
    <Card className="w-full h-[500px] bg-white dark:bg-gray-800 shadow-lg">
      <div className="w-full h-full">
        <MapComponent
          locations={locations}
          selectedCommunities={selectedCommunities}
        />
      </div>
    </Card>
  );
};

export default PriceMap;