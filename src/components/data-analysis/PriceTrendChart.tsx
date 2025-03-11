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
import { PriceHistory } from './types';
import { getCommunityColor } from './utils';
import { TrendingUp, ZoomIn, Download, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [showAverage, setShowAverage] = useState(false);
  
  // 計算所有選定社區的平均價格
  const averagePrices = priceHistory.map(period => {
    const validPrices = selectedCommunities
      .map(community => period[community])
      .filter(price => price !== undefined) as number[];
    
    return {
      period: period.period,
      average: validPrices.length > 0 
        ? validPrices.reduce((sum, price) => sum + price, 0) / validPrices.length 
        : undefined
    };
  });

  // 找出價格範圍，用於設置Y軸範圍
  const allPrices = priceHistory.flatMap(period => 
    selectedCommunities
      .map(community => period[community])
      .filter(price => price !== undefined)
  ) as number[];
  
  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) * 0.9 : 0;
  const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) * 1.1 : 0;

  // 模擬下載圖表功能
  const handleDownload = () => {
    alert('圖表已下載為PNG檔案');
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                價格趨勢圖
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                顯示各社區房價隨時間變化的趨勢
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAverage(!showAverage)}
                    className={`transition-all duration-200 ${showAverage ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' : ''}`}
                  >
                    <Info className="w-4 h-4 mr-1" />
                    平均線
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  顯示所有選定社區的平均價格趨勢
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="transition-all duration-200"
            >
              <Download className="w-4 h-4 mr-1" />
              下載圖表
            </Button>
          </div>
        </div>
        
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={priceHistory}
              margin={{ top: 10, right: 30, left: 20, bottom: 70 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis
                dataKey="period"
                angle={-45}
                textAnchor="end"
                height={60}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis
                domain={[minPrice, maxPrice]}
                label={{
                  value: '價格 (萬元)',
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: '#6B7280', fontSize: 12 }
                }}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 15px -3px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
                  padding: '10px 14px',
                  fontSize: '13px'
                }}
                formatter={(value: number) => [value.toLocaleString() + ' 萬元', '']}
                labelFormatter={(label) => `時間: ${label}`}
              />
              <Legend 
                verticalAlign="top" 
                height={36}
                wrapperStyle={{ paddingTop: '10px' }}
                formatter={(value, entry) => (
                  <span style={{ color: entry.color, fontWeight: 500, fontSize: '13px' }}>
                    {value}
                  </span>
                )}
              />
              
              {selectedCommunities.map((community, index) => (
                <Line
                  key={community}
                  type="monotone"
                  dataKey={community}
                  name={`${community} 實際價格`}
                  stroke={getCommunityColor(community, availableCommunities)}
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                  connectNulls
                  animationDuration={1000 + index * 300}
                  animationEasing="ease-in-out"
                />
              ))}
              
              {showAverage && (
                <Line
                  type="monotone"
                  dataKey="average"
                  data={averagePrices}
                  name="平均價格"
                  stroke="#888888"
                  strokeWidth={2.5}
                  strokeDasharray="5 5"
                  dot={false}
                  connectNulls
                  animationDuration={1500}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {selectedCommunities.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
          >
            <div className="text-center p-6 rounded-lg">
              <ZoomIn className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                尚未選擇社區
              </h4>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                請在分析設定中選擇要顯示的社區，以查看價格趨勢圖
              </p>
            </div>
          </motion.div>
        )}
      </div>
      
      {selectedCommunities.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700">
          <div className="flex flex-wrap gap-3">
            {selectedCommunities.map(community => (
              <div 
                key={community}
                className="flex items-center text-xs font-medium"
                style={{ color: getCommunityColor(community, availableCommunities) }}
              >
                <div 
                  className="w-3 h-3 rounded-full mr-1.5"
                  style={{ backgroundColor: getCommunityColor(community, availableCommunities) }}
                />
                {community}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
