import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";

interface CommunityCountSelectorProps {
  topN: number;
  onTopNChange: (value: number) => void;
}

export const CommunityCountSelector: React.FC<CommunityCountSelectorProps> = ({
  topN,
  onTopNChange,
}) => {
  const [inputValue, setInputValue] = useState(String(topN));
  
  // Handle direct input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 80) {
      onTopNChange(numValue);
    }
  };
  
  // Handle blur event to validate and correct the input
  const handleBlur = () => {
    let numValue = parseInt(inputValue, 10);
    
    if (isNaN(numValue)) {
      numValue = topN; // Revert to previous valid value
    } else {
      // Clamp value between 1 and 80
      numValue = Math.max(1, Math.min(80, numValue));
    }
    
    setInputValue(String(numValue));
    onTopNChange(numValue);
  };
  
  // Handle increment/decrement buttons
  const increment = () => {
    if (topN < 80) {
      const newValue = topN + 1;
      setInputValue(String(newValue));
      onTopNChange(newValue);
    }
  };
  
  const decrement = () => {
    if (topN > 1) {
      const newValue = topN - 1;
      setInputValue(String(newValue));
      onTopNChange(newValue);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        顯示社區數量
      </label>
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-9 w-9" 
          onClick={decrement}
          disabled={topN <= 1}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <div className="relative flex-1">
          <input
            type="number"
            min="1"
            max="80"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
          />
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-9 w-9" 
          onClick={increment}
          disabled={topN >= 80}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        顯示前 {topN} 個社區 (最多 80)
      </p>
    </div>
  );
};
