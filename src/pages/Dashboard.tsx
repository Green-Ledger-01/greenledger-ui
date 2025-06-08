import React from 'react';
import ConnectWallet from '../components/ConnectWallet';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  return (
    <div className="p-5 text-center">
      <h2 className="text-2xl font-semibold mb-4">Connect Wallet</h2>
      <ConnectWallet />
      <h3 className="text-xl mt-6 mb-4">Choose your role:</h3>
      <div className="space-x-4 space-y-2">
        <button onClick={() => navigate('/tokenization')} className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700">Farmer</button>
        <button onClick={() => navigate('/transfer-ownership')} className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700">Distributor</button>
        <button onClick={() => navigate('/transfer-ownership')} className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700">Retailer</button>
        <button onClick={() => navigate('/supply-chain-explorer')} className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700">Consumer</button>
      </div>
    </div>
  );
}
export default Dashboard;
