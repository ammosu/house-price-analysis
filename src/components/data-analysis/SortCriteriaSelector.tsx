import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortCriteria } from "./types";
import { SortAsc, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SortCriteriaSelectorProps {
  sortCriteria: SortCriteria;
  onSortCriteriaChange: (value: SortCriteria) => void;
}

export const SortCriteriaSelector: React.FC<SortCriteriaSelectorProps> = ({
  sortCriteria,
  onSortCriteriaChange,
}) => {
  return (
    <div className="space-y-3 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
      <div className="flex items-center space-x-2 mb-2">
        <SortAsc className="w-5 h-5 text-green-500 dark:text-green-400" />
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          社區排序條件
        </h3>
      </div>
      
      <Select
        value={sortCriteria}
        onValueChange={(value) => onSortCriteriaChange(value as SortCriteria)}
      >
        <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <SelectValue placeholder="選擇排序條件" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="count">依交易次數</SelectItem>
          <SelectItem value="mape">
            <div className="flex items-center">
              <span>依MAPE</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3.5 h-3.5 ml-1.5 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p>平均絕對百分比誤差 (Mean Absolute Percentage Error)</p>
                    <p className="text-xs text-gray-500 mt-1">衡量預測值與實際值之間的絕對誤差百分比</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </SelectItem>
          <SelectItem value="mpe_asc">
            <div className="flex items-center">
              <span>依MPE (升序)</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3.5 h-3.5 ml-1.5 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p>平均百分比誤差 (Mean Percentage Error)</p>
                    <p className="text-xs text-gray-500 mt-1">從低到高排序 (負值在前，正值在後)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </SelectItem>
          <SelectItem value="mpe_desc">
            <div className="flex items-center">
              <span>依MPE (降序)</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3.5 h-3.5 ml-1.5 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p>平均百分比誤差 (Mean Percentage Error)</p>
                    <p className="text-xs text-gray-500 mt-1">從高到低排序 (正值在前，負值在後)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        {sortCriteria === 'count' && (
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
            <span>依社區交易次數多寡排序</span>
          </div>
        )}
        {sortCriteria === 'mape' && (
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5"></span>
            <span>依預測誤差絕對值大小排序</span>
          </div>
        )}
        {sortCriteria === 'mpe_asc' && (
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></span>
            <span>依預測誤差從低到高排序 (負→正)</span>
          </div>
        )}
        {sortCriteria === 'mpe_desc' && (
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></span>
            <span>依預測誤差從高到低排序 (正→負)</span>
          </div>
        )}
      </div>
    </div>
  );
};
