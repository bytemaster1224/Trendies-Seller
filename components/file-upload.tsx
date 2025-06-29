"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, FileText, CheckCircle, AlertCircle } from "lucide-react"
import { useAppStore } from "@/lib/store"

interface FileUploadProps {
  accept?: Record<string, string[]>
  maxSize?: number
  onUpload?: (files: File[]) => void
}

export function FileUpload({
  accept = {
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    "application/vnd.ms-excel": [".xls"],
    "text/csv": [".csv"],
  },
  maxSize = 10 * 1024 * 1024, // 10MB
  onUpload,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const { uploadedFiles, addUploadedFile, removeUploadedFile } = useAppStore()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploading(true)

      for (const file of acceptedFiles) {
        // Add file to store
        addUploadedFile({
          name: file.name,
          size: file.size,
          type: file.type,
          uploadDate: new Date().toISOString(),
          status: "Processing",
        })

        // Simulate file processing
        setTimeout(() => {
          const fileInStore = uploadedFiles.find((f) => f.name === file.name)
          if (fileInStore) {
            addUploadedFile({
              ...fileInStore,
              status: "Completed",
            })
          }
        }, 2000)
      }

      setUploading(false)
      onUpload?.(acceptedFiles)
    },
    [addUploadedFile, uploadedFiles, onUpload],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "Processing":
        return <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      case "Failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-4">
      <Card
        className={`border-2 border-dashed transition-colors ${
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
      >
        <CardContent className="p-12">
          <div {...getRootProps()} className="text-center cursor-pointer">
            <input {...getInputProps()} />
            <Upload className="h-8 w-8 mx-auto mb-4 text-gray-400" />
            {isDragActive ? (
              <p className="text-blue-600">Drop the file here...</p>
            ) : (
              <div className="space-y-2">
                <p className="text-gray-600">Drag & drop your file here or click to browse</p>
                <p className="text-sm text-gray-500">Supports .xlsx, .xls, .csv files up to 10MB</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(file.status)}
                <div>
                  <p className="text-sm font-medium text-black">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)} • {file.status}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeUploadedFile(file.id)}
                className="text-gray-500 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
