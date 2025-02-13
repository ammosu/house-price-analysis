import HousePriceAnalyzer from '@/components/HousePriceAnalyzer';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            房價分析系統
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            上傳您的房價資料，獲得深入的市場分析
          </p>
        </div>
        <HousePriceAnalyzer />
      </div>
    </main>
  );
}