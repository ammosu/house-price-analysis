import { Card } from '@tremor/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LogTransformToggleProps {
  useLogTransform: boolean;
  onLogTransformChange: (value: boolean) => void;
}

export const LogTransformToggle: React.FC<LogTransformToggleProps> = ({
  useLogTransform,
  onLogTransformChange,
}) => {
  return (
    <Card className="p-4 bg-white dark:bg-gray-800 shadow-sm">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          趨勢線模型
        </label>
        <div className="space-y-2">
          <Select
            value={useLogTransform ? "true" : "false"}
            onValueChange={(value) => onLogTransformChange(value === "true")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="選擇模型類型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="false">線性模型</SelectItem>
              <SelectItem value="true">對數模型 (log轉換)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          對數模型適合捕捉指數增長的價格趨勢
        </p>
      </div>
    </Card>
  );
};
