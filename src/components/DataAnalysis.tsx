'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@tremor/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, BarChart3, LineChart as LineChartIcon, Table as TableIcon } from "lucide-react";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import _ from 'lodash';
import { HousePriceData } from '@/types/house';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DataAnalysisProps {
  data: HousePriceData[];
}

interface CommunityStats {
  name: string;
  count: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  trendSlope: number;
  r2Score: number;
}

interface PriceHistory {
  period: string;
  [key: string]: number | string;
}

const formatDate = (dateStr: string, periodType: 'month' | 'quarter'): string => {
  const year = dateStr.slice(0, 4);
  const month = parseInt(dateStr.slice(4, 6));
  return periodType === 'month'
    ? `${year}-${month.toString().padStart(2, '0')}`
    : `${year}-Q${Math.ceil(month / 3)}`;
};

const calculateTrendLine = (
  prices: number[],
  timePoints: string[],
  periodType: 'month' | 'quarter'
) => {
  if (prices.length < 2) return { slope: 0, intercept: 0, r2: 0 };

  const convertTimeToMonths = (timeStr: string): number => {
    const parts = timeStr.split('-');
    const year = parseInt(parts[0]);
    if (periodType === 'month') {
      const month = parseInt(parts[1]);
      return year * 12 + month - 1;
    } else {
      const quarter = parseInt(parts[1].substring(1));
      return year * 12 + (quarter - 1) * 3;
    }
  };

  const timeValues = timePoints.map(convertTimeToMonths);
  
  if (timeValues.some(t => isNaN(t))) {
    console.error('Invalid time values found:', timePoints);
    return { slope: 0, intercept: 0, r2: 0 };
  }

  const minTime = Math.min(...timeValues);
  const relativeTime = timeValues.map(t => t - minTime);

  const n = prices.length;
  const sumX = relativeTime.reduce((a, b) => a + b, 0);
  const sumY = prices.reduce((a, b) => a + b, 0);
  const sumXY = relativeTime.reduce((sum, x, i) => sum + x * prices[i], 0);
  const sumXX = relativeTime.reduce((sum, x) => sum + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const yMean = sumY / n;
  const ssTotal = prices.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
  const ssResidual = prices.reduce((sum, y, i) => {
    const yPred = slope * relativeTime[i] + intercept;
    return sum + Math.pow(y - yPred, 2);
  }, 0);
  const r2 = 1 - ssResidual / ssTotal;

  return { slope, intercept, r2 };
};

const processHistoryData = (
  rawData: HousePriceData[],
  communities: string[],
  periodType: 'month' | 'quarter'
): PriceHistory[] => {
  // 先轉換日期格式
  const processedData = rawData.map(d => ({
    ...d,
    periodValue: formatDate(String(d.交易年月日), periodType),
    價格: d.交易價格
  }));

  // 按期間和社區分組計算平均價格
  const groupedData = _.chain(processedData)
    .filter(d => communities.includes(d.社區名稱))
    .groupBy('periodValue')
    .map((group, periodValue) => {
      const periodData: any = { period: periodValue };
      
      // 為每個社區計算該期間的平均價格
      communities.forEach(community => {
        const communityData = group.filter(d => d.社區名稱 === community);
        if (communityData.length > 0) {
          periodData[community] = _.meanBy(communityData, '價格');
        }
      });
      
      return periodData;
    })
    .orderBy(['period'], ['asc'])
    .value();

  return groupedData;
};

export const DataAnalysis: React.FC<DataAnalysisProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState('trend');
  const [periodType, setPeriodType] = useState<'month' | 'quarter'>('month');
  const [topN, setTopN] = useState(5);
  const [communityStats, setCommunityStats] = useState<CommunityStats[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  const [availableCommunities, setAvailableCommunities] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [trendLines, setTrendLines] = useState<{ [key: string]: { slope: number; intercept: number; r2: number } }>({});

  // 計算基本統計資料
  const calculateBasicStats = (filteredData: HousePriceData[]) => {
    return _.chain(filteredData)
      .groupBy('社區名稱')
      .map((group, name) => ({
        name,
        count: group.length,
        avgPrice: _.meanBy(group, '交易價格'),
        minPrice: _.minBy(group, '交易價格')?.交易價格 || 0,
        maxPrice: _.maxBy(group, '交易價格')?.交易價格 || 0
      }))
      .orderBy(['count'], ['desc'])
      .value();
  };

  const processData = () => {
    // 確保資料存在
    if (!data || data.length === 0) {
      console.log('No data available');
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
    
    // 確保過濾後還有資料
    if (filteredData.length === 0) {
      console.log('No data after filtering');
      return;
    }

    // 計算基本統計資料
    const basicStats = calculateBasicStats(filteredData);

    // 處理時間序列數據
    const history = processHistoryData(filteredData, selectedCommunities, periodType);
    setPriceHistory(history);

    // 計算每個社區的趨勢線
    const trends: { [key: string]: { slope: number; intercept: number; r2: number } } = {};
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
  };

  useEffect(() => {
    processData();
  }, [data, periodType, startDate, endDate, topN, selectedCommunities]);

  // 初始化行政區列表
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    // 獲取所有不重複的行政區
    const districts = Array.from(new Set(data.map(d => d.行政區))).sort();
    setAvailableDistricts(districts);
    
    // 預設選擇所有行政區
    if (selectedDistricts.length === 0) {
      setSelectedDistricts(districts);
    }
  }, [data]);

  // 當行政區變化時更新社區列表
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    // 根據選擇的行政區過濾資料
    const filteredData = selectedDistricts.length > 0
      ? data.filter(d => selectedDistricts.includes(d.行政區))
      : data;
    
    // 重新計算各社區的統計資料並排序
    const basicStats = calculateBasicStats(filteredData);
    const newAvailable = basicStats.slice(0, topN).map(s => s.name);
    setAvailableCommunities(newAvailable);
    
    // 當行政區變化時，直接選擇所有新的TOP-K社區
    setSelectedCommunities(newAvailable);
  }, [data, selectedDistricts, topN]);

  return (
    <div className="space-y-6">
      {/* 控制面板 */}
      <Card className="bg-white dark:bg-gray-800 shadow-lg transition-all duration-200 hover:shadow-xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                分析設定
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                自訂您的分析參數
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setSelectedCommunities([]);
                setPeriodType('month');
                setTopN(5);
                setSelectedDistricts(availableDistricts); // 重置為全選
              }}
              className="transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              重置設定
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 分析週期選擇 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                分析週期
              </label>
              <Select
                value={periodType}
                onValueChange={(value) => setPeriodType(value as 'month' | 'quarter')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="選擇分析週期" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">月度分析</SelectItem>
                  <SelectItem value="quarter">季度分析</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 顯示社區數量選擇 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                顯示社區數量
              </label>
              <Select
                value={String(topN)}
                onValueChange={(value) => {
                  setTopN(Number(value));
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="選擇顯示數量" />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 15, 20].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      顯示前 {n} 個社區
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
{/* 行政區選擇 */}
<div className="col-span-2 space-y-2">
  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
    選擇行政區
  </label>
  <div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-white dark:bg-gray-800">
    {availableDistricts.map((district, index) => (
      <Badge
        key={district}
        variant={selectedDistricts.includes(district) ? "default" : "outline"}
        className={cn(
          "cursor-pointer transition-all hover:opacity-80",
          selectedDistricts.length === 1 && selectedDistricts.includes(district) && "cursor-not-allowed opacity-50"
        )}
        onClick={() => {
          if (selectedDistricts.includes(district)) {
            if (selectedDistricts.length > 1) { // 確保至少保留一個行政區
              setSelectedDistricts(selectedDistricts.filter(d => d !== district));
            }
          } else {
            setSelectedDistricts([...selectedDistricts, district]);
          }
        }}
      >
        {district}
      </Badge>
    ))}
  </div>
</div>

{/* 社區選擇 */}
<div className="col-span-2 space-y-2">
  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
    選擇要分析的社區
  </label>
  <div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-white dark:bg-gray-800">
    {availableCommunities.map((community, index) => (
      <Badge
        key={community}
        variant={selectedCommunities.includes(community) ? "default" : "outline"}
        className="cursor-pointer transition-all hover:opacity-80"
        style={selectedCommunities.includes(community) ? {
          backgroundColor: `hsl(${(index * 360) / availableCommunities.length}, 70%, 50%, 0.1)`,
          color: `hsl(${(index * 360) / availableCommunities.length}, 70%, 50%)`,
          borderColor: `hsl(${(index * 360) / availableCommunities.length}, 70%, 50%)`
        } : {
          borderColor: `hsl(${(index * 360) / availableCommunities.length}, 70%, 50%)`,
          color: `hsl(${(index * 360) / availableCommunities.length}, 70%, 50%)`
        }}
        onClick={() => {
          if (selectedCommunities.includes(community)) {
            setSelectedCommunities(selectedCommunities.filter(c => c !== community));
          } else {
            setSelectedCommunities([...selectedCommunities, community]);
          }
        }}
      >
        {community}
      </Badge>
    ))}
  </div>
</div>

            {/* 起始日期選擇 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                起始日期
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(new Date(startDate), 'yyyy年MM月') : '選擇起始日期'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate ? new Date(startDate) : undefined}
                    onSelect={(date) => date && setStartDate(format(date, 'yyyy-MM'))}
                    initialFocus
                    locale={zhTW}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* 結束日期選擇 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                結束日期
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(new Date(endDate), 'yyyy年MM月') : '選擇結束日期'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={endDate ? new Date(endDate) : undefined}
                    onSelect={(date) => date && setEndDate(format(date, 'yyyy-MM'))}
                    initialFocus
                    locale={zhTW}
                    disabled={(date) =>
                      startDate ? date < new Date(startDate) : false
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

        </div>
      </Card>

      {/* 分析內容標籤頁 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="trend" className="space-x-2">
            <LineChartIcon className="h-4 w-4" />
            <span>價格趨勢</span>
          </TabsTrigger>
          <TabsTrigger value="trendline" className="space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>趨勢線</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="space-x-2">
            <TableIcon className="h-4 w-4" />
            <span>統計資料</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trend" className="space-y-6">
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                價格趨勢圖
              </h3>
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="period"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      tick={{ fill: '#6B7280' }}
                    />
                    <YAxis
                      label={{
                        value: '價格',
                        angle: -90,
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fill: '#6B7280' }
                      }}
                      tick={{ fill: '#6B7280' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    {selectedCommunities.map((community, index) => (
                      <Line
                        key={community}
                        type="monotone"
                        dataKey={community}
                        name={`${community} 實際價格`}
                        stroke={`hsl(${(index * 360) / selectedCommunities.length}, 70%, 50%)`}
                        strokeWidth={2}
                        dot={{ r: 4, strokeWidth: 2 }}
                        activeDot={{ r: 6, strokeWidth: 2 }}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="trendline" className="space-y-6">
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                價格趨勢線分析
              </h3>
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="period"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      tick={{ fill: '#6B7280' }}
                    />
                    <YAxis
                      label={{
                        value: '價格',
                        angle: -90,
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fill: '#6B7280' }
                      }}
                      tick={{ fill: '#6B7280' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    {selectedCommunities.map((community, index) => {
                      const trend = trendLines[community];
                      if (!trend) return null;

                      const color = `hsl(${(index * 360) / selectedCommunities.length}, 70%, 50%)`;
                      return (
                        <Line
                          key={community}
                          type="linear"
                          dataKey={`${community}_trend`}
                          name={`${community} 趨勢線 (斜率: ${trend.slope.toFixed(2)}, R²: ${trend.r2.toFixed(2)})`}
                          stroke={color}
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={false}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <Card className="bg-white dark:bg-gray-800 shadow-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                社區統計資料
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        社區名稱
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        交易次數
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        平均價格
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        最低價格
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        最高價格
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        趨勢斜率
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        R² 值
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {communityStats.map((stat, index) => (
                      <tr
                        key={stat.name}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: `hsl(${(index * 360) / communityStats.length}, 70%, 50%)`
                              }}
                            />
                            <span>{stat.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {stat.count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {stat.avgPrice.toLocaleString('zh-TW')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {stat.minPrice.toLocaleString('zh-TW')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {stat.maxPrice.toLocaleString('zh-TW')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              stat.trendSlope > 0
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            )}
                          >
                            {stat.trendSlope.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {stat.r2Score.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};