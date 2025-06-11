import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

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
    <div className="text-center p-10 mt-10">
      <h1 className="text-4xl font-bold mb-8 text-green-800">
        🌿 GreenLedger DApp
      </h1>
      <h2 className="text-2xl font-semibold mb-6">Bringing Trust to Agriculture with Blockchain</h2>
      
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
        <p className="mb-6 text-gray-600">Connect your wallet to access the platform</p>
        
        <div className="flex justify-center mb-6">
          <ConnectButton />
        </div>
        
        <button 
          className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          onClick={handleLogin}
        >
          Enter Dashboard
        </button>
        
        <p className="mt-6 text-sm text-gray-500">
          New to blockchain? <a href="#" className="text-green-600 hover:underline">Learn how it works</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
