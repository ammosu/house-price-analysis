'use client';

import React, { useState } from 'react';
import { parse, ParseResult } from 'papaparse';
import { FileUploader } from './FileUploader';
import { DataAnalysis } from './DataAnalysis';
import { HousePriceData, ProcessedData } from '@/types/house';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, FileCheck, Database, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const HousePriceAnalyzer: React.FC = () => {
  const [data, setData] = useState<HousePriceData[]>([]);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        parse<HousePriceData>(event.target.result as string, {
          header: true,
          dynamicTyping: {
            // 除了交易年月日外，其他數字欄位仍然自動轉換
            交易年月日: false,
            交易價格: true,
            估值: true,
            緯度: true,
            經度: true
          },
          complete: (results: ParseResult<HousePriceData>) => {
            try {
              const cleanData = results.data.filter((row): row is HousePriceData =>
                typeof row.交易年月日 === 'string' &&
                typeof row.社區名稱 === 'string' &&
                typeof row.交易價格 === 'number'
              );

              if (cleanData.length === 0) {
                setError('無有效的資料記錄，請確認檔案格式是否正確');
                setIsLoading(false);
                return;
              }

              setData(cleanData);
              setIsLoading(false);
            } catch (err) {
              setError('資料處理過程發生錯誤');
              setIsLoading(false);
            }
          },
          error: (error: Error) => {
            console.error('Error parsing CSV file:', error.message);
            setError('檔案解析失敗，請確認是否為有效的CSV檔案');
            setIsLoading(false);
          }
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl transition-all duration-300 hover:shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  資料上傳
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  請上傳房價交易CSV檔案以開始分析
                </p>
              </div>
            </div>
            
            <AnimatePresence>
              {data.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center px-3 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full"
                >
                  <FileCheck className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">已上傳 {data.length} 筆資料</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <FileUploader onFileUpload={handleFileUpload} />

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Alert variant="destructive" className="mt-4 border border-red-200 dark:border-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>錯誤</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {data.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              資料已準備就緒，可以開始分析
            </div>
            <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
              <span>查看分析結果</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        )}
      </div>
      
      <AnimatePresence>
        {data.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="transition-all duration-500"
          >
            <DataAnalysis data={data} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HousePriceAnalyzer;
