import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { AlertTriangle, CheckCircle, XCircle, Search, Calendar, FileText, Clock } from "lucide-react";

interface ValidationHistoryProps {
  onNavigate: (page: string, data?: any) => void;
}

export function ValidationHistory({ onNavigate }: ValidationHistoryProps) {
  const [validations, setValidations] = useState<any[]>([]);
  const [filteredValidations, setFilteredValidations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchValidations();
  }, []);

  useEffect(() => {
    filterValidations();
  }, [validations, searchTerm, filterStatus]);

  const fetchValidations = async () => {
    try {
      const sessionData = localStorage.getItem('supabase_session');
      if (!sessionData) {
        throw new Error('Please login to view history');
      }

      const session = JSON.parse(sessionData);
      const accessToken = session.access_token;
      const isDemoMode = accessToken.startsWith('demo-token-');

      if (isDemoMode) {
        // Demo mode - show mock validations
        const mockValidations = [
          {
            id: 'demo-validation-1',
            fileName: 'demo_certificate_1.pdf',
            fileSize: 2048576,
            authenticity: 'authentic',
            confidenceScore: 94,
            issues: [],
            processingTime: 2340,
            validatedAt: new Date(Date.now() - 3600000).toISOString(),
            metadata: {
              institution: 'Demo University',
              studentName: 'Demo Student',
              degree: 'Bachelor of Science'
            }
          },
          {
            id: 'demo-validation-2',
            fileName: 'demo_certificate_2.pdf',
            fileSize: 1536000,
            authenticity: 'suspicious',
            confidenceScore: 67,
            issues: ['Signature inconsistency detected'],
            processingTime: 3120,
            validatedAt: new Date(Date.now() - 7200000).toISOString(),
            metadata: {
              institution: 'Another University',
              studentName: 'Test User',
              degree: 'Master of Arts'
            }
          }
        ];
        setValidations(mockValidations);
        setIsLoading(false);
        return;
      }

      const response = await fetch(`https://tbmtmjtmjttprfczmhvu.supabase.co/functions/v1/make-server-1f1a48b6/validations`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch validations');
      }

      const data = await response.json();
      setValidations(data.validations || []);
    } catch (error: any) {
      console.error('Failed to fetch validations:', error);
      // Fallback to empty state in case of error
      setValidations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterValidations = () => {
    let filtered = [...validations];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(validation =>
        validation.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        validation.metadata?.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        validation.metadata?.institution?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(validation => validation.authenticity === filterStatus);
    }

    setFilteredValidations(filtered);
  };

  const getStatusInfo = (authenticity: string, score: number) => {
    if (authenticity === 'authentic' && score >= 85) {
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        status: 'Authentic'
      };
    } else if (score >= 70) {
      return {
        icon: AlertTriangle,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        status: 'Suspicious'
      };
    } else {
      return {
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        status: 'Forged'
      };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const viewResults = (validation: any) => {
    onNavigate('results', {
      results: [validation],
      uploadedFiles: [{ name: validation.fileName, size: validation.fileSize }]
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading validation history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Validation History</h1>
          <p className="text-slate-600">
            View and manage your certificate validation results
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by filename, student name, or institution..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  onClick={() => setFilterStatus("all")}
                  size="sm"
                >
                  All ({validations.length})
                </Button>
                <Button
                  variant={filterStatus === "authentic" ? "default" : "outline"}
                  onClick={() => setFilterStatus("authentic")}
                  size="sm"
                >
                  Authentic ({validations.filter(v => v.authenticity === 'authentic').length})
                </Button>
                <Button
                  variant={filterStatus === "suspicious" ? "default" : "outline"}
                  onClick={() => setFilterStatus("suspicious")}
                  size="sm"
                >
                  Suspicious ({validations.filter(v => v.authenticity === 'suspicious').length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {filteredValidations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {validations.length === 0 ? "No validations yet" : "No results found"}
              </h3>
              <p className="text-slate-600 mb-6">
                {validations.length === 0 
                  ? "Upload and validate your first certificate to see results here."
                  : "Try adjusting your search terms or filters."
                }
              </p>
              {validations.length === 0 && (
                <Button onClick={() => onNavigate('upload')}>
                  Upload Certificate
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredValidations.map((validation) => {
              const statusInfo = getStatusInfo(validation.authenticity, validation.confidenceScore);
              return (
                <Card key={validation.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <statusInfo.icon className={`h-5 w-5 ${statusInfo.color}`} />
                          <h3 className="font-semibold text-slate-900 truncate">
                            {validation.fileName}
                          </h3>
                          <Badge className={`${statusInfo.bgColor} ${statusInfo.color} border-0`}>
                            {statusInfo.status}
                          </Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-slate-600">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(validation.validatedAt)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`font-medium ${statusInfo.color}`}>
                              {validation.confidenceScore}% confidence
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>{(validation.processingTime / 1000).toFixed(1)}s</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span>{validation.metadata?.institution || 'Unknown Institution'}</span>
                          </div>
                        </div>

                        {validation.issues && validation.issues.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm text-yellow-600">
                              Issues: {validation.issues.join(', ')}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          onClick={() => viewResults(validation)}
                          size="sm"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination placeholder - can be implemented if needed */}
        {filteredValidations.length > 0 && (
          <div className="mt-8 text-center text-sm text-slate-600">
            Showing {filteredValidations.length} of {validations.length} validations
          </div>
        )}
      </div>
    </div>
  );
}