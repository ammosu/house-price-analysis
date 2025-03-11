import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  return (
    <div className="flex flex-col gap-4">
      {/* 起始年月選擇 */}
      <div className="flex-1 space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
              <SelectTrigger className="h-10 text-base w-full">
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
              <SelectTrigger className="h-10 text-base w-full">
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
      <div className="flex-1 space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
              <SelectTrigger className="h-10 text-base w-full">
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
              <SelectTrigger className="h-10 text-base w-full">
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
