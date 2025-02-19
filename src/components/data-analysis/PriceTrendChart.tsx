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
import { PriceHistory } from './types';
import { getCommunityColor } from './utils';

interface PriceTrendChartProps {
  priceHistory: PriceHistory[];
  selectedCommunities: string[];
  availableCommunities: string[];
}

export const PriceTrendChart: React.FC<PriceTrendChartProps> = ({
  priceHistory,
  selectedCommunities,
  availableCommunities,
}) => {
  return (
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
                  stroke={getCommunityColor(community, availableCommunities)}
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
  );
};