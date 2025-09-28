import { useState, useEffect } from "react";
import { Navigation } from "./components/Navigation";
import { HomePage } from "./components/HomePage";
import { LoginForm } from "./components/LoginForm";
import { SignupForm } from "./components/SignupForm";
import { Dashboard } from "./components/Dashboard";
import { UploadSection } from "./components/UploadSection";
import { ResultsPage } from "./components/ResultsPage";

import { FAQPage } from "./components/FAQPage";
import { ValidationHistory } from "./components/ValidationHistory";
import { AdminPanel } from "./components/AdminPanel";
import { QRVerification } from "./components/QRVerification";
import { PDFDemo } from "./components/PDFDemo";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [userData, setUserData] = useState<any>(null);
  const [pageData, setPageData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionData = localStorage.getItem('supabase_session');
        if (sessionData) {
          const session = JSON.parse(sessionData);
          
          // Check if session is still valid (not expired)
          const currentTime = Math.floor(Date.now() / 1000);
          if (session.expires_at && session.expires_at > currentTime) {
            setIsLoggedIn(true);
            setUserRole(session.user?.user_metadata?.role === 'administrator' ? 'admin' : 'user');
            setUserData(session.user);
            setCurrentPage("dashboard");
          } else {
            // Session expired, remove it
            localStorage.removeItem('supabase_session');
          }
        }

        // Initialize backend
        await fetch(`https://tbmtmjtmjttprfczmhvu.supabase.co/functions/v1/make-server-1f1a48b6/init`);
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleLogin = (email: string, password: string, role: string) => {
    setIsLoggedIn(true);
    setUserRole(role);
    setUserData({ email, role });
    setCurrentPage("dashboard");
  };

  const handleSignup = (formData: any) => {
    setIsLoggedIn(true);
    setUserRole(formData.role === 'administrator' ? 'admin' : 'user');
    setUserData(formData);
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    // Clear session from localStorage
    localStorage.removeItem('supabase_session');
    setIsLoggedIn(false);
    setUserRole("");
    setUserData(null);
    setCurrentPage("home");
  };

  const handleNavigate = (page: string, data?: any) => {
    // Check if user needs to be logged in for certain pages
    const protectedPages = ['dashboard', 'upload', 'results', 'history'];
    
    if (protectedPages.includes(page) && !isLoggedIn) {
      setCurrentPage('login');
      return;
    }

    setCurrentPage(page);
    if (data) {
      setPageData(data);
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage onNavigate={handleNavigate} />;
      case "login":
        return <LoginForm onLogin={handleLogin} onNavigate={handleNavigate} />;
      case "signup":
        return <SignupForm onSignup={handleSignup} onNavigate={handleNavigate} />;
      case "dashboard":
        return <Dashboard userRole={userRole} onNavigate={handleNavigate} />;
      case "upload":
        return <UploadSection onNavigate={handleNavigate} />;
      case "results":
        return (
          <ResultsPage
            results={pageData?.results || []}
            uploadedFiles={pageData?.uploadedFiles || []}
            onNavigate={handleNavigate}
          />
        );

      case "faq":
        return <FAQPage onNavigate={handleNavigate} />;
      case "history":
        return <ValidationHistory onNavigate={handleNavigate} />;
      case "qr-verify":
        return <QRVerification onNavigate={handleNavigate} />;
      case "pdf-demo":
        return <PDFDemo />;
      case "admin":
        return userRole === 'admin' ? <AdminPanel onNavigate={handleNavigate} /> : <Dashboard userRole={userRole} onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  // Show loading screen while checking session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isLoggedIn={isLoggedIn}
        userRole={userRole}
        onLogout={handleLogout}
      />
      {renderCurrentPage()}
    </div>
  );
}