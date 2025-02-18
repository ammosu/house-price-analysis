import _ from 'lodash';
import { HousePriceData } from '@/types/house';
import { CommunityStats, PriceHistory } from './types';

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