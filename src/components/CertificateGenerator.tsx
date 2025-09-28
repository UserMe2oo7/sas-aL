import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  Download, 
  QrCode, 
  Shield, 
  FileText, 
  Clock, 
  CheckCircle,
  AlertTriangle 
} from "lucide-react";
import QRCode from "qrcode";
import { 
  generateVerificationHash, 
  createVerificationMetadata, 
  createSecurePDF, 
  downloadFile 
} from "./WatermarkUtils";

interface CertificateData {
  fileName: string;
  metadata: {
    certificateId: string;
    studentName: string;
    degree: string;
    institution: string;
    graduationDate: string;
  };
  confidenceScore: number;
  authenticity: string;
  validationDate: string;
  processingTime: number;
  issues: string[];
}

interface CertificateGeneratorProps {
  certificateData: CertificateData;
  isOpen: boolean;
  onClose: () => void;
}

export function CertificateGenerator({ certificateData, isOpen, onClose }: CertificateGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");



  // Generate cryptographic QR code
  const generateCryptographicQR = async (): Promise<string> => {
    const verificationData = createVerificationMetadata(certificateData);

    const hash = await generateVerificationHash(verificationData);
    
    const qrData = {
      ...verificationData,
      hash,
      verifyUrl: `https://verify.authenledger.com/v/${certificateData.metadata.certificateId}?h=${hash}`,
      qrVersion: "2.0",
      generated: new Date().toISOString(),
      platform: "AuthenLedger"
    };

    try {
      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 200,
        margin: 2,
        color: {
          dark: '#1e40af',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      });
      return qrCodeDataUrl;
    } catch (error) {
      console.error('QR Code generation error:', error);
      return '';
    }
  };



  // Generate PDF certificate with QR code and watermark
  const generateSecureCertificate = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Step 1: Generate QR Code (33%)
      setGenerationProgress(33);
      const qrUrl = await generateCryptographicQR();
      setQrCodeUrl(qrUrl);

      // Step 2: Create watermark options (66%)
      setGenerationProgress(66);
      const watermarkOptions = {
        text: `VERIFIED • ${certificateData.metadata.institution.toUpperCase()} • ${new Date().getFullYear()}`,
        opacity: 0.1,
        fontSize: 24,
        color: '#1e40af',
        angle: -30,
        spacing: 200
      };

      // Step 3: Generate secure PDF (100%)
      setGenerationProgress(100);
      const pdfBlob = await createSecurePDF(certificateData, qrUrl, watermarkOptions);
      
      // Download the generated certificate
      downloadFile(pdfBlob, `verified-certificate-${certificateData.metadata.certificateId}.pdf`);
      
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Certificate generation error:', error);
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  // Generate JSON verification file
  const generateVerificationFile = async () => {
    const verificationData = {
      certificateId: certificateData.metadata.certificateId,
      validationTimestamp: certificateData.validationDate,
      authenticity: certificateData.authenticity,
      confidenceScore: certificateData.confidenceScore,
      metadata: certificateData.metadata,
      issues: certificateData.issues,
      cryptographicHash: await generateVerificationHash(certificateData),
      generatedAt: new Date().toISOString(),
      version: "1.0"
    };

    const blob = new Blob([JSON.stringify(verificationData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verification-${certificateData.metadata.certificateId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusInfo = () => {
    if (certificateData.authenticity === 'authentic' && certificateData.confidenceScore >= 85) {
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        status: 'Authentic'
      };
    } else if (certificateData.confidenceScore >= 70) {
      return {
        icon: AlertTriangle,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        status: 'Suspicious'
      };
    } else {
      return {
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        status: 'Potentially Forged'
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Generate Secure Certificate</span>
          </DialogTitle>
          <DialogDescription>
            Create a verified certificate with cryptographic QR code and digital watermark protection
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Certificate Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${statusInfo.bgColor}`}>
                    <statusInfo.icon className={`h-5 w-5 ${statusInfo.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{certificateData.metadata.studentName}</CardTitle>
                    <CardDescription>{certificateData.metadata.degree}</CardDescription>
                  </div>
                </div>
                <Badge className={`${statusInfo.bgColor} ${statusInfo.color} border-0`}>
                  {statusInfo.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Institution:</span>
                  <p className="font-medium">{certificateData.metadata.institution}</p>
                </div>
                <div>
                  <span className="text-slate-600">Confidence Score:</span>
                  <p className="font-medium">{certificateData.confidenceScore}%</p>
                </div>
                <div>
                  <span className="text-slate-600">Certificate ID:</span>
                  <p className="font-medium font-mono text-xs">{certificateData.metadata.certificateId}</p>
                </div>
                <div>
                  <span className="text-slate-600">Validation Date:</span>
                  <p className="font-medium">{new Date(certificateData.validationDate).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Security Features</CardTitle>
              <CardDescription>
                The generated certificate will include the following security measures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <QrCode className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Cryptographic QR Code</p>
                    <p className="text-sm text-slate-600">Contains verification hash and validation URL</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Digital Watermark</p>
                    <p className="text-sm text-slate-600">Institution branding with transparency overlay</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">Tamper-Proof Design</p>
                    <p className="text-sm text-slate-600">Embedded metadata and verification checksums</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generation Progress */}
          {isGenerating && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Generating secure certificate...</span>
                    <span className="text-sm text-slate-600">{generationProgress}%</span>
                  </div>
                  <Progress value={generationProgress} className="h-2" />
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <Clock className="h-4 w-4" />
                    <span>
                      {generationProgress < 25 ? 'Generating cryptographic QR code...' :
                       generationProgress < 50 ? 'Creating document structure...' :
                       generationProgress < 75 ? 'Applying digital watermark...' :
                       generationProgress < 100 ? 'Finalizing certificate...' :
                       'Complete!'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* QR Code Preview */}
          {qrCodeUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cryptographic QR Code Preview</CardTitle>
                <CardDescription>
                  This QR code contains encrypted verification data
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <img src={qrCodeUrl} alt="Verification QR Code" className="border rounded-lg" />
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={generateSecureCertificate}
              disabled={isGenerating}
              className="flex items-center space-x-2 flex-1"
            >
              <Download className="h-4 w-4" />
              <span>Generate Secure Certificate</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={generateVerificationFile}
              disabled={isGenerating}
              className="flex items-center space-x-2 flex-1"
            >
              <FileText className="h-4 w-4" />
              <span>Download Verification File</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}