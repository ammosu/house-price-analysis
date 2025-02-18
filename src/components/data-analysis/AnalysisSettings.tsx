import { Card } from '@tremor/react';
import { Button } from "@/components/ui/button";
import { PeriodSelector } from './PeriodSelector';
import { CommunityCountSelector } from './CommunityCountSelector';
import { DistrictSelector } from './DistrictSelector';
import { CommunitySelector } from './CommunitySelector';
import { DateRangeSelector } from './DateRangeSelector';
import { AnalysisSettings as AnalysisSettingsType } from './types';

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
  selectedDistricts,
  selectedCommunities,
  startDate,
  endDate,
  availableDistricts,
  availableCommunities,
  onSettingsChange,
  onReset,
}) => {
  return (
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
            onClick={onReset}
            className="transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            重置設定
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <PeriodSelector
            periodType={periodType}
            aggregationType={aggregationType}
            onPeriodTypeChange={(value) => onSettingsChange('periodType', value)}
            onAggregationTypeChange={(value) => onSettingsChange('aggregationType', value)}
          />

          <CommunityCountSelector
            topN={topN}
            onTopNChange={(value) => onSettingsChange('topN', value)}
          />

          <DistrictSelector
            availableDistricts={availableDistricts}
            selectedDistricts={selectedDistricts}
            onDistrictsChange={(districts) => onSettingsChange('selectedDistricts', districts)}
          />

          <CommunitySelector
            availableCommunities={availableCommunities}
            selectedCommunities={selectedCommunities}
            onCommunitiesChange={(communities) => onSettingsChange('selectedCommunities', communities)}
          />

          <DateRangeSelector
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={(date) => onSettingsChange('startDate', date)}
            onEndDateChange={(date) => onSettingsChange('endDate', date)}
          />
        </div>
      </div>
    </Card>
  );
};