import { cn } from '@/lib/utils';
import { CommunityStats } from './types';
import { getCommunityColor } from './utils';
import { Table, TableIcon, ArrowUpDown, Search, Download, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CommunityStatsTableProps {
  communityStats: CommunityStats[];
  availableCommunities: string[];
}

type SortField = 'name' | 'count' | 'avgPrice' | 'minPrice' | 'maxPrice' | 'mape' | 'mpe' | 'trendSlope' | 'r2Score';
type SortDirection = 'asc' | 'desc';

export const CommunityStatsTable: React.FC<CommunityStatsTableProps> = ({
  communityStats,
  availableCommunities,
}) => {
  const [sortField, setSortField] = useState<SortField>('count');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  
  // 處理排序
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // 排序和過濾資料
  const sortedAndFilteredStats = [...communityStats]
    .filter(stat => stat.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else {
        const aValue = a[sortField];
        const bValue = b[sortField];
        comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  
  // 模擬下載功能
  const handleDownload = () => {
    alert('統計資料已下載為CSV檔案');
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
              <TableIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                社區統計資料
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                各社區房價統計與趨勢分析
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜尋社區..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="transition-all duration-200"
            >
              <Download className="w-4 h-4 mr-1" />
              下載資料
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th 
                  className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>社區名稱</span>
                    {sortField === 'name' && (
                      <ArrowUpDown className={`w-3.5 h-3.5 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => handleSort('count')}
                >
                  <div className="flex items-center space-x-1">
                    <span>交易次數</span>
                    {sortField === 'count' && (
                      <ArrowUpDown className={`w-3.5 h-3.5 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => handleSort('avgPrice')}
                >
                  <div className="flex items-center space-x-1">
                    <span>平均價格</span>
                    {sortField === 'avgPrice' && (
                      <ArrowUpDown className={`w-3.5 h-3.5 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => handleSort('minPrice')}
                >
                  <div className="flex items-center space-x-1">
                    <span>最低價格</span>
                    {sortField === 'minPrice' && (
                      <ArrowUpDown className={`w-3.5 h-3.5 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => handleSort('maxPrice')}
                >
                  <div className="flex items-center space-x-1">
                    <span>最高價格</span>
                    {sortField === 'maxPrice' && (
                      <ArrowUpDown className={`w-3.5 h-3.5 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => handleSort('mape')}
                >
                  <div className="flex items-center space-x-1">
                    <span>MAPE</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3 h-3 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p>平均絕對百分比誤差</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {sortField === 'mape' && (
                      <ArrowUpDown className={`w-3.5 h-3.5 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => handleSort('mpe')}
                >
                  <div className="flex items-center space-x-1">
                    <span>MPE</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3 h-3 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p>平均百分比誤差</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {sortField === 'mpe' && (
                      <ArrowUpDown className={`w-3.5 h-3.5 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => handleSort('trendSlope')}
                >
                  <div className="flex items-center space-x-1">
                    <span>趨勢斜率</span>
                    {sortField === 'trendSlope' && (
                      <ArrowUpDown className={`w-3.5 h-3.5 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => handleSort('r2Score')}
                >
                  <div className="flex items-center space-x-1">
                    <span>R² 值</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3 h-3 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p>決定係數，衡量趨勢線與實際資料的擬合程度</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {sortField === 'r2Score' && (
                      <ArrowUpDown className={`w-3.5 h-3.5 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedAndFilteredStats.map((stat, index) => (
                <motion.tr
                  key={stat.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: getCommunityColor(stat.name, availableCommunities)
                        }}
                      />
                      <span>{stat.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {stat.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {stat.avgPrice.toLocaleString('zh-TW')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {stat.minPrice.toLocaleString('zh-TW')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {stat.maxPrice.toLocaleString('zh-TW')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      stat.mape > 0.1
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    )}>
                      {(stat.mape * 100).toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      stat.mpe > 0
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                    )}>
                      {(stat.mpe * 100).toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        stat.trendSlope > 0
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      )}
                    >
                      {stat.trendSlope.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        stat.r2Score > 0.7
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : stat.r2Score > 0.4
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      )}
                    >
                      {stat.r2Score.toFixed(2)}
                    </span>
                  </td>
                </motion.tr>
              ))}
              
              {sortedAndFilteredStats.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                    {searchTerm ? '沒有符合搜尋條件的社區' : '尚無社區統計資料'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
        <div>共 {sortedAndFilteredStats.length} 個社區</div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
            <span>上漲趨勢</span>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></span>
            <span>下跌趨勢</span>
          </div>
        </div>
      </div>
    </div>
  );
};
