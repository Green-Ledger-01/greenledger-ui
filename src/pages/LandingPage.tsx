import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Leaf,
  Shield,
  Truck,
  Users,
  ArrowRight,
  CheckCircle,
  Globe,
  Zap,
  BarChart3,
  Lock,
  Smartphone,
  Star,
  Menu,
  X
} from 'lucide-react';
import ConnectButtonWrapper from '../components/ConnectButtonWrapper';
import { useAccount } from 'wagmi';

// Carousel styles
const carouselStyles = `
  @keyframes fade-in-out {
    0%, 33.33% { opacity: 1; }
    33.34%, 100% { opacity: 0; }
  }
  .animate-fade-in-out {
    animation: fade-in-out 9s infinite;
  }
  .animation-delay-3000 {
    animation-delay: 3s;
  }
  .animation-delay-6000 {
    animation-delay: 9s;
  }
`;

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const [activeSection, setActiveSection] = useState('hero');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Inject carousel styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = carouselStyles;
    document.head.appendChild(styleElement);
    return () => document.head.removeChild(styleElement);
  }, []);

  const handleGetStarted = () => {
    if (isConnected) {
      navigate('/dashboard');
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const navigationItems = [
    { id: 'hero', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'benefits', label: 'Benefits' },
    { id: 'stats', label: 'Stats' },
    { id: 'cta', label: 'Get Started' }
  ];

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = navigationItems.map(item => item.id);
      const scrollPosition = window.scrollY + 100;

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Shield,
      title: 'Blockchain Security',
      description: 'Immutable records powered by blockchain technology ensure data integrity and transparency.',
      color: 'text-blue-600'
    },
    {
      icon: Truck,
      title: 'Supply Chain Tracking',
      description: 'Track your produce from farm to table with complete visibility and provenance.',
      color: 'text-green-600'
    },
    {
      icon: Users,
      title: 'Multi-Stakeholder Platform',
      description: 'Connect farmers, distributors, retailers, and consumers in one unified ecosystem.',
      color: 'text-purple-600'
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Get insights into your supply chain performance with comprehensive analytics.',
      color: 'text-orange-600'
    },
    {
      icon: Lock,
      title: 'Data Privacy',
      description: 'Your data is secure with enterprise-grade encryption and privacy controls.',
      color: 'text-red-600'
    },
    {
      icon: Smartphone,
      title: 'Mobile Ready',
      description: 'Access your supply chain data anywhere with our responsive mobile interface.',
      color: 'text-indigo-600'
    }
  ];

  const benefits = [
    'Reduce food fraud and counterfeiting',
    'Improve supply chain efficiency',
    'Enhance consumer trust and transparency',
    'Streamline compliance and auditing',
    'Enable rapid issue identification and recall',
    'Support sustainable farming practices'
  ];

  const stats = [
    { number: '10,000+', label: 'Crop Batches Tracked' },
    { number: '500+', label: 'Verified Farmers' },
    { number: '99.9%', label: 'Data Accuracy' },
    { number: '24/7', label: 'System Availability' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-green-600">GreenLedger</h1>
                <p className="text-xs text-gray-500">Bringing Trust to Agriculture with Blockchain Technology</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg ${
                    activeSection === item.id
                      ? 'text-green-600 bg-green-50 font-semibold'
                      : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

              {/* Auth Buttons Card */}
              <div className="hidden sm:block">
                {isConnected ? (
                  <button
                    onClick={handleGetStarted}
                    className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                  >
                    Go to Dashboard
                  </button>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                    <ConnectButtonWrapper variant="compact" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-100 py-4 bg-white">
              <div className="flex flex-col space-y-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeSection === item.id
                        ? 'text-green-600 bg-green-50 font-semibold'
                        : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}

                {/* Mobile Auth Button */}
                <div className="px-4 pt-4 border-t border-gray-100 sm:hidden">
                  {isConnected ? (
                    <button
                      onClick={handleGetStarted}
                      className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Go to Dashboard
                    </button>
                  ) : (
                    <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <ConnectButtonWrapper variant="compact" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

     {/* Hero Section */}
<section id="hero" className="relative overflow-hidden min-h-screen">
  {/* Image Carousel Background */}
  <div className="absolute inset-0 z-0">
    <div className="relative w-full h-full">
      <img 
        src="/images/hero1.jpg" 
        alt="Agriculture" 
        className="absolute inset-0 w-full h-full object-cover animate-fade-in-out"
      />
      <img 
        src="/images/hero2.jpg" 
        alt="Farming" 
        className="absolute inset-0 w-full h-full object-cover animate-fade-in-out animation-delay-3000"
      />
      <img 
        src="/images/hero3.jpg" 
        alt="Supply Chain" 
        className="absolute inset-0 w-full h-full object-cover animate-fade-in-out animation-delay-6000"
      />
    </div>
    {/* Overlay for better text readability */}
    <div className="absolute inset-0 bg-green-900/70 backdrop-blur-[1px] z-10"></div>
  </div>

  <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 min-h-screen flex items-center">
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      <div className="space-y-8 text-white lg:text-left">
        <div className="space-y-6">
          <h1 className="text-4xl lg:text-6xl font-bold leading-tight drop-shadow-lg">
            Bringing Trust to
            <span className="block text-green-200">Agriculture</span>
            with Blockchain Technology
          </h1>
          <p className="text-xl text-green-100 leading-relaxed drop-shadow-md">
            Track your produce from farm to table with transparent, immutable records
            powered by Web3 technology.
          </p>
        </div>

        {/* Login Options Card */}
        {!isConnected ? (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-6 w-6 text-green-200" />
              <h3 className="text-lg font-semibold text-white">Get Started</h3>
            </div>
            <div className="space-y-3">
              <ConnectButtonWrapper variant="primary" />
              <div className="text-center text-green-100">
                <span className="text-sm">or</span>
              </div>
              <button
                onClick={() => navigate('/waitlist')}
                className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 px-6 py-3 rounded-lg transition-all duration-200 font-medium"
              >
                Join Our Waitlist
              </button>
              <p className="text-sm text-green-100 text-center">
                Secure authentication with blockchain technology
              </p>
            </div>
            <div className="flex items-center justify-center space-x-6 text-sm text-green-200 pt-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Decentralized</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Private</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="h-6 w-6 text-green-200" />
              <h3 className="text-lg font-semibold text-white">Wallet Connected</h3>
            </div>
            <button
              onClick={handleGetStarted}
              className="w-full bg-white text-green-600 px-8 py-4 rounded-xl hover:bg-green-50 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              <Zap className="mr-2 h-5 w-5" />
              Enter Dashboard
            </button>
          </div>
        )}
      </div>

      <div className="relative">
        <div className="relative z-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/50">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Truck className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Live Supply Chain</h3>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 font-medium">Live</span>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { stage: 'Farm Origin', icon: Leaf, active: true },
                { stage: 'Processing', icon: Shield, active: true },
                { stage: 'Distribution', icon: Truck, active: true },
                { stage: 'Retail', icon: Users, active: false }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.stage} className="flex items-center space-x-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      item.active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <span className={`font-medium ${item.active ? 'text-gray-900' : 'text-gray-400'}`}>
                        {item.stage}
                      </span>
                      {item.active && (
                        <div className="w-full bg-green-100 rounded-full h-2 mt-1">
                          <div className="bg-green-600 h-2 rounded-full" style={{width: `${(index + 1) * 25}%`}}></div>
                        </div>
                      )}
                    </div>
                    {item.active && <CheckCircle className="h-5 w-5 text-green-500" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="absolute -top-4 -right-4 h-24 w-24 bg-green-200/60 rounded-full animate-float opacity-80"></div>
        <div className="absolute -bottom-4 -left-4 h-16 w-16 bg-green-300/60 rounded-full animate-float opacity-80" style={{animationDelay: '2s'}}></div>
      </div>
    </div>
  </div>

  {/* Animated particles overlay */}
  <div className="absolute inset-0 pointer-events-none z-5">
    <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
    <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-green-200/40 rounded-full animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
    <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
  </div>
</section>
      {/* Stats Section */}
      <section id="stats" className="relative overflow-hidden py-16">
        <div className="absolute inset-0 flex">
          <div className="w-1/2 bg-green-600"></div>
          <div className="w-1/2 bg-green-600"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Agricultural Leaders
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of farmers, distributors, and retailers transforming their supply chains
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-2">{stat.number}</div>
                  <div className="text-gray-700 font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative overflow-hidden py-20">
        <div className="absolute inset-0 flex">
          <div className="w-1/2 bg-green-600"></div>
          <div className="w-1/2 bg-green-600"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Powerful Features for Modern Agriculture
            </h2>
            <p className="text-xl text-green-100 max-w-3xl mx-auto mb-12">
              Our comprehensive platform provides everything you need to manage, track,
              and optimize your agricultural supply chain.
            </p>
            
            {/* Video Showcase */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-16">
              <h3 className="text-2xl font-bold text-white mb-6">See GreenLedger in Action</h3>
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl">
                <video
                  controls
                  className="w-full h-full object-cover"
                  poster="/images/video-thumbnail.jpg"
                >
                  <source src="/images/GreenLedger_ Transforming Agriculture with Blockchain.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <p className="text-green-100 mt-4 text-lg">
                Watch how GreenLedger transforms agricultural supply chains with blockchain technology
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <div className={`h-14 w-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-6 shadow-lg`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="relative overflow-hidden py-20">
        {/* Split Background - Reversed */}
        <div className="absolute inset-0 flex">
          <div className="w-1/2 bg-green-600"></div>
          <div className="w-1/2 bg-green-600"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Why Choose GreenLedger?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Transform your agricultural business with cutting-edge blockchain technology
                that delivers real results.
              </p>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-white">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Globe className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold">Global Impact</h3>
                  </div>
                  <p className="text-green-100 text-lg leading-relaxed">
                    Join thousands of farmers, distributors, and retailers who are already
                    transforming their supply chains with GreenLedger.
                  </p>
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-green-100 font-medium">Verified Users</span>
                      <span className="text-white font-bold text-xl">500+</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex -space-x-2">
                        {[1,2,3,4,5].map(i => (
                          <div key={i} className="h-8 w-8 bg-white rounded-full border-2 border-green-400 flex items-center justify-center">
                            <Users className="h-4 w-4 text-green-600" />
                          </div>
                        ))}
                      </div>
                      <span className="text-green-100">Growing community</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="relative overflow-hidden py-20">
        {/* Split Background */}
        <div className="absolute inset-0 flex">
          <div className="w-1/2 bg-green-600"></div>
          <div className="w-1/2 bg-green-600"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h2 className="text-3xl lg:text-5xl font-bold mb-6 leading-tight">
                Ready to Transform Your Supply Chain?
              </h2>
              <p className="text-xl text-green-100 mb-8 leading-relaxed">
                Join the agricultural revolution today and bring transparency, trust,
                and traceability to your supply chain.
              </p>

              <div className="flex items-center space-x-6 text-green-200">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Fast</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Global</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100">
              <div className="text-center mb-6">
                <div className="h-16 w-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Leaf className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Get Started Today</h3>
                <p className="text-gray-600">
                  Connect your wallet and start building trust in your supply chain
                </p>
              </div>

              {isConnected ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-green-800 font-medium">Wallet Connected Successfully!</p>
                  </div>
                  <button
                    onClick={handleGetStarted}
                    className="w-full bg-green-600 text-white px-8 py-4 rounded-xl hover:bg-green-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center"
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    Enter Dashboard
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <ConnectButtonWrapper variant="primary" />
                  </div>
                  <div className="text-center text-gray-400">
                    <span className="text-sm">or</span>
                  </div>
                  <button
                    onClick={() => navigate('/waitlist')}
                    className="w-full bg-white border-2 border-green-600 text-green-600 px-8 py-4 rounded-xl hover:bg-green-50 transition-all duration-200 font-semibold text-lg flex items-center justify-center"
                  >
                    <Users className="mr-2 h-5 w-5" />
                    Join Our Waitlist
                  </button>
                  <p className="text-gray-500 text-sm text-center">
                    Secure authentication with blockchain technology
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-green-600 flex items-center justify-center">
                  <Leaf className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">GreenLedger</h3>
                  <p className="text-green-400 text-sm">Blockchain Agriculture</p>
                </div>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Revolutionizing agricultural supply chains with blockchain technology.
                Bringing transparency, trust, and traceability to food production worldwide.
              </p>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex space-x-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-gray-300 font-medium">Trusted by farmers worldwide</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span>Blockchain Secured</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-green-400" />
                  <span>Global Network</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6">Platform</h4>
              <ul className="space-y-3 text-gray-300">
                <li className="hover:text-green-400 transition-colors cursor-pointer">Supply Chain Tracking</li>
                <li className="hover:text-green-400 transition-colors cursor-pointer">Crop Tokenization</li>
                <li className="hover:text-green-400 transition-colors cursor-pointer">Marketplace</li>
                <li className="hover:text-green-400 transition-colors cursor-pointer">Analytics</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6">Support</h4>
              <ul className="space-y-3 text-gray-300">
                <li className="hover:text-green-400 transition-colors cursor-pointer">Documentation</li>
                <li className="hover:text-green-400 transition-colors cursor-pointer">Help Center</li>
                <li className="hover:text-green-400 transition-colors cursor-pointer">Community</li>
                <li className="hover:text-green-400 transition-colors cursor-pointer">Contact Us</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-center md:text-left">
                &copy; 2025 GreenLedger. All rights reserved. Powered by blockchain technology.
              </p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <span className="text-gray-400 text-sm">Built with</span>
                <div className="flex items-center space-x-2">
                  <div className="h-6 w-6 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">R</span>
                  </div>
                  <span className="text-gray-400 text-sm">React</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-6 w-6 bg-purple-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">W3</span>
                  </div>
                  <span className="text-gray-400 text-sm">Web3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
