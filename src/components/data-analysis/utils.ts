import _ from 'lodash';
import { HousePriceData } from '@/types/house';
import { CommunityStats, PriceHistory } from './types';

export const getCommunityColor = (community: string, availableCommunities: string[]) => {
  const index = availableCommunities.indexOf(community);
  if (index === -1) return 'hsl(0, 0%, 50%)'; // 預設顏色
  return `hsl(${(index * 360) / availableCommunities.length}, 70%, 50%)`;
};

export const formatDate = (dateStr: string, periodType: 'month' | 'quarter'): string => {
  const year = dateStr.slice(0, 4);
  const month = parseInt(dateStr.slice(4, 6));
  return periodType === 'month'
    ? `${year}-${month.toString().padStart(2, '0')}`
    : `${year}-Q${Math.ceil(month / 3)}`;
};

export const calculateTrendLine = (
  prices: number[],
  timePoints: string[],
  periodType: 'month' | 'quarter',
  useLogTransform: boolean = false // 新增參數控制是否使用對數轉換
) => {
  if (prices.length < 2) return { slope: 0, intercept: 0, r2: 0, isLogTransformed: useLogTransform };

  // 過濾掉零值或負值（對數轉換不能用於這些值）
  const validIndices = prices.map((p, i) => useLogTransform && p <= 0 ? -1 : i).filter(i => i >= 0);
  const validPrices = validIndices.map(i => prices[i]);
  const validTimePoints = validIndices.map(i => timePoints[i]);
  
  if (validPrices.length < 2) return { slope: 0, intercept: 0, r2: 0, isLogTransformed: useLogTransform };

  // 對價格進行對數轉換（如果啟用）
  const transformedPrices = useLogTransform 
    ? validPrices.map(p => Math.log(p)) 
    : validPrices;

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

  const timeValues = validTimePoints.map(convertTimeToMonths);
  
  if (timeValues.some(t => isNaN(t))) {
    console.error('Invalid time values found:', validTimePoints);
    return { slope: 0, intercept: 0, r2: 0, isLogTransformed: useLogTransform };
  }

  const minTime = Math.min(...timeValues);
  const relativeTime = timeValues.map(t => t - minTime);

  const n = transformedPrices.length;
  const sumX = relativeTime.reduce((a, b) => a + b, 0);
  const sumY = transformedPrices.reduce((a, b) => a + b, 0);
  const sumXY = relativeTime.reduce((sum, x, i) => sum + x * transformedPrices[i], 0);
  const sumXX = relativeTime.reduce((sum, x) => sum + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const yMean = sumY / n;
  const ssTotal = transformedPrices.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
  const ssResidual = transformedPrices.reduce((sum, y, i) => {
    const yPred = slope * relativeTime[i] + intercept;
    return sum + Math.pow(y - yPred, 2);
  }, 0);
  const r2 = 1 - ssResidual / ssTotal;

  return { 
    slope, 
    intercept, 
    r2,
    isLogTransformed: useLogTransform // 添加標記表示是否使用了對數轉換
  };
};

export const processHistoryData = (
  rawData: HousePriceData[],
  communities: string[],
  periodType: 'month' | 'quarter',
  aggregationType: 'mean' | 'median'
): PriceHistory[] => {
  const processedData = rawData.map(d => ({
    ...d,
    periodValue: formatDate(String(d.交易年月日), periodType),
    價格: d.交易價格
  }));

  const groupedData = _.chain(processedData)
    .filter(d => communities.includes(d.社區名稱))
    .groupBy('periodValue')
    .map((group, periodValue) => {
      const periodData: any = { period: periodValue };
      
      communities.forEach(community => {
        const communityData = group.filter(d => d.社區名稱 === community);
        if (communityData.length > 0) {
          periodData[community] = aggregationType === 'mean'
            ? _.meanBy(communityData, '價格')
            : communityData.length % 2 === 0
              ? _.orderBy(communityData, ['價格'], ['asc'])[Math.floor(communityData.length / 2)].價格
              : _.orderBy(communityData, ['價格'], ['asc'])[Math.floor(communityData.length / 2)].價格;
        }
      });
      
      return periodData;
    })
    .orderBy(['period'], ['asc'])
    .value();

  return groupedData;
};

export const calculateBasicStats = (filteredData: HousePriceData[]) => {
  return _.chain(filteredData)
    .groupBy('社區名稱')
    .map((group, name) => {
      // 計算每個項目的誤差百分比
      const errorPercentages = group.map(item => {
        const actualValue = item.交易價格;
        const estimatedValue = item.估值;
        // 避免除以零的情況
        if (estimatedValue === 0) return { ape: 0, pe: 0 };
        
        // 計算絕對百分比誤差和百分比誤差
        const ape = Math.abs(actualValue - estimatedValue) / estimatedValue;
        const pe = (actualValue - estimatedValue) / estimatedValue;
        return { ape, pe };
      });
      
      // 計算MAPE和MPE
      const mape = _.meanBy(errorPercentages, 'ape');
      const mpe = _.meanBy(errorPercentages, 'pe');
      
      return {
        name,
        count: group.length,
        avgPrice: _.meanBy(group, '交易價格'),
        minPrice: _.minBy(group, '交易價格')?.交易價格 || 0,
        maxPrice: _.maxBy(group, '交易價格')?.交易價格 || 0,
        mape: mape || 0,
        mpe: mpe || 0
      };
    })
    .value();
};
