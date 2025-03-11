import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarRange, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateRangeSelectorProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const months = Array.from(
    { length: 12 },
    (_, i) => String(i + 1).padStart(2, '0')
  );

  // 格式化日期顯示
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month] = dateStr.split('-');
    return `${year}年${parseInt(month)}月`;
  };

  return (
    <div className="space-y-3 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
      <div className="flex items-center space-x-2 mb-4">
        <CalendarRange className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          時間區間
        </h3>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          "px-3 py-1.5 rounded-lg text-sm",
          startDate 
            ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300" 
            : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
        )}>
          {startDate ? formatDateDisplay(startDate) : '起始日期'}
        </div>
        
        <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500 mx-2" />
        
        <div className={cn(
          "px-3 py-1.5 rounded-lg text-sm",
          endDate 
            ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300" 
            : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
        )}>
          {endDate ? formatDateDisplay(endDate) : '結束日期'}
        </div>
      </div>

      {/* 起始年月選擇 */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
          起始年月
        </label>
        <div className="flex gap-2">
          <div className="w-[120px]">
            <Select
              value={startDate ? startDate.split('-')[0] : ''}
              onValueChange={(year) => {
                const month = startDate ? startDate.split('-')[1] : '01';
                onStartDateChange(`${year}-${month}`);
              }}
            >
              <SelectTrigger className="h-9 text-sm w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="選擇年份" />
              </SelectTrigger>
              <SelectContent 
                className="w-[120px]"
                align="start"
                sideOffset={4}
                position="popper"
                side="bottom"
              >
                {years.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}年
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-[100px]">
            <Select
              value={startDate ? startDate.split('-')[1] : ''}
              onValueChange={(month) => {
                const year = startDate
                  ? startDate.split('-')[0]
                  : new Date().getFullYear().toString();
                onStartDateChange(`${year}-${month}`);
              }}
            >
              <SelectTrigger className="h-9 text-sm w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="選擇月份" />
              </SelectTrigger>
              <SelectContent 
                className="w-[100px]"
                align="start"
                sideOffset={4}
                position="popper"
                side="bottom"
              >
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {parseInt(month)}月
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 結束年月選擇 */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
          結束年月
        </label>
        <div className="flex gap-2">
          <div className="w-[120px]">
            <Select
              value={endDate ? endDate.split('-')[0] : ''}
              onValueChange={(year) => {
                const month = endDate ? endDate.split('-')[1] : '12';
                const newEndDate = `${year}-${month}`;
                if (!startDate || newEndDate >= startDate) {
                  onEndDateChange(newEndDate);
                }
              }}
            >
              <SelectTrigger className="h-9 text-sm w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="選擇年份" />
              </SelectTrigger>
              <SelectContent 
                className="w-[120px]"
                align="start"
                sideOffset={4}
                position="popper"
                side="bottom"
              >
                {years.map((year) => (
                  <SelectItem
                    key={year}
                    value={String(year)}
                    disabled={startDate ? year < parseInt(startDate.split('-')[0]) : false}
                  >
                    {year}年
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-[100px]">
            <Select
              value={endDate ? endDate.split('-')[1] : ''}
              onValueChange={(month) => {
                const year = endDate
                  ? endDate.split('-')[0]
                  : new Date().getFullYear().toString();
                const newEndDate = `${year}-${month}`;
                if (!startDate || newEndDate >= startDate) {
                  onEndDateChange(newEndDate);
                }
              }}
            >
              <SelectTrigger className="h-9 text-sm w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="選擇月份" />
              </SelectTrigger>
              <SelectContent 
                className="w-[100px]"
                align="start"
                sideOffset={4}
                position="popper"
                side="bottom"
              >
                {months.map((month) => (
                  <SelectItem
                    key={month}
                    value={month}
                    disabled={Boolean(
                      startDate &&
                      endDate?.split('-')[0] === startDate.split('-')[0] &&
                      parseInt(month) < parseInt(startDate.split('-')[1])
                    )}
                  >
                    {parseInt(month)}月
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};
