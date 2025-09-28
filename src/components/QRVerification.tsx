import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { validateQRData } from "./WatermarkUtils";
import { 
  QrCode, 
  Upload, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileText,
  Shield,
  Hash,
  Clock,
  ExternalLink
} from "lucide-react";

interface QRVerificationProps {
  onNavigate: (page: string) => void;
}

interface VerificationResult {
  isValid: boolean;
  certificateId: string;
  studentName?: string;
  institution?: string;
  graduationDate?: string;
  validationDate?: string;
  confidenceScore?: number;
  authenticity?: string;
  hash?: string;
  verifyUrl?: string;
  timestamp?: string;
  error?: string;
}

export function QRVerification({ onNavigate }: QRVerificationProps) {
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrData, setQrData] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulate QR code scanning from image file
  const handleQRFileUpload = async (file: File) => {
    setQrFile(file);
    setIsVerifying(true);
    
    // Simulate QR code decoding process
    setTimeout(() => {
      // Mock QR data - in real implementation, this would use a QR scanner library
      const mockQRData = JSON.stringify({
        certificateId: "CERT-2024-7891",
        studentName: "Sarah Johnson",
        institution: "University of Technology",
        graduationDate: "2024-05-15",
        validationDate: "2024-09-28T10:30:00Z",
        confidenceScore: 94,
        authenticity: "authentic",
        timestamp: "2024-09-28T10:30:00Z",
        hash: "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
        verifyUrl: "https://verify.authenledger.com/v/CERT-2024-7891?h=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
        version: "1.0"
      });
      
      setQrData(mockQRData);
      verifyQRData(mockQRData);
    }, 2000);
  };

  // Parse and verify QR code data
  const verifyQRData = async (data: string) => {
    try {
      const qrContent = JSON.parse(data);
      
      // Use validation utility
      const validation = validateQRData(qrContent);

      setVerificationResult({
        isValid: validation.isValid,
        certificateId: qrContent.certificateId,
        studentName: qrContent.studentName,
        institution: qrContent.institution,
        graduationDate: qrContent.graduationDate,
        validationDate: qrContent.validationDate,
        confidenceScore: qrContent.confidenceScore,
        authenticity: qrContent.authenticity,
        hash: qrContent.hash,
        verifyUrl: qrContent.verifyUrl,
        timestamp: qrContent.timestamp,
        error: validation.error
      });
      
    } catch (error) {
      setVerificationResult({
        isValid: false,
        certificateId: "Unknown",
        error: "Failed to parse QR code data - invalid format"
      });
    }
    
    setIsVerifying(false);
  };

  // Handle manual QR data input
  const handleManualVerification = () => {
    if (!qrData.trim()) return;
    
    setIsVerifying(true);
    setTimeout(() => {
      verifyQRData(qrData);
    }, 1000);
  };

  // Get verification status info
  const getVerificationStatus = () => {
    if (!verificationResult) return null;
    
    if (verificationResult.isValid) {
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        status: 'Verified Authentic',
        description: 'Certificate QR code is valid and verified'
      };
    } else {
      return {
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        status: 'Verification Failed',
        description: verificationResult.error || 'Certificate could not be verified'
      };
    }
  };

  const statusInfo = getVerificationStatus();

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">QR Code Verification</h1>
          <p className="text-slate-600">
            Verify the authenticity of certificates using cryptographic QR codes
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* QR Code Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <QrCode className="h-5 w-5" />
                  <span>Scan QR Code</span>
                </CardTitle>
                <CardDescription>
                  Upload an image containing a QR code or enter the hash code manually
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File Upload */}
                <div>
                  <Label htmlFor="qr-file">Upload QR Code Image</Label>
                  <div className="mt-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="qr-file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleQRFileUpload(file);
                      }}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center space-x-2"
                    >
                      <Upload className="h-4 w-4" />
                      <span>{qrFile ? qrFile.name : "Choose QR Code Image"}</span>
                    </Button>
                  </div>
                </div>

                <div className="text-center text-sm text-slate-500">
                  or
                </div>

                {/* Manual Input */}
                <div>
                  <Label htmlFor="qr-data">Enter Hash Code</Label>
                  <div className="mt-2 space-y-2">
                    <textarea
                      id="qr-data"
                      value={qrData}
                      onChange={(e) => setQrData(e.target.value)}
                      placeholder="Enter the certificate hash code here..."
                      className="w-full h-32 p-3 border rounded-lg resize-none"
                    />
                    <Button
                      onClick={handleManualVerification}
                      disabled={!qrData.trim() || isVerifying}
                      className="w-full"
                    >
                      {isVerifying ? "Verifying..." : "Verify Hash"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Processing Indicator */}
            {isVerifying && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm text-slate-600">
                      {qrFile ? "Scanning QR code from image..." : "Verifying certificate data..."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Verification Results */}
          <div className="space-y-6">
            {verificationResult && statusInfo && (
              <>
                {/* Status Card */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${statusInfo.bgColor}`}>
                          <statusInfo.icon className={`h-6 w-6 ${statusInfo.color}`} />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{statusInfo.status}</CardTitle>
                          <CardDescription>{statusInfo.description}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Certificate ID:</span>
                        <span className="font-mono text-sm">{verificationResult.certificateId}</span>
                      </div>
                      
                      {verificationResult.hash && (
                        <div className="flex items-center space-x-2">
                          <Hash className="h-4 w-4 text-slate-400" />
                          <span className="text-xs font-mono text-slate-600 break-all">
                            {verificationResult.hash}
                          </span>
                        </div>
                      )}
                      
                      {verificationResult.timestamp && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Generated:</span>
                          <span className="text-sm">{new Date(verificationResult.timestamp).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Certificate Details */}
                {verificationResult.isValid && verificationResult.studentName && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Certificate Details</CardTitle>
                      <CardDescription>
                        Information extracted from the verified certificate
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-sm text-slate-600">Student Name:</span>
                            <p className="font-medium">{verificationResult.studentName}</p>
                          </div>
                          <div>
                            <span className="text-sm text-slate-600">Institution:</span>
                            <p className="font-medium">{verificationResult.institution}</p>
                          </div>
                          <div>
                            <span className="text-sm text-slate-600">Graduation Date:</span>
                            <p className="font-medium">{verificationResult.graduationDate}</p>
                          </div>
                          <div>
                            <span className="text-sm text-slate-600">Confidence Score:</span>
                            <p className="font-medium">{verificationResult.confidenceScore}%</p>
                          </div>
                        </div>
                        
                        {verificationResult.verifyUrl && (
                          <div className="pt-3 border-t">
                            <Button variant="outline" size="sm" className="flex items-center space-x-2">
                              <ExternalLink className="h-4 w-4" />
                              <span>Verify Online</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Error Details */}
                {!verificationResult.isValid && verificationResult.error && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Verification Error:</strong> {verificationResult.error}
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}

            {/* Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>How It Works</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    <p>QR codes contain encrypted certificate data and cryptographic hashes</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <p>Verification checks hash integrity and certificate authenticity</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    <p>Results show whether the certificate is genuine and unmodified</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mt-8">
          <Button onClick={() => onNavigate('upload')} variant="outline">
            Validate New Documents
          </Button>
        </div>
      </div>
    </div>
  );
}