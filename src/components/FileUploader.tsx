'use client';

import React, { useCallback, useState } from 'react';
import { FileUploaderProps } from '@/types/house';
import { Upload, FileText, FileSpreadsheet, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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
    setError(null);
    setFileSize(file.size);
    setFileName(file.name);
    
    if (file.size > MAX_FILE_SIZE) {
      setError('檔案大小不能超過 100MB');
      return;
    }

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('請上傳 CSV 檔案');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    // 模擬上傳進度
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onFileUpload(file);
            setIsUploading(false);
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 100);
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
        "relative overflow-hidden mt-6 p-8 border-2 border-dashed rounded-xl transition-all duration-300",
        "bg-white dark:bg-gray-800 shadow-sm hover:shadow-md",
        isDragging
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : error
            ? "border-red-300 dark:border-red-700"
            : isUploading
              ? "border-green-300 dark:border-green-700"
              : "border-gray-300 dark:border-gray-600"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Background gradient effect */}
      <AnimatePresence>
        {isDragging && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 -z-10"
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center justify-center space-y-6">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "p-5 rounded-full transition-all duration-300",
            isDragging
              ? "bg-blue-100 dark:bg-blue-900/40"
              : error
                ? "bg-red-100 dark:bg-red-900/40"
                : isUploading
                  ? "bg-green-100 dark:bg-green-900/40"
                  : "bg-gray-100 dark:bg-gray-700"
          )}
        >
          {isDragging ? (
            <FileSpreadsheet className="w-10 h-10 text-blue-500 dark:text-blue-400" />
          ) : error ? (
            <AlertTriangle className="w-10 h-10 text-red-500 dark:text-red-400" />
          ) : isUploading ? (
            uploadProgress === 100 ? (
              <CheckCircle2 className="w-10 h-10 text-green-500 dark:text-green-400" />
            ) : (
              <div className="w-10 h-10 relative">
                <div className="absolute inset-0 rounded-full border-4 border-green-200 dark:border-green-800"></div>
                <div 
                  className="absolute inset-0 rounded-full border-4 border-green-500 dark:border-green-400 border-t-transparent"
                  style={{ 
                    transform: `rotate(${uploadProgress * 3.6}deg)`,
                    transition: 'transform 0.3s ease-in-out'
                  }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-green-600 dark:text-green-400">
                  {uploadProgress}%
                </div>
              </div>
            )
          ) : (
            <Upload className="w-10 h-10 text-gray-500 dark:text-gray-400" />
          )}
        </motion.div>
       
        <div className="text-center w-full max-w-sm">
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
              "inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm transition-all duration-200",
              isUploading
                ? "bg-gray-400 cursor-not-allowed text-white"
                : error
                  ? "bg-white text-red-600 border-red-300 hover:bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
                  : "bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-600 cursor-pointer"
            )}
          >
            {isUploading ? "處理中..." : error ? "重新選擇檔案" : "選擇 CSV 檔案"}
          </label>
          
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            或將 CSV 檔案拖放至此處
          </p>
          
          <AnimatePresence>
            {fileName && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 flex items-center justify-center space-x-2"
              >
                <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[200px]">
                  {fileName}
                </span>
                {fileSize && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({(fileSize / 1024 / 1024).toFixed(2)} MB)
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 text-sm text-red-600 dark:text-red-400"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center space-x-2 text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/30 px-3 py-1.5 rounded-full">
          <FileSpreadsheet className="w-3 h-3" />
          <span>支援的檔案格式：CSV（最大 100MB）</span>
        </div>
      </div>
    </div>
  );
};
