import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getCommunityColor } from "./utils";

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
  return (
    <div className="col-span-2 space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        選擇要分析的社區
      </label>
      <div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-white dark:bg-gray-800">
        {availableCommunities.map((community, index) => (
          <Badge
            key={community}
            variant={selectedCommunities.includes(community) ? "default" : "outline"}
            className="cursor-pointer transition-all hover:opacity-80"
            style={selectedCommunities.includes(community) ? {
              backgroundColor: `${getCommunityColor(community, availableCommunities)}1A`, // 1A = 10% opacity
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
            {community}
          </Badge>
        ))}
      </div>
    </div>
  );
};