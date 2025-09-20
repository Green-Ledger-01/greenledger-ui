import React, { useState } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { getWalletType, isMobile, hasInjectedWallet, getMobileConnectionStrategy } from '../utils/mobileDetection';

const WalletDebugInfo: React.FC = () => {
  const [showDebug, setShowDebug] = useState(false);
  const { isConnected, address, connector } = useAccount();
  const { connectors } = useConnect();

  // Only render in development mode
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
      >
        Debug
      </button>
      
      {showDebug && (
        <div className="absolute bottom-8 right-0 bg-black text-white p-4 rounded-lg text-xs max-w-sm">
          <h3 className="font-bold mb-2">Wallet Debug Info</h3>
          <div className="space-y-1">
            <div>Mobile: {isMobile() ? 'Yes' : 'No'}</div>
            <div>Wallet Type: {getWalletType()}</div>
            <div>Has Injected: {hasInjectedWallet() ? 'Yes' : 'No'}</div>
            <div>Strategy: {getMobileConnectionStrategy()}</div>
            <div>Connected: {isConnected ? 'Yes' : 'No'}</div>
            {isConnected && (
              <>
                <div>Connector: {connector?.name}</div>
                <div>Address: {address?.slice(0, 6)}...{address?.slice(-4)}</div>
              </>
            )}
            <div>Available Connectors:</div>
            <ul className="ml-2">
              {connectors.map((c) => (
                <li key={c.id}>• {c.name} ({c.id})</li>
              ))}
            </ul>
            <div>User Agent:</div>
            <div className="text-xs break-all">{navigator.userAgent}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletDebugInfo;