"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload, X, FileText } from "lucide-react";

export default function CatalogImport() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const downloadTemplate = async () => {
    setIsDownloading(true);

    // Create a comprehensive CSV template
    const csvContent = `Brand,Product Title,Price (MAD),Condition,Category,Description,Color,Size,Material,Year,Authentication Certificate,Serial Number
Rolex,Submariner Date,25000,Excellent,Watches,Classic luxury diving watch,Black,40mm,Stainless Steel,2023,Yes,116610LN
Chanel,Classic Flap Bag,18000,Very Good,Bags,Iconic quilted handbag,Black,Medium,Lambskin,2022,Yes,CH001234
Gucci,Ace Sneakers,3500,Good,Shoes,Designer leather sneakers,White,42,Leather,2023,No,
Prada,Saffiano Wallet,1200,Excellent,Accessories,Premium leather wallet,Black,Standard,Saffiano Leather,2023,No,
Louis Vuitton,Neverfull MM,8500,Very Good,Bags,Iconic tote bag,Monogram,MM,Canvas,2022,Yes,LV789456`;

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "trendies_catalog_template.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    // Simulate download delay
    setTimeout(() => {
      setIsDownloading(false);
    }, 1000);
  };

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    // Here you would typically process the uploaded file
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (
        file.type === "text/csv" ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls")
      ) {
        handleFileUpload(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  const triggerFileSelect = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv,.xlsx,.xls";
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        handleFileUpload(target.files[0]);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-black">
          Import Product Catalog
        </h1>
        <p className="text-gray-600 text-sm max-w-2xl">
          Easily import multiple products by downloading the Excel template,
          filling in your product details, and uploading the completed file.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6 pt-8">
        {/* Download Template Section */}
        <div className="text-center space-y-3">
          <Button
            onClick={downloadTemplate}
            disabled={isDownloading}
            variant="outline"
            className="w-full h-12 text-sm font-medium border-gray-300 hover:bg-gray-50 bg-white text-black"
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? "DOWNLOADING..." : "DOWNLOAD EXCEL TEMPLATE"}
          </Button>
          <p className="text-sm text-gray-500">
            Use this template to prepare your product data correctly before
            uploading
          </p>
        </div>

        {/* Upload Section */}
        <div className="text-center space-y-4">
          <Button
            onClick={triggerFileSelect}
            variant="outline"
            className="w-full h-12 text-sm font-medium border-gray-300 hover:bg-gray-50 bg-white text-black"
          >
            <Upload className="h-4 w-4 mr-2" />
            UPLOAD COMPLETED TEMPLATE
          </Button>

          {/* Drag and Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-12 transition-colors cursor-pointer ${
              isDragOver
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 bg-white hover:border-gray-400"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={triggerFileSelect}
          >
            <div className="text-center">
              <p className="text-gray-500 text-sm">
                Drag & drop your file here or click to browse
              </p>
            </div>
          </div>

          {/* Uploaded File Display */}
          {uploadedFile && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border max-w-sm mx-auto">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-black font-medium">
                  {uploadedFile.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="text-gray-500 hover:text-red-500 p-1"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
