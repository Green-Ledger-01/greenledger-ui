import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

// Feature Card Component
const FeatureCard = ({ icon, title, description }: { icon: string; title: string; description: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-green-500">
    <div className="text-3xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-3 text-gray-800">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

// How It Works Step Component
const HowItWorksStep = ({ step, title, desc, icon }: { step: string; title: string; desc: string; icon: string }) => (
  <div className="text-center">
    <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
      <span className="text-xl">{icon}</span>
    </div>
    <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
      {step}
    </div>
    <h4 className="font-semibold mb-2">{title}</h4>
    <p className="text-sm text-gray-600">{desc}</p>
  </div>
);

function Login() {
  const { address } = useAccount();
  const navigate = useNavigate();

  const handleLogin = () => {
    if (address) {
      navigate('/dashboard');
    } else {
      alert('Please connect your wallet first!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <div className="container mx-auto px-4 py-8">

        {/* Hero Section */}
        <div className="hero-section bg-gradient-to-r from-green-600 to-green-800 text-white py-12 md:py-16 px-6 md:px-8 rounded-2xl mb-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-white/20 p-4 rounded-full mr-4">
                <span className="text-3xl md:text-4xl">🌱</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">GreenLedger</h1>
            </div>
            <p className="text-lg md:text-xl mb-6 md:mb-8 opacity-90">
              Bringing Trust to Agriculture with Blockchain Technology
            </p>
            <p className="text-base md:text-lg opacity-80 max-w-2xl mx-auto">
              Track your produce from farm to table with transparent,
              immutable records powered by Web3 technology
            </p>
          </div>
        </div>

       

        {/* Footer Section */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-600 mb-4">
            New to blockchain agriculture?
            <button className="text-green-600 hover:text-green-700 font-semibold ml-2">
              Learn More →
            </button>
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-500">
            <a href="#" className="hover:text-green-600">About</a>
            <a href="#" className="hover:text-green-600">Documentation</a>
            <a href="#" className="hover:text-green-600">Support</a>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;
