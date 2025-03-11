import { Button } from "@/components/ui/button";
import { PeriodSelector } from './PeriodSelector';
import { CommunityCountSelector } from './CommunityCountSelector';
import { DistrictSelector } from './DistrictSelector';
import { CommunitySelector } from './CommunitySelector';
import { DateRangeSelector } from './DateRangeSelector';
import { SortCriteriaSelector } from './SortCriteriaSelector';
import { LogTransformToggle } from './LogTransformToggle';
import { AnalysisSettings as AnalysisSettingsType } from './types';
import { motion } from 'framer-motion';
import { Settings, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface AnalysisSettingsProps extends AnalysisSettingsType {
  availableDistricts: string[];
  availableCommunities: string[];
  onSettingsChange: (key: keyof AnalysisSettingsType, value: any) => void;
  onReset: () => void;
}

export const AnalysisSettings: React.FC<AnalysisSettingsProps> = ({
  periodType,
  aggregationType,
  topN,
  sortCriteria,
  selectedDistricts,
  selectedCommunities,
  startDate,
  endDate,
  useLogTransform,
  availableDistricts,
  availableCommunities,
  onSettingsChange,
  onReset,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl transition-all duration-300 hover:shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
              <Settings className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                分析設定
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                自訂您的分析參數
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-1"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              <span>重置設定</span>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
        
        <motion.div 
          initial={false}
          animate={{ 
            height: isExpanded ? 'auto' : 0,
            opacity: isExpanded ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <PeriodSelector
                periodType={periodType}
                aggregationType={aggregationType}
                onPeriodTypeChange={(value) => onSettingsChange('periodType', value)}
                onAggregationTypeChange={(value) => onSettingsChange('aggregationType', value)}
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <CommunityCountSelector
                topN={topN}
                onTopNChange={(value) => onSettingsChange('topN', value)}
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <SortCriteriaSelector
                sortCriteria={sortCriteria}
                onSortCriteriaChange={(value) => onSettingsChange('sortCriteria', value)}
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="lg:col-span-2"
            >
              <DistrictSelector
                availableDistricts={availableDistricts}
                selectedDistricts={selectedDistricts}
                onDistrictsChange={(districts) => onSettingsChange('selectedDistricts', districts)}
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <LogTransformToggle
                useLogTransform={useLogTransform}
                onLogTransformChange={(value) => onSettingsChange('useLogTransform', value)}
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <DateRangeSelector
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={(date) => onSettingsChange('startDate', date)}
                onEndDateChange={(date) => onSettingsChange('endDate', date)}
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="col-span-full"
            >
              <CommunitySelector
                availableCommunities={availableCommunities}
                selectedCommunities={selectedCommunities}
                onCommunitiesChange={(communities) => onSettingsChange('selectedCommunities', communities)}
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      {!isExpanded && (
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            <div className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
              {periodType === 'month' ? '月度分析' : '季度分析'}
            </div>
            <div className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
              顯示前 {topN} 個社區
            </div>
            <div className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
              {selectedDistricts.length} 個行政區
            </div>
            {useLogTransform && (
              <div className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-full">
                使用對數轉換
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
