import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Badge } from "./ui/badge";
import { Search, HelpCircle, Shield, Zap, Users, CreditCard, Settings, Globe } from "lucide-react";

interface FAQPageProps {
  onNavigate: (page: string) => void;
}

export function FAQPage({ onNavigate }: FAQPageProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const faqCategories = [
    {
      id: "general",
      title: "General Questions",
      icon: HelpCircle,
      color: "blue",
      faqs: [
        {
          question: "What is AuthenLedger?",
          answer: "AuthenLedger is an AI-powered platform that helps institutions and individuals verify the authenticity of academic certificates. We use advanced machine learning, OCR technology, and blockchain verification to detect forged, tampered, or AI-generated documents."
        },
        {
          question: "How accurate is your detection system?",
          answer: "Our platform achieves 99.2% accuracy in detecting forged and AI-generated certificates. This high accuracy is maintained through continuous machine learning model updates, trained on millions of verified documents and known fraud patterns."
        },
        {
          question: "What types of documents can I validate?",
          answer: "We support academic certificates, diplomas, transcripts, professional licenses, and other educational credentials. Supported formats include PDF, DOCX, DOC, JPG, PNG, and TXT files up to 10MB each."
        },
        {
          question: "How long does validation take?",
          answer: "Most documents are processed in under 3 seconds. Complex documents or batch uploads may take slightly longer, but our optimized processing pipeline ensures rapid results without compromising accuracy."
        }
      ]
    },
    {
      id: "security",
      title: "Security & Privacy",
      icon: Shield,
      color: "green",
      faqs: [
        {
          question: "How do you protect my sensitive documents?",
          answer: "We use end-to-end encryption for all uploads and communications. Documents are processed in secure, isolated environments and are automatically deleted after analysis. We never permanently store sensitive document content."
        },
        {
          question: "Are you compliant with data protection regulations?",
          answer: "Yes, we comply with GDPR, CCPA, FERPA, and other international data protection standards. We're also SOC 2 Type II certified and undergo regular security audits to maintain the highest standards."
        },
        {
          question: "Who has access to uploaded documents?",
          answer: "Only authorized system processes access your documents during validation. Our staff cannot view document contents, and all processing is automated. Access logs are maintained for security and compliance purposes."
        },
        {
          question: "How do you prevent data breaches?",
          answer: "We employ multiple security layers including encryption at rest and in transit, network security controls, access monitoring, regular security assessments, and incident response procedures. Our infrastructure is hosted on secure, certified cloud platforms."
        }
      ]
    },
    {
      id: "technical",
      title: "Technical Details",
      icon: Settings,
      color: "purple",
      faqs: [
        {
          question: "How does your AI detection work?",
          answer: "Our AI uses computer vision and natural language processing to analyze document layout, fonts, signatures, seals, and content patterns. Machine learning models trained on millions of authentic documents can identify subtle inconsistencies that indicate forgery or AI generation."
        },
        {
          question: "What is OCR and how do you use it?",
          answer: "Optical Character Recognition (OCR) extracts text from scanned images. Our advanced OCR engine can read text from certificates even with poor quality scans, different fonts, or complex layouts, converting them into structured data for analysis."
        },
        {
          question: "Do you use blockchain verification?",
          answer: "Yes, when available. We integrate with institutional blockchain networks where certificates are recorded. This provides an additional verification layer by checking if the certificate hash exists on the institution's distributed ledger."
        },
        {
          question: "Can I integrate your API with our system?",
          answer: "Absolutely! We offer RESTful APIs for seamless integration with your existing systems. Our API supports bulk uploads, real-time validation, webhook notifications, and custom reporting. Comprehensive documentation and SDKs are available."
        }
      ]
    },
    {
      id: "institutions",
      title: "For Institutions",
      icon: Users,
      color: "indigo",
      faqs: [
        {
          question: "How can universities partner with you?",
          answer: "We offer institutional partnerships that include bulk validation services, API integration, custom dashboards, staff training, and blockchain certificate issuance. Contact our academic relations team to discuss partnership opportunities."
        },
        {
          question: "Do you offer bulk validation for large volumes?",
          answer: "Yes, our enterprise solutions support bulk uploads of thousands of documents simultaneously. We provide dedicated processing queues, priority support, and custom reporting for high-volume institutional needs."
        },
        {
          question: "Can you help us issue tamper-proof certificates?",
          answer: "Yes! We can help institutions implement blockchain-based certificate issuance with cryptographic QR codes and digital watermarks. This creates immutable records that can be instantly verified through our platform."
        },
        {
          question: "What training do you provide for our staff?",
          answer: "We offer comprehensive training programs including platform usage, best practices for certificate verification, fraud detection techniques, and API integration workshops. Training can be conducted on-site or virtually."
        }
      ]
    },
    {
      id: "pricing",
      title: "Pricing & Plans",
      icon: CreditCard,
      color: "orange",
      faqs: [
        {
          question: "What are your pricing plans?",
          answer: "We offer flexible pricing including a free tier (10 validations/month), professional plans ($29/month for 500 validations), and enterprise solutions with custom pricing. Volume discounts and institutional rates are available."
        },
        {
          question: "Is there a free trial available?",
          answer: "Yes! New users get 10 free validations to test our platform. No credit card required for the trial. You can upgrade to a paid plan anytime to access additional features and higher validation limits."
        },
        {
          question: "Do you offer discounts for educational institutions?",
          answer: "Yes, we provide significant discounts for accredited educational institutions, non-profits, and government agencies. Contact our sales team to discuss special academic pricing and partnership opportunities."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards, ACH transfers, and wire transfers for enterprise customers. Educational institutions can also pay via purchase orders and institutional billing arrangements."
        }
      ]
    },
    {
      id: "support",
      title: "Support & Troubleshooting",
      icon: Zap,
      color: "red",
      faqs: [
        {
          question: "What support options are available?",
          answer: "We offer email support (24-hour response), live chat for premium users, phone support for enterprise customers, and comprehensive documentation. Our support team includes technical experts and academic integrity specialists."
        },
        {
          question: "Why is my document showing as suspicious?",
          answer: "Documents may be flagged for various reasons: formatting inconsistencies, signature anomalies, date discrepancies, or unusual metadata. Review the detailed analysis report for specific issues. Contact support if you believe there's an error."
        },
        {
          question: "Can I appeal a validation result?",
          answer: "Yes, if you believe a result is incorrect, you can request a manual review through our appeals process. Our expert team will conduct a detailed analysis and provide additional feedback within 2-3 business days."
        },
        {
          question: "How do I report a bug or request a feature?",
          answer: "Use our built-in feedback system, email support@authenticity-validator.com, or contact your account manager. We regularly update our platform based on user feedback and maintain a public roadmap of upcoming features."
        }
      ]
    }
  ];

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  const allFAQs = faqCategories.flatMap(category => category.faqs);
  const totalFAQs = allFAQs.length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-slate-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed mb-8">
            Find answers to common questions about our certificate validation platform
          </p>

          {/* Search */}
          <div className="max-w-lg mx-auto relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3 text-lg"
            />
          </div>

          {searchTerm && (
            <p className="mt-4 text-slate-600">
              Found {filteredFAQs.reduce((acc, cat) => acc + cat.faqs.length, 0)} results for "{searchTerm}"
            </p>
          )}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Category Overview */}
        {!searchTerm && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {faqCategories.map((category) => (
              <Card key={category.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 bg-${category.color}-100 rounded-lg flex items-center justify-center`}>
                      <category.icon className={`h-5 w-5 text-${category.color}-600`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {category.faqs.length} questions
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        {/* FAQ Sections */}
        <div className="space-y-12">
          {filteredFAQs.map((category) => (
            <section key={category.id}>
              <div className="flex items-center space-x-3 mb-6">
                <div className={`w-8 h-8 bg-${category.color}-100 rounded-lg flex items-center justify-center`}>
                  <category.icon className={`h-4 w-4 text-${category.color}-600`} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">{category.title}</h2>
                <Badge variant="outline">{category.faqs.length} questions</Badge>
              </div>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-0">
                  <Accordion type="single" collapsible className="w-full">
                    {category.faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`${category.id}-${index}`} className="border-b last:border-b-0">
                        <AccordionTrigger className="px-6 py-4 text-left hover:no-underline hover:bg-slate-50">
                          <span className="font-medium text-slate-900">{faq.question}</span>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-4">
                          <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </section>
          ))}
        </div>

        {/* No Results */}
        {searchTerm && filteredFAQs.length === 0 && (
          <div className="text-center py-16">
            <HelpCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No results found</h3>
            <p className="text-slate-600 mb-6">
              We couldn't find any FAQs matching "{searchTerm}". Try different keywords or browse our categories above.
            </p>
            <Button onClick={() => setSearchTerm("")} variant="outline">
              Clear Search
            </Button>
          </div>
        )}

        {/* Contact CTA */}
        <section className="mt-20">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
              <p className="text-blue-100 mb-6 text-lg">
                Can't find what you're looking for? Our support team is here to help you succeed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => onNavigate('home')} variant="secondary" size="lg">
                  Back to Home
                </Button>
                <Button onClick={() => onNavigate('signup')} variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                  Get Started
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">{totalFAQs}</div>
            <div className="text-sm text-slate-600">Total Questions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">6</div>
            <div className="text-sm text-slate-600">Categories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">24h</div>
            <div className="text-sm text-slate-600">Response Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">99%</div>
            <div className="text-sm text-slate-600">Satisfaction Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}