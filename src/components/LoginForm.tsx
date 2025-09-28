import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Eye, EyeOff, Mail, Lock, Shield } from "lucide-react";

interface LoginFormProps {
  onLogin: (email: string, password: string, role: string) => void;
  onNavigate: (page: string) => void;
}

export function LoginForm({ onLogin, onNavigate }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Basic validation
    if (!email || !password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      console.log('Attempting login with:', { email, password: '***' });
      
      // First, test if server is reachable
      let serverAvailable = false;
      try {
        const healthResponse = await fetch(`https://tbmtmjtmjttprfczmhvu.supabase.co/functions/v1/make-server-1f1a48b6/health`);
        console.log('Health check response:', healthResponse.status);
        serverAvailable = healthResponse.ok;
      } catch (healthError) {
        console.error('Server health check failed:', healthError);
        serverAvailable = false;
      }

      if (!serverAvailable) {
        // Fallback to demo mode if server is not available
        console.log('Server not available, using demo mode');
        
        // Check demo credentials
        if (email === 'demo@test.com' && password === 'password123') {
          const mockSession = {
            access_token: 'demo-token-' + Date.now(),
            user: {
              id: 'demo-user',
              email: email,
              user_metadata: {
                name: 'Demo User',
                role: 'user'
              }
            },
            expires_at: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
          };
          
          localStorage.setItem('supabase_session', JSON.stringify(mockSession));
          onLogin(email, password, 'user');
          return;
        } else {
          throw new Error('Server is not available. Please use demo credentials: demo@test.com / password123');
        }
      }

      const response = await fetch(`https://tbmtmjtmjttprfczmhvu.supabase.co/functions/v1/make-server-1f1a48b6/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Login failed';
        try {
          const errorData = await response.json();
          console.log('Error response data:', errorData);
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorMessage = `Server error (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Login successful, data:', { ...data, session: data.session ? 'present' : 'missing' });

      // Store session in localStorage for persistence
      if (data.session) {
        localStorage.setItem('supabase_session', JSON.stringify(data.session));
      }

      const role = data.user?.role === 'administrator' ? 'admin' : 'user';
      onLogin(email, password, role);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
          <p className="text-slate-600">Sign in to your account</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Login</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    id="remember"
                    type="checkbox"
                    className="rounded border-slate-300"
                  />
                  <Label htmlFor="remember" className="text-sm">
                    Remember me
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('forgot-password')}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Don't have an account?{" "}
                <button
                  onClick={() => onNavigate('signup')}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Sign up
                </button>
              </p>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800 font-medium mb-2">✨ Demo Mode Available:</p>
              <p className="text-xs text-blue-700">Email: demo@test.com</p>
              <p className="text-xs text-blue-700">Password: password123</p>
              <p className="text-xs text-blue-600 mt-1">If server is unavailable, demo mode will automatically activate</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}