'use client';

import React, { useState } from 'react';
import { Card } from '@tremor/react';
import { parse, ParseResult } from 'papaparse';
import { FileUploader } from './FileUploader';
import { DataAnalysis } from './DataAnalysis';
import { HousePriceData, ProcessedData } from '@/types/house';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, FileCheck } from "lucide-react";

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
          dynamicTyping: true,
          complete: (results: ParseResult<HousePriceData>) => {
            try {
              const cleanData = results.data.filter((row): row is HousePriceData =>
                typeof row.交易年月日 === 'number' &&
                typeof row.社區名稱 === 'string' &&
                typeof row.交易價格 === 'number'
              );

              if (cleanData.length === 0) {
                setError('無有效的資料記錄，請確認檔案格式是否正確');
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
      <Card className="bg-white dark:bg-gray-800 shadow-lg transition-all duration-200 hover:shadow-xl">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                數據上傳
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                請上傳房價交易CSV檔案以開始分析
              </p>
            </div>
            {data.length > 0 && (
              <div className="flex items-center text-green-600 dark:text-green-400">
                <FileCheck className="w-5 h-5 mr-2" />
                <span className="text-sm">已上傳 {data.length} 筆資料</span>
              </div>
            )}
          </div>

          <FileUploader onFileUpload={handleFileUpload} />

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>錯誤</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </Card>
      
      {data.length > 0 && (
        <div className="transition-all duration-500 animate-fadeIn">
          <DataAnalysis data={data} />
        </div>
      )}
    </div>
  );
};

export default HousePriceAnalyzer;