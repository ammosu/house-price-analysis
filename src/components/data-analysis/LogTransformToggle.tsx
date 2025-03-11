import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart2, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface LogTransformToggleProps {
  useLogTransform: boolean;
  onLogTransformChange: (value: boolean) => void;
}

export const LogTransformToggle: React.FC<LogTransformToggleProps> = ({
  useLogTransform,
  onLogTransformChange,
}) => {
  const [showInfo, setShowInfo] = useState(false);
  
  return (
    <div className="space-y-3 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart2 className="w-5 h-5 text-amber-500 dark:text-amber-400" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            趨勢線模型
          </h3>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => setShowInfo(!showInfo)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <Info className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p>對數轉換可以處理非線性價格變化，特別適合房價呈指數增長的情況</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${useLogTransform ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {useLogTransform ? '對數模型' : '線性模型'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onLogTransformChange(false)}
            className={cn(
              "px-2 py-1 text-xs rounded-md transition-colors",
              !useLogTransform 
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium" 
                : "text-gray-500 dark:text-gray-400"
            )}
          >
            線性
          </button>
          <button
            onClick={() => onLogTransformChange(true)}
            className={cn(
              "px-2 py-1 text-xs rounded-md transition-colors",
              useLogTransform 
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 font-medium" 
                : "text-gray-500 dark:text-gray-400"
            )}
          >
            對數
          </button>
        </div>
      </div>
      
      {showInfo && (
        <div className="text-xs text-gray-500 dark:text-gray-400 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
          <p className="mb-2"><strong>對數模型 vs 線性模型:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>線性模型假設價格隨時間線性變化</li>
            <li>對數模型適合捕捉指數型增長的價格趨勢</li>
            <li>當價格變化率隨時間保持穩定時，對數模型更準確</li>
          </ul>
        </div>
      )}
      
      <div className="pt-2">
        <Select
          value={useLogTransform ? "true" : "false"}
          onValueChange={(value) => onLogTransformChange(value === "true")}
        >
          <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <SelectValue placeholder="選擇模型類型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="false">線性模型 (Linear)</SelectItem>
            <SelectItem value="true">對數模型 (Logarithmic)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
