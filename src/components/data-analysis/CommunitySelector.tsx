import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getCommunityColor } from "./utils";
import { Building, Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface CommunitySelectorProps {
  availableCommunities: string[];
  selectedCommunities: string[];
  onCommunitiesChange: (communities: string[]) => void;
}

export const CommunitySelector: React.FC<CommunitySelectorProps> = ({
  availableCommunities,
  selectedCommunities,
  onCommunitiesChange,
}) => {
  const selectAll = () => {
    onCommunitiesChange([...availableCommunities]);
  };

  const deselectAll = () => {
    onCommunitiesChange([]);
  };

  return (
    <div className="space-y-3 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Building className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            選擇要分析的社區
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={selectAll}
            className="h-7 px-2 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <Check className="w-3 h-3 mr-1" />
            全選
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={deselectAll}
            className="h-7 px-2 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <X className="w-3 h-3 mr-1" />
            清除
          </Button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 p-4 border border-gray-100 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 min-h-[100px] max-h-[200px] overflow-y-auto">
        {availableCommunities.map((community, index) => (
          <motion.div
            key={community}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
          >
            <Badge
              variant={selectedCommunities.includes(community) ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-all duration-200 px-3 py-1.5 text-sm font-medium",
                selectedCommunities.includes(community) 
                  ? "hover:shadow-md transform hover:-translate-y-0.5" 
                  : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
              )}
              style={selectedCommunities.includes(community) ? {
                backgroundColor: `${getCommunityColor(community, availableCommunities)}20`, // 20 = 12% opacity
                color: getCommunityColor(community, availableCommunities),
                borderColor: getCommunityColor(community, availableCommunities)
              } : {
                borderColor: getCommunityColor(community, availableCommunities),
                color: getCommunityColor(community, availableCommunities)
              }}
              onClick={() => {
                if (selectedCommunities.includes(community)) {
                  onCommunitiesChange(selectedCommunities.filter(c => c !== community));
                } else {
                  onCommunitiesChange([...selectedCommunities, community]);
                }
              }}
            >
              {selectedCommunities.includes(community) && (
                <Check className="w-3 h-3 mr-1 inline-block" />
              )}
              {community}
            </Badge>
          </motion.div>
        ))}
        
        {availableCommunities.length === 0 && (
          <div className="w-full h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            無可用社區資料
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 px-1">
        <div>已選擇: {selectedCommunities.length} / {availableCommunities.length}</div>
        {selectedCommunities.length > 0 && (
          <div className="flex items-center">
            <span className="mr-2">已選社區:</span>
            <div className="flex space-x-1 overflow-hidden max-w-[200px]">
              {selectedCommunities.slice(0, 3).map((community, index) => (
                <div 
                  key={community}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getCommunityColor(community, availableCommunities) }}
                />
              ))}
              {selectedCommunities.length > 3 && (
                <span>+{selectedCommunities.length - 3}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
