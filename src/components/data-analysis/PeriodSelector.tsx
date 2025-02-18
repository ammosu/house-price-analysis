import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PeriodSelectorProps {
  periodType: 'month' | 'quarter';
  aggregationType: 'mean' | 'median';
  onPeriodTypeChange: (value: 'month' | 'quarter') => void;
  onAggregationTypeChange: (value: 'mean' | 'median') => void;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  periodType,
  aggregationType,
  onPeriodTypeChange,
  onAggregationTypeChange,
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        分析週期
      </label>
      <div className="space-y-2">
        <Select
          value={periodType}
          onValueChange={(value) => onPeriodTypeChange(value as 'month' | 'quarter')}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="選擇分析週期" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">月度分析</SelectItem>
            <SelectItem value="quarter">季度分析</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Select
          value={aggregationType}
          onValueChange={(value) => onAggregationTypeChange(value as 'mean' | 'median')}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="選擇計算方式" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mean">平均值</SelectItem>
            <SelectItem value="median">中位數</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};