'use client';

import React, { useCallback, useState } from 'react';
import { FileUploaderProps } from '@/types/house';
import { Upload, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const validateAndUploadFile = useCallback((file: File) => {
    setFileSize(file.size);
    
    if (file.size > MAX_FILE_SIZE) {
      alert('檔案大小不能超過 100MB');
      return;
    }

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      alert('請上傳 CSV 檔案');
      return;
    }

    setIsUploading(true);
    
    // 模擬上傳進度
    setTimeout(() => {
      onFileUpload(file);
      setIsUploading(false);
      setFileSize(null);
    }, 1000);
  }, [onFileUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length) {
      validateAndUploadFile(files[0]);
    }
  }, [validateAndUploadFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      validateAndUploadFile(files[0]);
    }
  }, [validateAndUploadFile]);

  return (
    <div
      className={cn(
        "mt-6 p-8 border-2 border-dashed rounded-xl transition-all duration-200",
        "bg-white dark:bg-gray-800 shadow-sm hover:shadow-md",
        isDragging
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : "border-gray-300 dark:border-gray-600"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className={cn(
         "p-4 rounded-full transition-transform duration-200",
         isDragging
           ? "bg-blue-100 dark:bg-blue-900/40 scale-110"
           : isUploading
             ? "bg-green-100 dark:bg-green-900/40 animate-pulse"
             : "bg-gray-100 dark:bg-gray-700"
       )}>
         {isDragging ? (
           <FileText className="w-8 h-8 text-blue-500 dark:text-blue-400" />
         ) : isUploading ? (
           <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
         ) : (
           <Upload className="w-8 h-8 text-gray-500 dark:text-gray-400" />
         )}
       </div>
       
       <div className="text-center w-full max-w-xs">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
            disabled={isUploading}
          />
          <label
            htmlFor="file-upload"
            className={cn(
              "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors duration-200",
              isUploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
            )}
          >
            {isUploading ? "上傳中..." : "選擇檔案"}
          </label>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            或將 CSV 檔案拖放至此處
          </p>
          
          {isUploading && (
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4 overflow-hidden">
              <div
                className="bg-green-500 h-2 rounded-full animate-pulse"
                style={{
                  width: '100%',
                  animation: 'progress 1s ease-in-out infinite'
                }}
              />
            </div>
          )}
          
          {fileSize && !isUploading && (
            <p className="mt-2 text-xs text-gray-500">
              檔案大小：{(fileSize / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </div>

        <div className="text-xs text-gray-400 dark:text-gray-500">
          支援的檔案格式：CSV（最大 100MB）
        </div>
      </div>
    </div>
  );
};