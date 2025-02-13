'use client';

import React, { useCallback, useState } from 'react';
import { FileUploaderProps } from '@/types/house';
import { Upload, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length) {
      onFileUpload(files[0]);
    }
  }, [onFileUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      onFileUpload(files[0]);
    }
  }, [onFileUpload]);

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
            : "bg-gray-100 dark:bg-gray-700"
        )}>
          {isDragging ? (
            <FileText className="w-8 h-8 text-blue-500 dark:text-blue-400" />
          ) : (
            <Upload className="w-8 h-8 text-gray-500 dark:text-gray-400" />
          )}
        </div>
        
        <div className="text-center">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-colors duration-200"
          >
            選擇檔案
          </label>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            或將 CSV 檔案拖放至此處
          </p>
        </div>

        <div className="text-xs text-gray-400 dark:text-gray-500">
          支援的檔案格式：CSV
        </div>
      </div>
    </div>
  );
};