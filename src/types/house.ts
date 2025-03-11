export interface HousePriceData {
    交易年月日: string;
    社區名稱: string;
    交易價格: number;
    估值: number;
    縣市: string;
    行政區: string;
    緯度: number;
    經度: number;
    地址: string;
  }
  
  export interface ProcessedData {
    communityStats: {
      name: string;
      count: number;
      avgPrice: number;
      minPrice: number;
      maxPrice: number;
    }[];
    priceHistory: {
      period: string;
      prices: { [community: string]: number };
    }[];
  }
  
  export interface FileUploaderProps {
    onFileUpload: (file: File) => void;
  }
