'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, LineChart as LineChartIcon, Table as TableIcon, MapIcon } from "lucide-react";
import _ from 'lodash';
import { cn } from '@/lib/utils';
import { DataAnalysisProps, CommunityStats, PriceHistory, TrendLines, CommunityLocation } from './types';
import { AnalysisSettings } from './AnalysisSettings';
import { PriceTrendChart } from './PriceTrendChart';
import { TrendLineChart } from './TrendLineChart';
import { CommunityStatsTable } from './CommunityStatsTable';
import { CommunityMapView } from './CommunityMapView';
import { 
  calculateBasicStats, 
  processHistoryData, 
  calculateTrendLine,
  formatDate 
} from './utils';

export const DataAnalysis: React.FC<DataAnalysisProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState('trend');
  const [isLoading, setIsLoading] = useState(false);
  const [periodType, setPeriodType] = useState<'month' | 'quarter'>('month');
  const [aggregationType, setAggregationType] = useState<'mean' | 'median'>('mean');
  const [topN, setTopN] = useState(5);
  const [communityStats, setCommunityStats] = useState<CommunityStats[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  const [availableCommunities, setAvailableCommunities] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [trendLines, setTrendLines] = useState<TrendLines>({});
  const [communityLocations, setCommunityLocations] = useState<CommunityLocation[]>([]);

  const processData = () => {
    setIsLoading(true);
    
    if (!data || data.length === 0) {
      console.log('No data available');
      setIsLoading(false);
      return;
    }

    let filteredData = [...data];
    
    // 行政區過濾
    if (selectedDistricts.length > 0) {
      filteredData = filteredData.filter(d => selectedDistricts.includes(d.行政區));
    }
    
    // 時間區間過濾
    if (startDate || endDate) {
      filteredData = filteredData.filter(d => {
        const dateStr = String(d.交易年月日);
        const formattedDate = formatDate(dateStr, 'month');
        const isAfterStart = !startDate || formattedDate >= startDate;
        const isBeforeEnd = !endDate || formattedDate <= endDate;
        return isAfterStart && isBeforeEnd;
      });
    }
    
    if (filteredData.length === 0) {
      console.log('No data after filtering');
      return;
    }

    // 計算基本統計資料
    const basicStats = calculateBasicStats(filteredData);

    // 處理地理位置數據
    const locations = _.chain(filteredData)
      .groupBy('社區名稱')
      .map((group, name) => ({
        name,
        lat: _.meanBy(group, '緯度'),
        lng: _.meanBy(group, '經度'),
        count: group.length,
        avgPrice: _.meanBy(group, '交易價格')
      }))
      .value();
    setCommunityLocations(locations);

    // 處理時間序列數據
    const history = processHistoryData(filteredData, selectedCommunities, periodType, aggregationType);
    setPriceHistory(history);

    // 計算每個社區的趨勢線
    const trends: TrendLines = {};
    const stats: CommunityStats[] = [];

    selectedCommunities.forEach(community => {
      const communityData = history
        .map(h => ({
          price: h[community] as number,
          period: h.period
        }))
        .filter(d => d.price !== undefined);

      if (communityData.length >= 2) {
        const prices = communityData.map(d => d.price);
        const periods = communityData.map(d => d.period);
        const trendAnalysis = calculateTrendLine(prices, periods, periodType);
        trends[community] = trendAnalysis;

        // 找出該社區第一筆和最後一筆實際交易資料的位置
        const validIndices = history
          .map((h, i) => ({ hasData: h[community] !== undefined, index: i }))
          .filter(item => item.hasData)
          .map(item => item.index);

        const startIndex = validIndices[0];
        const endIndex = validIndices[validIndices.length - 1];

        // 只在有效範圍內計算趨勢線值
        for (let i = startIndex; i <= endIndex; i++) {
          const monthsSinceStart = i - startIndex;
          history[i][`${community}_trend`] = trendAnalysis.intercept + trendAnalysis.slope * monthsSinceStart;
        }

        // 更新社區統計資料
        const basicStat = basicStats.find(s => s.name === community)!;
        stats.push({
          ...basicStat,
          trendSlope: trendAnalysis.slope,
          r2Score: trendAnalysis.r2
        });
      }
    });

    setTrendLines(trends);
    setCommunityStats(stats);
    setIsLoading(false);
  };

  // 當資料變化時更新行政區列表
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    const districts = Array.from(new Set(data.map(d => d.行政區))).sort();
    setAvailableDistricts(districts);
    
    if (selectedDistricts.length === 0) {
      setSelectedDistricts(districts);
    }
  }, [data]);

  // 當行政區變化時更新社區列表
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    const filteredData = selectedDistricts.length > 0
      ? data.filter(d => selectedDistricts.includes(d.行政區))
      : data;
    
    const basicStats = calculateBasicStats(filteredData);
    const newAvailable = basicStats.slice(0, topN).map(s => s.name);
    setAvailableCommunities(newAvailable);
    
    setSelectedCommunities(newAvailable);
  }, [data, selectedDistricts, topN]);

  // 當相關設定變化時重新處理資料
  useEffect(() => {
    processData();
  }, [data, periodType, startDate, endDate, topN, selectedCommunities, aggregationType]);

  const handleSettingsChange = (key: string, value: any) => {
    const settingsMap: { [key: string]: (value: any) => void } = {
      periodType: setPeriodType,
      aggregationType: setAggregationType,
      topN: setTopN,
      selectedDistricts: setSelectedDistricts,
      selectedCommunities: setSelectedCommunities,
      startDate: setStartDate,
      endDate: setEndDate,
    };

    if (key in settingsMap) {
      settingsMap[key](value);
    }
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setSelectedCommunities([]);
    setPeriodType('month');
    setAggregationType('mean');
    setTopN(5);
    setSelectedDistricts(availableDistricts);
  };

  return (
    <div className="space-y-6">
      <AnalysisSettings
        periodType={periodType}
        aggregationType={aggregationType}
        topN={topN}
        selectedDistricts={selectedDistricts}
        selectedCommunities={selectedCommunities}
        startDate={startDate}
        endDate={endDate}
        availableDistricts={availableDistricts}
        availableCommunities={availableCommunities}
        onSettingsChange={handleSettingsChange}
        onReset={handleReset}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto bg-gray-100 dark:bg-gray-800 p-1 rounded-lg gap-1">
          <TabsTrigger
            value="trend"
            className={cn(
              "space-x-2 transition-all duration-200",
              "data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700",
              "data-[state=active]:shadow-sm",
              "rounded-md px-4 py-2"
            )}
          >
            <LineChartIcon className="h-4 w-4" />
            <span>價格趨勢</span>
          </TabsTrigger>
          <TabsTrigger
            value="trendline"
            className={cn(
              "space-x-2 transition-all duration-200",
              "data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700",
              "data-[state=active]:shadow-sm",
              "rounded-md px-4 py-2"
            )}
          >
            <BarChart3 className="h-4 w-4" />
            <span>趨勢線</span>
          </TabsTrigger>
          <TabsTrigger
            value="stats"
            className={cn(
              "space-x-2 transition-all duration-200",
              "data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700",
              "data-[state=active]:shadow-sm",
              "rounded-md px-4 py-2"
            )}
          >
            <TableIcon className="h-4 w-4" />
            <span>統計資料</span>
          </TabsTrigger>
          <TabsTrigger
            value="map"
            className={cn(
              "space-x-2 transition-all duration-200",
              "data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700",
              "data-[state=active]:shadow-sm",
              "rounded-md px-4 py-2"
            )}
          >
            <MapIcon className="h-4 w-4" />
            <span>地圖檢視</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trend" className="relative min-h-[400px]">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <PriceTrendChart
              priceHistory={priceHistory}
              selectedCommunities={selectedCommunities}
              availableCommunities={availableCommunities}
            />
          )}
        </TabsContent>

        <TabsContent value="trendline" className="relative min-h-[400px]">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <TrendLineChart
              priceHistory={priceHistory}
              selectedCommunities={selectedCommunities}
              availableCommunities={availableCommunities}
              trendLines={trendLines}
            />
          )}
        </TabsContent>

        <TabsContent value="stats" className="relative min-h-[400px]">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <CommunityStatsTable communityStats={communityStats} />
          )}
        </TabsContent>

        <TabsContent value="map" className="relative min-h-[400px]">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <CommunityMapView
              locations={communityLocations}
              selectedCommunities={selectedCommunities}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};