import { Card } from '@tremor/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { PriceHistory, TrendLines } from './types';
import { getCommunityColor } from './utils';

interface TrendLineChartProps {
  priceHistory: PriceHistory[];
  selectedCommunities: string[];
  availableCommunities: string[];
  trendLines: TrendLines;
}

export const TrendLineChart: React.FC<TrendLineChartProps> = ({
  priceHistory,
  selectedCommunities,
  availableCommunities,
  trendLines,
}) => {
  return (
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

                const color = getCommunityColor(community, availableCommunities);
                return (
                  <Line
                    key={community}
                    type="linear"
                    dataKey={`${community}_trend`}
                    name={`${community} 趨勢線 ${trend.isLogTransformed ? '(log模型)' : ''} (斜率: ${trend.slope.toFixed(2)}, R²: ${trend.r2.toFixed(2)})`}
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
  );
};
