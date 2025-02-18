import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CommunityCountSelectorProps {
  topN: number;
  onTopNChange: (value: number) => void;
}

export const CommunityCountSelector: React.FC<CommunityCountSelectorProps> = ({
  topN,
  onTopNChange,
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        顯示社區數量
      </label>
      <Select
        value={String(topN)}
        onValueChange={(value) => onTopNChange(Number(value))}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="選擇顯示數量" />
        </SelectTrigger>
        <SelectContent>
          {[5, 10, 15, 20].map((n) => (
            <SelectItem key={n} value={String(n)}>
              顯示前 {n} 個社區
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};