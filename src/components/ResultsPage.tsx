import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { CertificateGenerator } from "./CertificateGenerator";
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  Download, 
  Eye, 
  Shield,
  Clock,
  User,
  GraduationCap,
  Building,
  Calendar,
  Hash,
  QrCode
} from "lucide-react";

interface ResultsPageProps {
  results: any[];
  uploadedFiles: File[];
  onNavigate: (page: string) => void;
}

export function ResultsPage({ results, uploadedFiles, onNavigate }: ResultsPageProps) {
  const [selectedResult, setSelectedResult] = useState(0);
  const [showCertificateGenerator, setShowCertificateGenerator] = useState(false);

  const getStatusInfo = (authenticity: string, score: number) => {
    if (authenticity === 'authentic' && score >= 85) {
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        status: 'Authentic',
        description: 'Certificate appears to be genuine'
      };
    } else if (score >= 70) {
      return {
        icon: AlertTriangle,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        status: 'Suspicious',
        description: 'Certificate requires manual review'
      };
    } else {
      return {
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        status: 'Potentially Forged',
        description: 'Certificate shows signs of tampering'
      };
    }
  };

  const currentResult = results[selectedResult];
  const statusInfo = getStatusInfo(currentResult.authenticity, currentResult.confidenceScore);

  const downloadReport = (format: 'pdf' | 'json') => {
    // In a real app, this would generate and download the actual report
    const data = {
      fileName: currentResult.fileName,
      validationDate: new Date().toISOString(),
      status: statusInfo.status,
      confidenceScore: currentResult.confidenceScore,
      issues: currentResult.issues,
      metadata: currentResult.metadata,
      processingTime: currentResult.processingTime
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `validation-report-${currentResult.metadata.certificateId}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Validation Results</h1>
          <p className="text-slate-600">
            Analysis complete for {results.length} document{results.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* File List Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Processed Files</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {results.map((result, index) => {
                    const info = getStatusInfo(result.authenticity, result.confidenceScore);
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedResult(index)}
                        className={`w-full p-3 text-left border-l-4 transition-colors ${
                          selectedResult === index 
                            ? 'bg-blue-50 border-l-blue-500' 
                            : 'hover:bg-slate-50 border-l-transparent'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <info.icon className={`h-4 w-4 ${info.color}`} />
                          <span className="font-medium text-sm truncate">{result.fileName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs ${info.color}`}>{info.status}</span>
                          <span className={`text-xs font-medium ${info.color}`}>
                            {result.confidenceScore}%
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Results Panel */}
          <div className="lg:col-span-3">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${statusInfo.bgColor}`}>
                      <statusInfo.icon className={`h-6 w-6 ${statusInfo.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{currentResult.fileName}</CardTitle>
                      <CardDescription>{statusInfo.description}</CardDescription>
                    </div>
                  </div>
                  <Badge className={`${statusInfo.bgColor} ${statusInfo.color} border-0`}>
                    {statusInfo.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="relative inline-flex items-center justify-center">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="30"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="transparent"
                          className="text-slate-200"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="30"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="transparent"
                          strokeDasharray={`${2 * Math.PI * 30}`}
                          strokeDashoffset={`${2 * Math.PI * 30 * (1 - currentResult.confidenceScore / 100)}`}
                          className={statusInfo.color}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-2xl font-bold ${statusInfo.color}`}>
                          {currentResult.confidenceScore}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mt-2">Confidence Score</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Clock className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {(currentResult.processingTime / 1000).toFixed(1)}s
                    </div>
                    <p className="text-sm text-slate-600">Processing Time</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Shield className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {currentResult.issues.length}
                    </div>
                    <p className="text-sm text-slate-600">Issues Found</p>
                  </div>
                </div>

                {/* Issues Alert */}
                {currentResult.issues.length > 0 && (
                  <Alert className="mb-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Issues detected:</strong> {currentResult.issues.join(', ')}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={() => setShowCertificateGenerator(true)} 
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <QrCode className="h-4 w-4" />
                    <span>Generate Secure Certificate</span>
                  </Button>
                  <Button onClick={() => downloadReport('pdf')} variant="outline" className="flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Download PDF Report</span>
                  </Button>
                  <Button variant="outline" onClick={() => downloadReport('json')} className="flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Download JSON</span>
                  </Button>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Eye className="h-4 w-4" />
                    <span>View Document</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Analysis Tabs */}
            <Tabs defaultValue="metadata" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="metadata">Certificate Data</TabsTrigger>
                <TabsTrigger value="analysis">Technical Analysis</TabsTrigger>
                <TabsTrigger value="history">Verification History</TabsTrigger>
              </TabsList>

              <TabsContent value="metadata">
                <Card>
                  <CardHeader>
                    <CardTitle>Extracted Certificate Information</CardTitle>
                    <CardDescription>
                      Data extracted from the certificate using OCR and AI analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <User className="h-5 w-5 text-slate-400" />
                          <div>
                            <p className="text-sm text-slate-600">Student Name</p>
                            <p className="font-medium">{currentResult.metadata.studentName}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <GraduationCap className="h-5 w-5 text-slate-400" />
                          <div>
                            <p className="text-sm text-slate-600">Degree</p>
                            <p className="font-medium">{currentResult.metadata.degree}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Building className="h-5 w-5 text-slate-400" />
                          <div>
                            <p className="text-sm text-slate-600">Institution</p>
                            <p className="font-medium">{currentResult.metadata.institution}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-slate-400" />
                          <div>
                            <p className="text-sm text-slate-600">Graduation Date</p>
                            <p className="font-medium">{currentResult.metadata.graduationDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Hash className="h-5 w-5 text-slate-400" />
                          <div>
                            <p className="text-sm text-slate-600">Certificate ID</p>
                            <p className="font-medium font-mono text-sm">{currentResult.metadata.certificateId}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-slate-400" />
                          <div>
                            <p className="text-sm text-slate-600">File Size</p>
                            <p className="font-medium">{(currentResult.fileSize / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analysis">
                <Card>
                  <CardHeader>
                    <CardTitle>Technical Analysis Results</CardTitle>
                    <CardDescription>
                      Detailed breakdown of the validation process and findings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-3">Validation Metrics</h4>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm">Document Layout Analysis</span>
                              <span className="text-sm font-medium">94%</span>
                            </div>
                            <Progress value={94} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm">Text Recognition Accuracy</span>
                              <span className="text-sm font-medium">98%</span>
                            </div>
                            <Progress value={98} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm">Signature Verification</span>
                              <span className="text-sm font-medium">87%</span>
                            </div>
                            <Progress value={87} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm">Institution Database Match</span>
                              <span className="text-sm font-medium">91%</span>
                            </div>
                            <Progress value={91} className="h-2" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Detection Results</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 bg-green-50 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <span className="font-medium text-green-800">Passed Checks</span>
                            </div>
                            <ul className="text-sm text-green-700 space-y-1">
                              <li>• Institutional format validation</li>
                              <li>• Seal authenticity verified</li>
                              <li>• Date consistency check</li>
                              <li>• Digital signature present</li>
                            </ul>
                          </div>
                          <div className="p-4 bg-yellow-50 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <AlertTriangle className="h-5 w-5 text-yellow-600" />
                              <span className="font-medium text-yellow-800">Flagged Items</span>
                            </div>
                            <ul className="text-sm text-yellow-700 space-y-1">
                              {currentResult.issues.length > 0 ? (
                                currentResult.issues.map((issue: string, idx: number) => (
                                  <li key={idx}>• {issue}</li>
                                ))
                              ) : (
                                <li>• No issues detected</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>Verification History</CardTitle>
                    <CardDescription>
                      Previous validations and institutional verifications for this certificate
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Current Validation</span>
                          <span className="text-sm text-slate-600">{new Date().toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-slate-600">
                          AI-powered validation completed with {currentResult.confidenceScore}% confidence
                        </p>
                      </div>
                      <div className="border-l-4 border-green-500 pl-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Institutional Verification</span>
                          <span className="text-sm text-slate-600">2024-01-15</span>
                        </div>
                        <p className="text-sm text-slate-600">
                          Certificate verified directly with {currentResult.metadata.institution}
                        </p>
                      </div>
                      <div className="border-l-4 border-slate-300 pl-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Blockchain Record</span>
                          <span className="text-sm text-slate-600">2023-05-16</span>
                        </div>
                        <p className="text-sm text-slate-600">
                          Certificate hash recorded on institutional blockchain
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Navigation */}
            <div className="flex justify-center mt-8">
              <Button onClick={() => onNavigate('upload')} variant="outline">
                Validate More Documents
              </Button>
            </div>
          </div>
        </div>

        {/* Certificate Generator Modal */}
        <CertificateGenerator
          certificateData={{
            fileName: currentResult.fileName,
            metadata: currentResult.metadata,
            confidenceScore: currentResult.confidenceScore,
            authenticity: currentResult.authenticity,
            validationDate: new Date().toISOString(),
            processingTime: currentResult.processingTime,
            issues: currentResult.issues
          }}
          isOpen={showCertificateGenerator}
          onClose={() => setShowCertificateGenerator(false)}
        />
      </div>
    </div>
  );
}