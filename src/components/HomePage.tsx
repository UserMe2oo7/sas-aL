import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Shield, FileCheck, Brain, ChartBar, Users, Lock, QrCode } from "lucide-react";

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
            Authenticate Academic
            <span className="text-primary"> Certificates</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Protect academic integrity with our AI-powered certificate validation platform. 
            Detect forgeries, plagiarism, and AI-generated content with industry-leading accuracy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => onNavigate('signup')} className="text-lg px-8 py-3">
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => onNavigate('qr-verify')} className="text-lg px-8 py-3 flex items-center space-x-2">
              <QrCode className="h-5 w-5" />
              <span>Verify QR Code</span>
            </Button>
          </div>
          <div className="mt-12 bg-card backdrop-blur-sm p-6 rounded-lg shadow-lg border border-border inline-block">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-semibold text-green-600">98.7% Detection Accuracy</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Comprehensive Validation Suite
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our advanced AI algorithms analyze certificates across multiple dimensions to ensure authenticity and detect sophisticated forgeries.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: FileCheck,
                title: "Document Analysis",
                description: "Advanced OCR and layout analysis to extract and verify certificate data with precision.",
                color: "blue"
              },
              {
                icon: Brain,
                title: "AI Detection",
                description: "Machine learning models trained to identify AI-generated content and sophisticated forgeries.",
                color: "green"
              },
              {
                icon: QrCode,
                title: "QR Code Verification",
                description: "Generate and verify cryptographic QR codes with digital watermarks for tamper-proof certificates.",
                color: "cyan"
              },
              {
                icon: Shield,
                title: "Authenticity Verification",
                description: "Cross-reference with institutional databases and blockchain records for ultimate verification.",
                color: "purple"
              },
              {
                icon: ChartBar,
                title: "Detailed Reports",
                description: "Comprehensive analysis reports with confidence scores and highlighted areas of concern.",
                color: "orange"
              },
              {
                icon: Users,
                title: "Institution Portal",
                description: "Dedicated dashboards for educational institutions to manage and verify their certificates.",
                color: "indigo"
              },
              {
                icon: Lock,
                title: "Secure & Private",
                description: "End-to-end encryption and strict privacy controls to protect sensitive academic data.",
                color: "red"
              }
            ].map((feature, index) => (
              <Card key={index} className="border border-border shadow-sm hover:shadow-md transition-all duration-300 bg-card">
                <CardContent className="p-8">
                  <div className={`w-12 h-12 rounded-lg bg-${feature.color}-50 flex items-center justify-center mb-6`}>
                    <feature.icon className={`h-6 w-6 text-${feature.color}-600`} />
                  </div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "10,000+", label: "Certificates Verified" },
              { number: "500+", label: "Partner Institutions" },
              { number: "98.7%", label: "Detection Accuracy" },
              { number: "24/7", label: "Support Available" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-neutral-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-neutral-800 to-neutral-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Secure Academic Integrity?
          </h2>
          <p className="text-xl text-neutral-200 mb-8 leading-relaxed">
            Join thousands of institutions already using our platform to validate certificates and maintain academic standards.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => onNavigate('signup')} className="text-lg px-8 py-3">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" onClick={() => onNavigate('contact')} className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-neutral-900">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}