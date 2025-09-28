import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { FileCheck, Shield, AlertTriangle, CheckCircle, Upload, History, TrendingUp, Users } from "lucide-react";

interface DashboardProps {
  userRole: string;
  onNavigate: (page: string) => void;
}

export function Dashboard({ userRole, onNavigate }: DashboardProps) {
  const [recentVerifications, setRecentVerifications] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalValidations: 0,
    authenticRate: 0,
    flaggedDocuments: 0,
    avgProcessingTime: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const sessionData = localStorage.getItem('supabase_session');
      if (!sessionData) {
        setIsLoading(false);
        return;
      }

      const session = JSON.parse(sessionData);
      const accessToken = session.access_token;
      const isDemoMode = accessToken.startsWith('demo-token-');

      if (isDemoMode) {
        // Demo mode - show mock statistics
        const mockValidations = [
          {
            id: 'demo-validation-1',
            fileName: 'demo_certificate_1.pdf',
            authenticity: 'authentic',
            confidenceScore: 94,
            issues: [],
            processingTime: 2340,
            validatedAt: new Date(Date.now() - 3600000).toISOString(),
            metadata: { institution: 'Demo University' }
          },
          {
            id: 'demo-validation-2',
            fileName: 'demo_certificate_2.pdf',
            authenticity: 'suspicious',
            confidenceScore: 67,
            issues: ['Signature inconsistency detected'],
            processingTime: 3120,
            validatedAt: new Date(Date.now() - 7200000).toISOString(),
            metadata: { institution: 'Another University' }
          }
        ];

        setStats({
          totalValidations: 2,
          authenticRate: 50,
          flaggedDocuments: 1,
          avgProcessingTime: 2730
        });

        setRecentVerifications(mockValidations);
        setIsLoading(false);
        return;
      }

      const response = await fetch(`https://tbmtmjtmjttprfczmhvu.supabase.co/functions/v1/make-server-1f1a48b6/validations`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const validations = data.validations || [];
        
        // Calculate statistics
        const totalValidations = validations.length;
        const authenticCount = validations.filter((v: any) => v.authenticity === 'authentic').length;
        const authenticRate = totalValidations > 0 ? (authenticCount / totalValidations) * 100 : 0;
        const flaggedDocuments = validations.filter((v: any) => v.issues && v.issues.length > 0).length;
        const avgProcessingTime = totalValidations > 0 
          ? validations.reduce((acc: number, v: any) => acc + (v.processingTime || 0), 0) / totalValidations
          : 0;

        setStats({
          totalValidations,
          authenticRate,
          flaggedDocuments,
          avgProcessingTime
        });

        // Get recent validations (last 3)
        setRecentVerifications(validations.slice(0, 3));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Set default empty state
      setStats({
        totalValidations: 0,
        authenticRate: 0,
        flaggedDocuments: 0,
        avgProcessingTime: 0
      });
      setRecentVerifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'authentic':
        return <Badge className="bg-green-100 text-green-800">Authentic</Badge>;
      case 'suspicious':
        return <Badge className="bg-yellow-100 text-yellow-800">Suspicious</Badge>;
      case 'forged':
        return <Badge className="bg-red-100 text-red-800">Forged</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800">Processing</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">
            Welcome back! Here's an overview of your certificate validations.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Validations</CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? '...' : stats.totalValidations.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total documents processed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Authentic Rate</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {isLoading ? '...' : `${stats.authenticRate.toFixed(1)}%`}
              </div>
              <p className="text-xs text-muted-foreground">
                Documents verified as authentic
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Flagged Documents</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {isLoading ? '...' : stats.flaggedDocuments}
              </div>
              <p className="text-xs text-muted-foreground">
                Documents with issues detected
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Processing Time</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : `${(stats.avgProcessingTime / 1000).toFixed(1)}s`}
              </div>
              <p className="text-xs text-muted-foreground">
                Average processing time
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Start validating certificates or access your history
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => onNavigate('upload')} 
                className="w-full justify-start"
                size="lg"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload New Certificate
              </Button>
              <Button 
                onClick={() => onNavigate('history')} 
                variant="outline" 
                className="w-full justify-start"
                size="lg"
              >
                <History className="mr-2 h-4 w-4" />
                View Validation History
              </Button>
              {userRole === 'admin' && (
                <Button 
                  onClick={() => onNavigate('admin')} 
                  variant="outline" 
                  className="w-full justify-start"
                  size="lg"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Admin Panel
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Recent Validations */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Validations</CardTitle>
              <CardDescription>
                Your latest certificate verification results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                  </div>
                ) : recentVerifications.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-600 mb-4">No validations yet</p>
                    <Button onClick={() => onNavigate('upload')} size="sm">
                      Upload Your First Certificate
                    </Button>
                  </div>
                ) : (
                  recentVerifications.map((cert) => (
                    <div key={cert.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">
                          {cert.fileName}
                        </p>
                        <p className="text-sm text-slate-600">
                          {cert.metadata?.institution || 'Unknown'} • {new Date(cert.validatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className={`font-medium ${getScoreColor(cert.confidenceScore)}`}>
                            {cert.confidenceScore}%
                          </div>
                          <div className="text-xs text-slate-500">confidence</div>
                        </div>
                        {getStatusBadge(cert.authenticity)}
                      </div>
                    </div>
                  ))
                )}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => onNavigate('history')}
                >
                  View All Validations
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>
              Current performance metrics and system health
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">AI Detection Engine</span>
                  <span className="text-sm text-green-600">Operational</span>
                </div>
                <Progress value={98} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">OCR Processing</span>
                  <span className="text-sm text-green-600">Operational</span>
                </div>
                <Progress value={95} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Database Connectivity</span>
                  <span className="text-sm text-green-600">Operational</span>
                </div>
                <Progress value={99} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Blockchain Verification</span>
                  <span className="text-sm text-yellow-600">Maintenance</span>
                </div>
                <Progress value={87} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}