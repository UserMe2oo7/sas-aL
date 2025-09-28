import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Upload, FileText, Image, X, CheckCircle, AlertTriangle, Shield } from "lucide-react";

interface UploadSectionProps {
  onNavigate: (page: string, data?: any) => void;
}

export function UploadSection({ onNavigate }: UploadSectionProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'text/plain'];
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      if (!acceptedTypes.includes(file.type)) {
        alert(`File type ${file.type} is not supported`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert(`File ${file.name} is too large. Maximum size is 10MB`);
        return false;
      }
      return true;
    });

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.includes('image')) return <Image className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const processFiles = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      // Get session for authentication
      const sessionData = localStorage.getItem('supabase_session');
      if (!sessionData) {
        throw new Error('Please login to upload files');
      }

      const session = JSON.parse(sessionData);
      const accessToken = session.access_token;
      const isDemoMode = accessToken.startsWith('demo-token-');

      setProgress(25);

      if (isDemoMode) {
        // Demo mode - simulate upload and validation
        console.log('Running in demo mode');
        
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + Math.random() * 15;
          });
        }, 200);

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 3000));
        setProgress(100);
        clearInterval(progressInterval);

        // Generate mock results
        const results = files.map(file => ({
          fileName: file.name,
          fileSize: file.size,
          authenticity: Math.random() > 0.3 ? 'authentic' : 'suspicious',
          confidenceScore: Math.floor(Math.random() * 30) + 70,
          issues: Math.random() > 0.7 ? ['Signature inconsistency', 'Date format anomaly'] : [],
          processingTime: Math.floor(Math.random() * 3000) + 1000,
          metadata: {
            institution: 'Demo University',
            studentName: 'Demo Student',
            degree: 'Bachelor of Science',
            graduationDate: '2023-05-15',
            certificateId: 'DEMO-' + Math.random().toString(36).substr(2, 9)
          },
          technicalAnalysis: {
            ocrAccuracy: Math.floor(Math.random() * 10) + 90,
            layoutAnalysis: Math.floor(Math.random() * 15) + 85,
            signatureVerification: Math.floor(Math.random() * 20) + 80,
            institutionMatch: Math.floor(Math.random() * 12) + 88,
            blockchainVerification: Math.random() > 0.5 ? 'verified' : 'pending',
            aiDetection: Math.random() > 0.9 ? 'flagged' : 'clean'
          }
        }));

        setTimeout(() => {
          onNavigate('results', { results, uploadedFiles: files });
        }, 500);
        return;
      }

      // Real server mode
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const uploadResponse = await fetch(`https://tbmtmjtmjttprfczmhvu.supabase.co/functions/v1/make-server-1f1a48b6/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const uploadData = await uploadResponse.json();
      setProgress(50);

      // Step 2: Validate uploaded files
      const fileIds = uploadData.results
        .filter((result: any) => result.success)
        .map((result: any) => result.fileId);

      if (fileIds.length === 0) {
        throw new Error('No files were successfully uploaded');
      }

      const validationResponse = await fetch(`https://tbmtmjtmjttprfczmhvu.supabase.co/functions/v1/make-server-1f1a48b6/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ fileIds }),
      });

      if (!validationResponse.ok) {
        const errorData = await validationResponse.json();
        throw new Error(errorData.error || 'Validation failed');
      }

      const validationData = await validationResponse.json();
      setProgress(100);

      // Navigate to results page
      setTimeout(() => {
        onNavigate('results', { 
          results: validationData.results, 
          uploadedFiles: files 
        });
      }, 500);

    } catch (error: any) {
      console.error('Processing error:', error);
      alert(`Error: ${error.message}`);
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Certificate Validation</h1>
          <p className="text-slate-600">
            Upload certificates to verify their authenticity using our AI-powered validation engine.
          </p>
        </div>

        {/* Upload Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Upload Documents</span>
            </CardTitle>
            <CardDescription>
              Supported formats: PDF, DOCX, DOC, JPG, PNG, TXT (Max 10MB per file)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-slate-300 hover:border-slate-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Drop files here or click to browse
              </h3>
              <p className="text-slate-600 mb-4">
                Select multiple files for batch processing
              </p>
              <Button onClick={() => fileInputRef.current?.click()}>
                Choose Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>

        {/* File List */}
        {files.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Selected Files ({files.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file)}
                      <div>
                        <p className="font-medium text-slate-900">{file.name}</p>
                        <p className="text-sm text-slate-600">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-slate-400 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Processing Section */}
        {isProcessing && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 animate-pulse text-blue-600" />
                <span>Processing Documents</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Validation Progress</span>
                    <span className="text-sm text-slate-600">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span>Analyzing document authenticity...</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={processFiles}
            disabled={files.length === 0 || isProcessing}
            className="flex-1"
            size="lg"
          >
            {isProcessing ? 'Processing...' : `Validate ${files.length} File${files.length !== 1 ? 's' : ''}`}
          </Button>
          <Button
            variant="outline"
            onClick={() => setFiles([])}
            disabled={files.length === 0 || isProcessing}
            size="lg"
          >
            Clear All
          </Button>
        </div>

        {/* Info Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Validation Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Document Analysis</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• OCR text extraction and verification</li>
                  <li>• Layout and formatting analysis</li>
                  <li>• Signature and seal detection</li>
                  <li>• Metadata examination</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-slate-900 mb-2">AI Detection</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Machine learning forgery detection</li>
                  <li>• AI-generated content identification</li>
                  <li>• Cross-reference institutional databases</li>
                  <li>• Blockchain verification (when available)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}