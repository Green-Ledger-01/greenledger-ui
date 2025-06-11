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

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
          <FeatureCard
            icon="🔗"
            title="Blockchain Traceability"
            description="Every step of your produce journey is recorded immutably on the blockchain"
          />
          <FeatureCard
            icon="👥"
            title="Multi-Role Platform"
            description="Farmers, Distributors, Retailers, and Consumers all connected in one ecosystem"
          />
          <FeatureCard
            icon="🛡️"
            title="Trust & Transparency"
            description="Build consumer confidence with verifiable supply chain data"
          />
        </div>

        {/* How It Works Section */}
        <div className="bg-gray-50 p-6 md:p-8 rounded-2xl mb-8">
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-800">How GreenLedger Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <HowItWorksStep
              step="1"
              title="Register"
              desc="Connect wallet & choose your role"
              icon="👤"
            />
            <HowItWorksStep
              step="2"
              title="Tokenize"
              desc="Create NFTs for your produce batches"
              icon="🏷️"
            />
            <HowItWorksStep
              step="3"
              title="Transfer"
              desc="Pass ownership through supply chain"
              icon="🔄"
            />
            <HowItWorksStep
              step="4"
              title="Track"
              desc="Full transparency from farm to table"
              icon="📍"
            />
          </div>
        </div>

        {/* Enhanced Wallet Connection Section */}
        <div className="max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100 mb-8">
          <div className="text-center mb-6">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔐</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Connect Your Wallet</h3>
            <p className="text-gray-600">
              Secure access to the GreenLedger ecosystem
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-center">
              <ConnectButton />
            </div>

            {/* Supported Wallets Info */}
            <div className="flex justify-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                MetaMask
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                WalletConnect
              </span>
            </div>

            {/* Enhanced CTA */}
            <div className="mt-6">
              {address ? (
                <button
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg"
                  onClick={handleLogin}
                >
                  🚀 Enter GreenLedger Dashboard
                </button>
              ) : (
                <div className="w-full px-6 py-4 bg-gray-100 text-gray-500 rounded-xl text-center font-semibold">
                  Connect wallet to continue
                </div>
              )}
            </div>
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
