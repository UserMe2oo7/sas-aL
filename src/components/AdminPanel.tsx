import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  Clock, 
  FileCheck, 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Database,
  Settings,
  Activity
} from "lucide-react";

interface AdminPanelProps {
  onNavigate: (page: string) => void;
}

export function AdminPanel({ onNavigate }: AdminPanelProps) {
  const [systemStats, setSystemStats] = useState({
    dailyValidations: 0,
    systemHealth: 'operational',
    storageUsed: 0,
    avgProcessingTime: 0
  });

  useEffect(() => {
    // Minimal analytics with very low values
    setSystemStats({
      dailyValidations: 8,
      systemHealth: 'operational',
      storageUsed: 0.3,
      avgProcessingTime: 1.2
    });
  }, []);

  const systemHealthColor = systemStats.systemHealth === 'operational' ? 'text-green-600' : 'text-red-600';

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">
            Monitor system performance and manage platform operations
          </p>
        </div>

        {/* System Status Alert */}
        <Alert className="mb-6 border-green-200 bg-green-50">
          <Shield className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            All systems operational. Last updated: {new Date().toLocaleString()}
          </AlertDescription>
        </Alert>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Validations</CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.dailyValidations}</div>
              <p className="text-xs text-muted-foreground">
                +2 since yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Processing</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.avgProcessingTime}s</div>
              <p className="text-xs text-muted-foreground">
                per document
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${systemHealthColor}`}>
                {systemStats.systemHealth}
              </div>
              <p className="text-xs text-muted-foreground">
                99.9% uptime
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.storageUsed} GB</div>
              <p className="text-xs text-muted-foreground">
                of 500 GB limit
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Management Cards */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>System Management</span>
              </CardTitle>
              <CardDescription>
                Core system configuration and maintenance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Database className="mr-2 h-4 w-4" />
                Database Maintenance
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="mr-2 h-4 w-4" />
                Security Settings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Error Logs
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Analytics & Reports</span>
              </CardTitle>
              <CardDescription>
                Performance insights and system reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                Validation Trends
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="mr-2 h-4 w-4" />
                Security Reports
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Activity className="mr-2 h-4 w-4" />
                Performance Metrics
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>System Analytics</CardTitle>
            <CardDescription>
              Platform performance metrics and insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  metric: "Validation Accuracy",
                  value: "98.7%",
                  change: "+0.2% from last week",
                  type: "success"
                },
                {
                  metric: "Average Response Time",
                  value: "1.2s",
                  change: "-0.3s improvement",
                  type: "success"
                },
                {
                  metric: "System Uptime",
                  value: "99.9%",
                  change: "No downtime this month",
                  type: "success"
                },
                {
                  metric: "AI Model Confidence",
                  value: "96.4%",
                  change: "Stable performance",
                  type: "info"
                }
              ].map((analytic, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      analytic.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                    }`}></div>
                    <div>
                      <h4 className="font-medium text-slate-900">{analytic.metric}</h4>
                      <p className="text-sm text-slate-600">{analytic.change}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-slate-900">{analytic.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Button onClick={() => onNavigate('upload')}>
            Upload Test Certificate
          </Button>
          <Button variant="outline" onClick={() => onNavigate('history')}>
            View All Validations
          </Button>
          <Button variant="outline">
            Export System Report
          </Button>
          <Button variant="outline">
            Backup Database
          </Button>
        </div>
      </div>
    </div>
  );
}