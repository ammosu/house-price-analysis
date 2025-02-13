export interface CommunityLocation {
  name: string;
  lat: number;
  lng: number;
  count: number;
  avgPrice: number;
}

export interface CommunityMapProps {
  locations: CommunityLocation[];
  selectedCommunities: string[];
}