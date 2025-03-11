import { HousePriceData } from '@/types/house';

// 添加排序條件類型
export type SortCriteria = 'count' | 'mape' | 'mpe';

export interface CommunityStats {
  name: string;
  count: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  trendSlope: number;
  r2Score: number;
  mape: number; // 添加MAPE字段
  mpe: number;  // 添加MPE字段
}

export interface PriceHistory {
  period: string;
  [key: string]: number | string;
}

export interface CommunityLocation {
  name: string;
  lat: number;
  lng: number;
  count: number;
  avgPrice: number;
}

export interface DataAnalysisProps {
  data: HousePriceData[];
}

export interface AnalysisSettings {
  periodType: 'month' | 'quarter';
  aggregationType: 'mean' | 'median';
  topN: number;
  sortCriteria: SortCriteria; // 新增排序條件
  selectedDistricts: string[];
  selectedCommunities: string[];
  startDate: string;
  endDate: string;
  useLogTransform: boolean; // 新增：是否使用對數轉換
}

export interface TrendLineData {
  slope: number;
  intercept: number;
  r2: number;
  isLogTransformed?: boolean;
}

export type TrendLines = {
  [key: string]: TrendLineData;
};
