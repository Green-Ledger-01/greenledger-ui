import React, { useState } from 'react';
import { useAccount, useDisconnect, useConnect } from 'wagmi';
import { useAuthCore, useConnect as useParticleConnect } from '@particle-network/authkit';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { markOAuthStart } from '../utils/authPersistence';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Wallet, 
  Shield, 
  User, 
  Mail, 
  Globe,
  RefreshCw,
  Copy,
  ExternalLink
} from 'lucide-react';

const AuthTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [isTestingParticle, setIsTestingParticle] = useState(false);
  
  // Wagmi hooks
  const { address: wagmiAddress, isConnected: wagmiConnected, connector } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { connect, connectors } = useConnect();
  
  // Particle Network hooks
  const authCore = useAuthCore();
  const { userInfo } = authCore;
  const { connect: particleConnect, disconnect: particleDisconnect, connected: particleConnected } = useParticleConnect();

  const isParticleConnected = particleConnected || !!userInfo;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const testParticleConnection = async () => {
    setIsTestingParticle(true);
    try {
      if (particleConnected || userInfo) {
        console.log('User already connected to Particle Network:', userInfo);
        setTestResults(prev => ({ ...prev, particleConnect: true }));
        return;
      }

      // Mark that we're starting an OAuth flow
      markOAuthStart();

      console.log('Attempting to connect using Particle Network connect()');
      const connectedUserInfo = await particleConnect({
        // You can specify socialType to skip the modal and go directly to a specific provider
        // socialType: 'google', // 'email' | 'google' | 'twitter' | 'facebook' | etc.
      });

      console.log('Particle Network connection successful:', connectedUserInfo);
      setTestResults(prev => ({ ...prev, particleConnect: true }));
    } catch (error) {
      console.error('Particle connection test failed:', error);
      setTestResults(prev => ({ ...prev, particleConnect: false }));
    } finally {
      setIsTestingParticle(false);
    }
  };

  const testWalletConnectConnection = async () => {
    try {
      const walletConnectConnector = connectors.find(c => c.name.toLowerCase().includes('walletconnect'));
      if (walletConnectConnector) {
        connect({ connector: walletConnectConnector });
        setTestResults(prev => ({ ...prev, walletConnect: true }));
      } else {
        setTestResults(prev => ({ ...prev, walletConnect: false }));
      }
    } catch (error) {
      console.error('WalletConnect test failed:', error);
      setTestResults(prev => ({ ...prev, walletConnect: false }));
    }
  };

  const StatusIcon = ({ status }: { status: boolean | undefined }) => {
    if (status === undefined) return <AlertCircle className="h-5 w-5 text-gray-400" />;
    return status ? 
      <CheckCircle className="h-5 w-5 text-green-600" /> : 
      <XCircle className="h-5 w-5 text-red-600" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Authentication Testing Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Test and verify WalletConnect and Particle Network authentication
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* WalletConnect Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-6">
              <Wallet className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">WalletConnect & Traditional Wallets</h2>
            </div>

            <div className="space-y-4">
              {/* Connection Status */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Connection Status</span>
                <div className="flex items-center space-x-2">
                  <StatusIcon status={wagmiConnected} />
                  <span className={wagmiConnected ? 'text-green-600' : 'text-gray-500'}>
                    {wagmiConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>

              {/* Address Display */}
              {wagmiAddress && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900">Address</span>
                    <button
                      onClick={() => copyToClipboard(wagmiAddress)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="font-mono text-sm text-blue-800 mt-1">
                    {wagmiAddress}
                  </div>
                </div>
              )}

              {/* Connector Info */}
              {connector && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-sm font-medium text-green-900">Connected via</div>
                  <div className="text-green-800">{connector.name}</div>
                </div>
              )}

              {/* Connect Button */}
              <div className="space-y-3">
                <ConnectButton />
                
                <button
                  onClick={testWalletConnectConnection}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Test WalletConnect Specifically
                </button>

                {wagmiConnected && (
                  <button
                    onClick={() => wagmiDisconnect()}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Disconnect Wallet
                  </button>
                )}
              </div>

              {/* Test Results */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Test Results</h4>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">WalletConnect Test</span>
                  <StatusIcon status={testResults.walletConnect} />
                </div>
              </div>
            </div>
          </div>

          {/* Particle Network Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-6">
              <Shield className="h-6 w-6 text-purple-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Particle Network MPC</h2>
            </div>

            <div className="space-y-4">
              {/* Connection Status */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Connection Status</span>
                <div className="flex items-center space-x-2">
                  <StatusIcon status={isParticleConnected} />
                  <span className={isParticleConnected ? 'text-green-600' : 'text-gray-500'}>
                    {isParticleConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>

              {/* User Info */}
              {userInfo && (
                <div className="space-y-3">
                  {userInfo.name && (
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-purple-600 mr-2" />
                        <span className="text-sm font-medium text-purple-900">Name</span>
                      </div>
                      <div className="text-purple-800 mt-1">{userInfo.name}</div>
                    </div>
                  )}

                  {userInfo.email && (
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-purple-600 mr-2" />
                        <span className="text-sm font-medium text-purple-900">Email</span>
                      </div>
                      <div className="text-purple-800 mt-1">{userInfo.email}</div>
                    </div>
                  )}

                  {userInfo.wallets && userInfo.wallets.length > 0 && (
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-purple-900">Wallet Address</span>
                        <button
                          onClick={() => copyToClipboard(userInfo.wallets[0].public_address)}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="font-mono text-sm text-purple-800 mt-1">
                        {userInfo.wallets[0].public_address}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Connect/Disconnect Buttons */}
              <div className="space-y-3">
                {!isParticleConnected ? (
                  <button
                    onClick={testParticleConnection}
                    disabled={isTestingParticle}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {isTestingParticle ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      'Connect with Particle Network'
                    )}
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      try {
                        await particleDisconnect();
                        setTestResults(prev => ({ ...prev, particleConnect: false }));
                      } catch (error) {
                        console.error('Particle disconnect failed:', error);
                      }
                    }}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Disconnect Particle
                  </button>
                )}
              </div>

              {/* Test Results */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Test Results</h4>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">Particle Connect Test</span>
                  <StatusIcon status={testResults.particleConnect} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Authentication Status</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {wagmiConnected || isParticleConnected ? '✅' : '❌'}
              </div>
              <div className="text-sm text-gray-600 mt-1">Any Connection</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {wagmiConnected ? '✅' : '❌'}
              </div>
              <div className="text-sm text-gray-600 mt-1">Traditional Wallet</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {isParticleConnected ? '✅' : '❌'}
              </div>
              <div className="text-sm text-gray-600 mt-1">Particle Network</div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Testing Instructions</h3>
          <div className="space-y-2 text-blue-800">
            <p>1. <strong>WalletConnect Test:</strong> Click "Connect Wallet" and select WalletConnect to test mobile wallet connections</p>
            <p>2. <strong>MetaMask Test:</strong> Click "Connect Wallet" and select MetaMask to test browser extension wallets</p>
            <p>3. <strong>Particle Network Test:</strong> Click "Connect with Particle Network" to test social login (email, Google, Twitter)</p>
            <p>4. <strong>Hybrid Test:</strong> Try connecting with both methods to ensure they work together</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthTestPage;
