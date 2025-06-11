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
