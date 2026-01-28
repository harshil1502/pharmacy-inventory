'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, Check, AlertCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { Store } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn, formatNumber, formatCurrency } from '@/lib/utils';

interface PDFUploadProps {
  stores: Store[];
}

interface UploadResult {
  success: boolean;
  itemsCount?: number;
  totalValue?: number;
  storeName?: string;
  error?: string;
}

export function PDFUpload({ stores }: PDFUploadProps) {
  const router = useRouter();
  const { user } = useAppStore();
  const supabase = createClient();
  
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setResult(null);
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedStoreId || !user) return;

    setUploading(true);
    setResult(null);

    try {
      // Create FormData to send the file as binary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('storeId', selectedStoreId);
      formData.append('fileName', file.name);
      formData.append('userId', user.id);
      
      // Send to API for parsing and storing
      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setResult({
        success: true,
        itemsCount: data.itemsCount,
        totalValue: data.totalValue,
        storeName: stores.find(s => s.id === selectedStoreId)?.name,
      });

      // Create notification
      await supabase.from('notifications').insert({
        store_id: selectedStoreId,
        type: 'inventory_updated',
        title: 'Inventory Updated',
        message: `Inventory report uploaded with ${data.itemsCount} items totaling ${formatCurrency(data.totalValue)}`,
      });

      router.refresh();
    } catch (err) {
      console.error('Upload error:', err);
      setResult({
        success: false,
        error: err instanceof Error ? err.message : 'Failed to upload report',
      });
    } finally {
      setUploading(false);
    }
  };

  const selectedStore = stores.find(s => s.id === selectedStoreId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Inventory Report</CardTitle>
        <CardDescription>
          Upload a PDF report to update store inventory. The system will verify that the PDF matches the selected store.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Store Selection */}
        <div className="space-y-2">
          <Label>Select Store</Label>
          <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a store..." />
            </SelectTrigger>
            <SelectContent>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name} ({store.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* File Drop Zone */}
        <div
          className={cn(
            'relative rounded-lg border-2 border-dashed p-8 text-center transition-colors',
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : file
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
          
          {file ? (
            <div className="flex flex-col items-center">
              <FileText className="h-12 w-12 text-green-600 mb-3" />
              <p className="font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500 mt-1">
                {(file.size / 1024).toFixed(1)} KB
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setResult(null);
                }}
              >
                Choose Different File
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="h-12 w-12 text-gray-400 mb-3" />
              <p className="font-medium text-gray-700">
                Drop your PDF here or click to browse
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Only PDF files are supported
              </p>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <Button
          className="w-full"
          disabled={!file || !selectedStoreId || uploading}
          onClick={handleUpload}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing Report...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload & Process Report
            </>
          )}
        </Button>

        {/* Result Message */}
        {result && (
          <div
            className={cn(
              'rounded-lg p-4',
              result.success
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            )}
          >
            {result.success ? (
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">
                    Report uploaded successfully!
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Updated inventory for {result.storeName} with{' '}
                    <strong>{formatNumber(result.itemsCount || 0)}</strong> items
                    totaling <strong>{formatCurrency(result.totalValue || 0)}</strong>
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-red-800">Upload failed</p>
                  <p className="text-sm text-red-700 mt-1 whitespace-pre-line">{result.error}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
