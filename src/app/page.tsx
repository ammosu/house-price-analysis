import HousePriceAnalyzer from '@/components/HousePriceAnalyzer';
import { Building, TrendingUp, BarChart3 } from 'lucide-react';

export default function Home() {
  return (
    <main>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl mb-6">
            <Building className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">房地產數據分析</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            社區房價分析系統
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            上傳您的社區房價資料，獲得專業的價格趨勢分析與視覺化圖表
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
              <span>趨勢預測</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <BarChart3 className="w-5 h-5 mr-2 text-green-500" />
              <span>數據視覺化</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>統計分析</span>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 dark:to-transparent rounded-3xl -z-10"></div>
          <HousePriceAnalyzer />
        </div>
      </div>
    </main>
  );
}
