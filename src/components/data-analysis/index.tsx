'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, LineChart as LineChartIcon, Table as TableIcon, MapIcon, Loader2 } from "lucide-react";
import _ from 'lodash';
import { cn } from '@/lib/utils';
import { DataAnalysisProps, CommunityStats, PriceHistory, TrendLines, CommunityLocation, SortCriteria } from './types';
import { AnalysisSettings } from './AnalysisSettings';
import { PriceTrendChart } from './PriceTrendChart';
import { TrendLineChart } from './TrendLineChart';
import { CommunityStatsTable } from './CommunityStatsTable';
import { CommunityMapView } from './CommunityMapView';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>('count');
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
  const [useLogTransform, setUseLogTransform] = useState(false);

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
      setIsLoading(false);
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
      // 先從basicStats中找出該社區的基本統計資料
      const basicStat = basicStats.find(s => s.name === community);
      
      // 如果找不到該社區的資料，跳過
      if (!basicStat) return;
      
      const communityData = history
        .map(h => ({
          price: h[community] as number,
          period: h.period
        }))
        .filter(d => d.price !== undefined);

      // 預設趨勢線相關值
      let trendSlope = 0;
      let r2Score = 0;

      // 只有當有足夠的資料點時才計算趨勢線
      if (communityData.length >= 2) {
        const prices = communityData.map(d => d.price);
        const periods = communityData.map(d => d.period);
        const trendAnalysis = calculateTrendLine(prices, periods, periodType, useLogTransform);
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
          const predictedValue = trendAnalysis.intercept + trendAnalysis.slope * monthsSinceStart;
          
          // 如果使用對數轉換，需要將預測值轉換回原始尺度
          history[i][`${community}_trend`] = trendAnalysis.isLogTransformed 
            ? Math.exp(predictedValue) 
            : predictedValue;
        }

        // 更新趨勢線相關值
        trendSlope = trendAnalysis.slope;
        r2Score = trendAnalysis.r2;
      }

      // 無論是否有足夠的資料點計算趨勢線，都添加到統計資料中
      stats.push({
        ...basicStat,
        trendSlope,
        r2Score
      });
    });

    setTrendLines(trends);
    setCommunityStats(stats);
    
    // 延遲一點時間以顯示加載動畫
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
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
    
    // 篩選出最近兩年內有至少5筆交易的社區
    const now = new Date();
    const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
    
    // 將兩年前的日期轉換為與交易年月日相同的格式 (YYYYMMDD)
    const twoYearsAgoFormatted = parseInt(
      `${twoYearsAgo.getFullYear()}${String(twoYearsAgo.getMonth() + 1).padStart(2, '0')}${String(twoYearsAgo.getDate()).padStart(2, '0')}`
    );
    
    // 篩選最近兩年的交易
    const recentTransactions = filteredData.filter(d => d.交易年月日 >= twoYearsAgoFormatted);
    
    // 計算每個社區在最近兩年內的交易次數
    const communityTransactionCounts = _.chain(recentTransactions)
      .groupBy('社區名稱')
      .mapValues(group => group.length)
      .value();
    
    // 篩選出交易次數>=5的社區
    const communitiesWithEnoughTransactions = Object.keys(communityTransactionCounts)
      .filter(community => communityTransactionCounts[community] >= 5);
    
    const basicStats = calculateBasicStats(filteredData);
    
    // 根據選擇的排序條件進行排序
    let sortedStats;
    switch (sortCriteria) {
      case 'mape':
        sortedStats = _.orderBy(basicStats, ['mape'], ['desc']); // 降序排列，誤差大的在前
        break;
      case 'mpe_asc':
        sortedStats = _.orderBy(basicStats, ['mpe'], ['asc']); // 升序排列，負值在前
        break;
      case 'mpe_desc':
        sortedStats = _.orderBy(basicStats, ['mpe'], ['desc']); // 降序排列，正值在前
        break;
      case 'count':
      default:
        sortedStats = _.orderBy(basicStats, ['count'], ['desc']); // 降序排列，交易次數多的在前
        break;
    }
    
    // 只選擇有足夠交易量的社區，然後再取前N個
    const newAvailable = sortedStats
      .filter(s => communitiesWithEnoughTransactions.includes(s.name))
      .slice(0, topN)
      .map(s => s.name);
    
    setAvailableCommunities(newAvailable);
    setSelectedCommunities(newAvailable);
  }, [data, selectedDistricts, topN, sortCriteria]);

  // 當相關設定變化時重新處理資料
  useEffect(() => {
    processData();
  }, [data, periodType, startDate, endDate, topN, selectedCommunities, aggregationType, sortCriteria, useLogTransform]);

  const handleSettingsChange = (key: string, value: any) => {
    const settingsMap: { [key: string]: (value: any) => void } = {
      periodType: setPeriodType,
      aggregationType: setAggregationType,
      topN: setTopN,
      sortCriteria: setSortCriteria,
      selectedDistricts: setSelectedDistricts,
      selectedCommunities: setSelectedCommunities,
      startDate: setStartDate,
      endDate: setEndDate,
      useLogTransform: setUseLogTransform,
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
    setSortCriteria('count');
    setSelectedDistricts(availableDistricts);
    setUseLogTransform(false);
  };

  // 定義標籤圖標和顏色
  const tabConfig = {
    trend: { icon: <LineChartIcon className="h-4 w-4" />, color: 'bg-blue-500', label: '價格趨勢' },
    trendline: { icon: <BarChart3 className="h-4 w-4" />, color: 'bg-green-500', label: '趨勢線' },
    stats: { icon: <TableIcon className="h-4 w-4" />, color: 'bg-purple-500', label: '統計資料' },
    map: { icon: <MapIcon className="h-4 w-4" />, color: 'bg-amber-500', label: '地圖檢視' },
  };

  return (
    <div className="space-y-8">
      <AnalysisSettings
        periodType={periodType}
        aggregationType={aggregationType}
        topN={topN}
        sortCriteria={sortCriteria}
        selectedDistricts={selectedDistricts}
        selectedCommunities={selectedCommunities}
        startDate={startDate}
        endDate={endDate}
        useLogTransform={useLogTransform}
        availableDistricts={availableDistricts}
        availableCommunities={availableCommunities}
        onSettingsChange={handleSettingsChange}
        onReset={handleReset}
      />

      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-0">
          <div className="px-6 pt-6 pb-0">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl gap-1">
              {Object.entries(tabConfig).map(([key, config]) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className={cn(
                    "flex items-center space-x-2 transition-all duration-300 py-2.5",
                    "data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800",
                    "data-[state=active]:shadow-sm",
                    "rounded-lg"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-full",
                    activeTab === key 
                      ? `text-white ${config.color}` 
                      : "text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600"
                  )}>
                    {config.icon}
                  </div>
                  <span>{config.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="relative">
            <AnimatePresence mode="wait">
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-10"
                >
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
                  <p className="text-gray-600 dark:text-gray-300">資料處理中...</p>
                </motion.div>
              )}
            </AnimatePresence>

            <TabsContent value="trend" className="m-0 p-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <PriceTrendChart
                  priceHistory={priceHistory}
                  selectedCommunities={selectedCommunities}
                  availableCommunities={availableCommunities}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="trendline" className="m-0 p-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <TrendLineChart
                  priceHistory={priceHistory}
                  selectedCommunities={selectedCommunities}
                  availableCommunities={availableCommunities}
                  trendLines={trendLines}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="stats" className="m-0 p-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CommunityStatsTable
                  communityStats={communityStats}
                  availableCommunities={availableCommunities}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="map" className="m-0 p-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CommunityMapView
                  locations={communityLocations}
                  selectedCommunities={selectedCommunities}
                />
              </motion.div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
