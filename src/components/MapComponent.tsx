'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CommunityLocation, CommunityMapProps } from '@/types';

export const MapComponent: React.FC<CommunityMapProps> = ({ locations, selectedCommunities }) => {
  // 計算價格範圍和分位數
  const sortedPrices = [...locations].sort((a, b) => a.avgPrice - b.avgPrice);
  const getPercentilePrice = (percentile: number) => {
    const index = Math.floor(sortedPrices.length * percentile);
    return sortedPrices[index]?.avgPrice || 0;
  };

  const priceGrades = [
    getPercentilePrice(0),    // 最小值
    getPercentilePrice(0.2),  // 20%分位數
    getPercentilePrice(0.4),  // 40%分位數
    getPercentilePrice(0.6),  // 60%分位數
    getPercentilePrice(0.8),  // 80%分位數
    getPercentilePrice(0.99)  // 接近最大值，避免極端值影響
  ];

  // 根據價格獲取顏色
  const getLocationColor = (price: number) => {
    // 找出價格所在的區間
    const gradeIndex = priceGrades.findIndex((grade, index) => 
      price >= grade && (index === priceGrades.length - 1 || price < priceGrades[index + 1])
    );
    
    // 使用更鮮明的顏色
    const colors = [
      '#00FF00', // 亮綠色 - 最低20%
      '#80FF00', // 黃綠色 - 20-40%
      '#FFFF00', // 亮黃色 - 40-60%
      '#FF8000', // 橙色 - 60-80%
      '#FF0000'  // 亮紅色 - 最高20%
    ];

    return {
      fillColor: colors[Math.min(Math.max(0, gradeIndex), colors.length - 1)],
      color: '#000000', // 黑色邊框增加對比
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9 // 提高不透明度
    };
  };

  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Layer[]>([]);
  const legendRef = useRef<L.Control | null>(null);

  // 計算地圖中心點
  const center = locations.length > 0
    ? {
        lat: locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length,
        lng: locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length,
      }
    : { lat: 25.0330, lng: 121.5654 }; // 預設台北市中心

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // 初始化地圖
    mapRef.current = L.map(mapContainerRef.current).setView(
      [center.lat, center.lng],
      13
    );

    // 添加圖層
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapRef.current);

    // 創建圖例
    const legend = new L.Control({ position: 'bottomright' });
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'info legend');
      div.style.backgroundColor = 'white';
      div.style.padding = '12px';
      div.style.borderRadius = '8px';
      div.style.border = '2px solid rgba(0,0,0,0.3)';
      div.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';

      const colors = ['#00FF00', '#80FF00', '#FFFF00', '#FF8000', '#FF0000'];
      const labels = ['最低20%', '20-40%', '40-60%', '60-80%', '最高20%'];

      div.innerHTML = '<h4 style="margin:0 0 8px 0;font-weight:bold;font-size:14px;">平均房價分布</h4>';
      
      // 為每個區間創建顏色方塊和標籤
      for (let i = 0; i < colors.length; i++) {
        const priceRange = `${Math.round(priceGrades[i] / 10000)}萬 - ${Math.round(priceGrades[i + 1] / 10000)}萬`;
        div.innerHTML +=
          '<div style="display:flex;align-items:center;margin:5px 0;">' +
          `<i style="background:${colors[i]};width:24px;height:24px;margin-right:8px;display:inline-block;border:1px solid #000;"></i>` +
          `<span style="font-size:13px;">${labels[i]}<br/>${priceRange}</span>` +
          '</div>';
      }

      return div;
    };
    legendRef.current = legend;
    legend.addTo(mapRef.current);

    // 清理函數
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 更新標記
  useEffect(() => {
    if (!mapRef.current) return;

    // 清除現有標記
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // 添加新標記（只顯示選中的社區）
    locations.forEach((location) => {
      if (selectedCommunities.includes(location.name)) {
        const colors = getLocationColor(location.avgPrice);
        const marker = L.circleMarker(
          [location.lat, location.lng],
          {
            radius: 10, // 增加圓圈大小
            ...colors
          }
        );

        const popupContent = `
          <div class="p-2">
            <h3 class="font-bold text-lg">${location.name}</h3>
            <p class="text-sm">交易次數: ${location.count}</p>
            <p class="text-sm">平均價格: ${location.avgPrice.toLocaleString('zh-TW')}</p>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(mapRef.current!);
        markersRef.current.push(marker);
      }
    });

    // 更新地圖視圖（只考慮選中的社區）
    const selectedLocations = locations.filter(loc =>
      selectedCommunities.includes(loc.name)
    );
    
    if (selectedLocations.length > 0) {
      const bounds = L.latLngBounds(
        selectedLocations.map(loc => [loc.lat, loc.lng])
      );
      mapRef.current.fitBounds(bounds);
    }
  }, [locations, selectedCommunities]);

  return <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />;
};