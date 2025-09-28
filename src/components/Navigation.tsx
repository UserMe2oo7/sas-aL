import { Button } from "./ui/button";
import { Shield, Menu, X } from "lucide-react";
import { useState } from "react";

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isLoggedIn: boolean;
  userRole?: string;
  onLogout: () => void;
}

export function Navigation({ currentPage, onNavigate, isLoggedIn, userRole, onLogout }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = isLoggedIn 
    ? [
        { name: 'Dashboard', page: 'dashboard' },
        { name: 'Validate', page: 'upload' },
        { name: 'History', page: 'history' },
        { name: 'QR Verify', page: 'qr-verify' },
        { name: 'PDF Demo', page: 'pdf-demo' }
      ]
    : [
        { name: 'Home', page: 'home' },
        { name: 'QR Verify', page: 'qr-verify' },
        { name: 'PDF Demo', page: 'pdf-demo' },
        { name: 'FAQ', page: 'faq' }
      ];

  return (
    <nav className="bg-card/95 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => onNavigate(isLoggedIn ? 'dashboard' : 'home')}
          >
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold text-foreground">
              AuthenLedger
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className={`px-3 py-2 rounded-md transition-colors ${
                  currentPage === item.page
                    ? 'text-primary bg-accent'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">
                  {userRole === 'admin' ? 'Admin' : 'User'}
                </span>
                <Button onClick={onLogout} variant="outline">
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button onClick={() => onNavigate('login')} variant="outline">
                  Login
                </Button>
                <Button onClick={() => onNavigate('signup')}>
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4">
            <div className="flex flex-col space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => {
                    onNavigate(item.page);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`px-3 py-2 rounded-md text-left transition-colors ${
                    currentPage === item.page
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {item.name}
                </button>
              ))}
              {isLoggedIn ? (
                <div className="pt-2 border-t border-slate-200">
                  <span className="block px-3 py-2 text-sm text-slate-600">
                    Role: {userRole === 'admin' ? 'Admin' : 'User'}
                  </span>
                  <Button 
                    onClick={() => {
                      onLogout();
                      setIsMobileMenuOpen(false);
                    }} 
                    variant="outline"
                    className="w-full mt-2"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 pt-2 border-t border-slate-200">
                  <Button 
                    onClick={() => {
                      onNavigate('login');
                      setIsMobileMenuOpen(false);
                    }} 
                    variant="outline"
                  >
                    Login
                  </Button>
                  <Button 
                    onClick={() => {
                      onNavigate('signup');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}