import { Card } from '@tremor/react';
import CommunityMap from '../PriceMap';
import { CommunityLocation } from './types';

interface CommunityMapViewProps {
  locations: CommunityLocation[];
  selectedCommunities: string[];
}

export const CommunityMapView: React.FC<CommunityMapViewProps> = ({
  locations,
  selectedCommunities,
}) => {
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-lg">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          社區地理分布
        </h3>
        <CommunityMap
          locations={locations}
          selectedCommunities={selectedCommunities}
        />
      </div>
    </Card>
  );
};