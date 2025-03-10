import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortCriteria } from "./types";

interface SortCriteriaSelectorProps {
  sortCriteria: SortCriteria;
  onSortCriteriaChange: (value: SortCriteria) => void;
}

export const SortCriteriaSelector: React.FC<SortCriteriaSelectorProps> = ({
  sortCriteria,
  onSortCriteriaChange,
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        社區排序條件
      </label>
      <Select
        value={sortCriteria}
        onValueChange={(value) => onSortCriteriaChange(value as SortCriteria)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="選擇排序條件" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="count">依交易次數</SelectItem>
          <SelectItem value="mape">依MAPE (平均絕對百分比誤差)</SelectItem>
          <SelectItem value="mpe">依MPE (平均百分比誤差)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
