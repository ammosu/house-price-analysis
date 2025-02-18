import { HousePriceData } from '@/types/house';

export interface CommunityStats {
  name: string;
  count: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  trendSlope: number;
  r2Score: number;
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
  selectedDistricts: string[];
  selectedCommunities: string[];
  startDate: string;
  endDate: string;
}

export interface TrendLineData {
  slope: number;
  intercept: number;
  r2: number;
}

export type TrendLines = {
  [key: string]: TrendLineData;
};