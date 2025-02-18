import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DistrictSelectorProps {
  availableDistricts: string[];
  selectedDistricts: string[];
  onDistrictsChange: (districts: string[]) => void;
}

export const DistrictSelector: React.FC<DistrictSelectorProps> = ({
  availableDistricts,
  selectedDistricts,
  onDistrictsChange,
}) => {
  return (
    <div className="col-span-2 space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        選擇行政區
      </label>
      <div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-white dark:bg-gray-800">
        {availableDistricts.map((district) => (
          <Badge
            key={district}
            variant={selectedDistricts.includes(district) ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-all hover:opacity-80",
              selectedDistricts.length === 1 && 
              selectedDistricts.includes(district) && 
              "cursor-not-allowed opacity-50"
            )}
            onClick={() => {
              if (selectedDistricts.includes(district)) {
                if (selectedDistricts.length > 1) {
                  onDistrictsChange(selectedDistricts.filter(d => d !== district));
                }
              } else {
                onDistrictsChange([...selectedDistricts, district]);
              }
            }}
          >
            {district}
          </Badge>
        ))}
      </div>
    </div>
  );
};