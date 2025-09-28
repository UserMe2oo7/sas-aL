import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { CertificateGenerator } from "./CertificateGenerator";
import { 
  Upload, 
  QrCode, 
  FileText, 
  Shield,
  CheckCircle 
} from "lucide-react";

export function PDFDemo() {
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [certificateData, setCertificateData] = useState<any>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      
      // Create sample certificate data based on uploaded file
      const generatedData = {
        fileName: file.name,
        metadata: {
          certificateId: `CERT-${Date.now()}`,
          studentName: "Student Name",
          degree: "Degree Title",
          institution: "Institution Name",
          graduationDate: new Date().toISOString().split('T')[0]
        },
        confidenceScore: 95,
        authenticity: "authentic",
        validationDate: new Date().toISOString(),
        processingTime: 1.8,
        issues: []
      };
      
      setCertificateData(generatedData);
    }
  };

  const handleGeneratePDF = () => {
    if (!certificateData) {
      alert("Please upload a certificate first");
      return;
    }
    setIsGeneratorOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            PDF Certificate with QR Code Demo
          </h2>
          <p className="text-slate-600">
            Generate a secure PDF certificate with embedded cryptographic QR code
          </p>
        </div>

        {/* Certificate Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upload Certificate</CardTitle>
            <CardDescription>
              Upload your certificate file to generate a secure PDF with QR code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="certificate-upload">Certificate File</Label>
                <Input
                  id="certificate-upload"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="mt-1"
                />
                <p className="text-sm text-slate-500 mt-1">
                  Supports PDF, DOC, DOCX, JPG, JPEG, PNG files
                </p>
              </div>

              {uploadedFile && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-800">{uploadedFile.name}</p>
                      <p className="text-sm text-green-600">File uploaded successfully</p>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleGeneratePDF}
                disabled={!uploadedFile}
                className="w-full flex items-center justify-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Generate PDF Certificate with QR Code</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features Included */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">PDF Features Included</CardTitle>
            <CardDescription>
              Your generated PDF certificate will include these security features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <QrCode className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Cryptographic QR Code</p>
                  <p className="text-sm text-slate-600">Contains verification hash and metadata</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Digital Watermark</p>
                  <p className="text-sm text-slate-600">Tamper-evident background pattern</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">Professional Layout</p>
                  <p className="text-sm text-slate-600">Clean, organized certificate format</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium">Verification URL</p>
                  <p className="text-sm text-slate-600">QR links to online verification</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use the Generated PDF</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <p>Click "Generate PDF Certificate" to create your secure document</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <p>The PDF will be downloaded with embedded QR code and watermarks</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <p>Recipients can scan the QR code to verify authenticity</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">4</div>
                <p>The watermark pattern helps prevent unauthorized duplication</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certificate Generator Modal */}
      {certificateData && (
        <CertificateGenerator
          certificateData={certificateData}
          isOpen={isGeneratorOpen}
          onClose={() => setIsGeneratorOpen(false)}
        />
      )}
    </div>
  );
}