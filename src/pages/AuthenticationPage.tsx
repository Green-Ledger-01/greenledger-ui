import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import ConnectButtonWrapper from '../components/ConnectButtonWrapper';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Shield,
  Wallet,
  Zap,
  Globe,
  Lock,
  Users,
  Leaf,
  ArrowRight,
  CheckCircle,
  Star,
  TrendingUp,
  BarChart3,
  Smartphone,
  Award
} from 'lucide-react';

const AuthenticationPage: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect to dashboard when connected
  useEffect(() => {
    if (isConnected && !isRedirecting) {
      setIsRedirecting(true);
      navigate('/');
    }
  }, [isConnected, isRedirecting, navigate]);

  // Show loading state during redirect
  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center">
        <LoadingSpinner
          variant="branded"
          size="xl"
          text="Redirecting to dashboard..."
          className="p-8"
        />
      </div>
    );
  }

  const features = [
    {
      icon: Shield,
      title: 'Blockchain Security',
      description: 'Immutable records with enterprise-grade encryption and transparency',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: TrendingUp,
      title: 'Supply Chain Tracking',
      description: 'Real-time tracking from farm to table with complete visibility',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: Users,
      title: 'Multi-Stakeholder Platform',
      description: 'Connect farmers, distributors, retailers in one ecosystem',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Comprehensive insights and performance metrics dashboard',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      icon: Smartphone,
      title: 'Mobile Ready',
      description: 'Access your supply chain data anywhere with responsive design',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      icon: Award,
      title: 'Compliance & Certification',
      description: 'Automated compliance tracking and certification management',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Crop Batches Tracked', icon: '🌾' },
    { number: '500+', label: 'Verified Farmers', icon: '👨‍🌾' },
    { number: '99.9%', label: 'Data Accuracy', icon: '✅' },
    { number: '24/7', label: 'System Availability', icon: '🔄' }
  ];

  const benefits = [
    'Reduce food fraud and counterfeiting',
    'Improve supply chain efficiency by 40%',
    'Enhance consumer trust and transparency',
    'Streamline compliance and auditing',
    'Enable rapid issue identification and recall',
    'Support sustainable farming practices'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 bg-green-200 rounded-full opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 h-96 w-96 bg-blue-200 rounded-full opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-64 w-64 bg-purple-200 rounded-full opacity-10 animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-md border-b border-green-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full gradient-bg-primary flex items-center justify-center shadow-lg">
                  <Leaf className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold gradient-text">GreenLedger</h1>
                  <p className="text-xs text-gray-500">Agricultural Supply Chain</p>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-600">
                <a href="#features" className="hover:text-green-600 transition-colors">Features</a>
                <a href="#benefits" className="hover:text-green-600 transition-colors">Benefits</a>
                <a href="#stats" className="hover:text-green-600 transition-colors">Statistics</a>
                <a href="#connect" className="hover:text-green-600 transition-colors">Get Started</a>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-fade-in-down">
              <div className="flex items-center justify-center mb-8">
                <div className="h-20 w-20 rounded-full gradient-bg-primary flex items-center justify-center shadow-2xl animate-pulse-green mr-6">
                  <Leaf className="h-10 w-10 text-white" />
                </div>
                <div className="text-left">
                  <h1 className="text-5xl lg:text-7xl font-bold gradient-text leading-tight">GreenLedger</h1>
                  <p className="text-lg text-gray-500 mt-2">Agricultural Supply Chain Revolution</p>
                </div>
              </div>

              <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Transform Agriculture with
                <span className="gradient-text block">Blockchain Technology</span>
              </h2>

              <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto mb-8 leading-relaxed">
                Connect securely to track your produce from farm to table with transparent,
                immutable records powered by cutting-edge Web3 technology
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-6 mb-12">
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Blockchain Secured</span>
                </div>
                <div className="flex items-center space-x-2 text-blue-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Real-time Tracking</span>
                </div>
                <div className="flex items-center space-x-2 text-purple-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Global Network</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section id="stats" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Trusted by Agricultural Leaders Worldwide
              </h2>
              <p className="text-xl text-gray-600">Real numbers from our growing ecosystem</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center hover-lift">
                  <div className="text-4xl mb-2">{stat.icon}</div>
                  <div className="text-3xl lg:text-4xl font-bold gradient-text mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 gradient-bg-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Powerful Features for Modern Agriculture
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our comprehensive platform provides everything you need to manage, track,
                and optimize your agricultural supply chain.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover-lift">
                    <div className={`h-12 w-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                  Why Choose GreenLedger?
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Transform your agricultural business with cutting-edge blockchain technology
                  that delivers measurable results and builds consumer trust.
                </p>

                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-8 text-white shadow-2xl">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <Globe className="h-8 w-8" />
                      <h3 className="text-2xl font-bold">Global Impact</h3>
                    </div>
                    <p className="text-green-100 text-lg">
                      Join thousands of farmers, distributors, and retailers who are already
                      transforming their supply chains with GreenLedger.
                    </p>
                    <div className="flex items-center space-x-4">
                      <div className="flex -space-x-2">
                        {[1,2,3,4,5].map(i => (
                          <div key={i} className="h-10 w-10 bg-white rounded-full border-2 border-green-500 flex items-center justify-center">
                            <span className="text-green-600 font-bold text-sm">{i}</span>
                          </div>
                        ))}
                      </div>
                      <span className="text-green-100 font-medium">+500 verified users</span>
                    </div>
                    <div className="flex space-x-4">
                      <Star className="h-5 w-5 text-yellow-400" />
                      <Star className="h-5 w-5 text-yellow-400" />
                      <Star className="h-5 w-5 text-yellow-400" />
                      <Star className="h-5 w-5 text-yellow-400" />
                      <Star className="h-5 w-5 text-yellow-400" />
                      <span className="text-green-100 ml-2">Trusted worldwide</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Connection Section */}
        <section id="connect" className="py-20 gradient-bg-primary">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Supply Chain?
            </h2>
            <p className="text-xl text-green-100 mb-12 max-w-3xl mx-auto">
              Join the agricultural revolution today. Connect your wallet to start tracking
              your produce with blockchain-powered transparency.
            </p>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-3">
                  Choose Your Connection Method
                </h3>
                <p className="text-green-100">
                  Select the authentication method that works best for you
                </p>
              </div>

              <div className="max-w-md mx-auto">
                <ConnectButtonWrapper variant="secondary" />
              </div>

              <div className="mt-8 pt-6 border-t border-white/20">
                <div className="flex items-center justify-center space-x-6 text-sm text-green-100">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 mr-2" />
                    <span>Fast</span>
                  </div>
                  <div className="flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    <span>Reliable</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-green-100">
              <div className="bg-white/10 px-6 py-4 rounded-xl backdrop-blur-sm">
                <div className="text-2xl mb-2">🌾</div>
                <div className="font-semibold">1,200+ Farms</div>
                <div className="text-sm opacity-80">Connected</div>
              </div>
              <div className="bg-white/10 px-6 py-4 rounded-xl backdrop-blur-sm">
                <div className="text-2xl mb-2">🚛</div>
                <div className="font-semibold">500+ Transporters</div>
                <div className="text-sm opacity-80">Active</div>
              </div>
              <div className="bg-white/10 px-6 py-4 rounded-xl backdrop-blur-sm">
                <div className="text-2xl mb-2">🏪</div>
                <div className="font-semibold">800+ Buyers</div>
                <div className="text-sm opacity-80">Verified</div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 rounded-full gradient-bg-primary flex items-center justify-center">
                    <Leaf className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">GreenLedger</h3>
                    <p className="text-gray-400 text-sm">Agricultural Supply Chain</p>
                  </div>
                </div>
                <p className="text-gray-400 mb-6 max-w-md">
                  Revolutionizing agricultural supply chains with blockchain technology.
                  Bringing transparency, trust, and traceability to food production worldwide.
                </p>
                <div className="flex space-x-4">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <Star className="h-5 w-5 text-yellow-400" />
                  <Star className="h-5 w-5 text-yellow-400" />
                  <Star className="h-5 w-5 text-yellow-400" />
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span className="text-gray-400 ml-2">Trusted by farmers worldwide</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Platform</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Supply Chain Tracking</li>
                  <li>Crop Tokenization</li>
                  <li>Marketplace</li>
                  <li>Analytics Dashboard</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Documentation</li>
                  <li>Help Center</li>
                  <li>Community Forum</li>
                  <li>Contact Support</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 GreenLedger. All rights reserved.</p>
              <p className="mt-2 text-sm">
                Powered by Lisk Blockchain • Secured by Web3 Technology • Built for Agriculture
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AuthenticationPage;
