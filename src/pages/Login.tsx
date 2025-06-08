import React from 'react';
import ConnectWallet from '../components/ConnectWallet';
import { useNavigate } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';

function Login() {
  const { account } = useWeb3React();
  const navigate = useNavigate();

  const handleLogin = () => {
    if (account) {
      navigate('/dashboard');
    } else {
      alert('Please connect your wallet first!');
    }
  };

  if (account) {
    navigate('/dashboard');
  } else {
    alert('Please connect your wallet first!');
  }
      <button className="px-6 py-2 mt-6 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={handleLogin}>Login</button>
  return (
    <div className="text-center p-10 bg-gray-50 min-h-screen">
      <img src="/leaf-icon.png" alt="GreenLedger Logo" className="mx-auto mb-4 w-24" />
      <h1 className="text-3xl font-bold mb-2">Bringing Trust to Agriculture with Blockchain</h1>
      <p className="mb-6">Learn more about us.</p>
      <ConnectWallet />
      <button className="px-4 py-2 border border-gray-300 rounded ml-2 mt-4 hover:bg-gray-100" onClick={() => alert('Learn more clicked!')}>Learn More</button>
      <button className="px-6 py-2 mt-6 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={handleLogin}>Login</button>
    </div>
  );
}
export default Login;
