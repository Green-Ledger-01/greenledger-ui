import React, { useState } from 'react';
import { QRScanner } from '../components/QRScanner';
import { QRGenerator } from '../components/QRCodeGenerator';
import { Scan, QrCode, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QRVerificationResult {
  tokenId: string;
  isValid: boolean;
  cropData?: any;
  provenance?: any[];
  error?: string;
}

export const QRVerificationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scan' | 'generate'>('scan');
  const [verificationResult, setVerificationResult] = useState<QRVerificationResult | null>(null);
  const [sampleTokenId] = useState('123'); // For demo purposes
  const navigate = useNavigate();

  const handleVerificationComplete = (result: QRVerificationResult) => {
    setVerificationResult(result);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">QR Verification</h1>
                <p className="text-sm text-gray-600">Instant blockchain verification system</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('scan')}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'scan'
                    ? 'bg-white text-green-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Scan className="w-4 h-4 mr-2" />
                Scan QR
              </button>
              <button
                onClick={() => setActiveTab('generate')}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'generate'
                    ? 'bg-white text-green-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <QrCode className="w-4 h-4 mr-2" />
                Generate QR
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Feature Highlight */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">🚀 Revolutionary QR Verification</h2>
              <p className="text-green-100">
                Instant blockchain verification in &lt;2 seconds - our key competitive advantage
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">⚡ &lt;2s</div>
              <div className="text-sm text-green-100">Verification Time</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - QR Scanner/Generator */}
          <div>
            {activeTab === 'scan' ? (
              <QRScanner onResult={handleVerificationComplete} />
            ) : (
              <QRGenerator tokenId={sampleTokenId} />
            )}
          </div>

          {/* Right Column - Information & Results */}
          <div className="space-y-6">
            {/* How It Works */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">🔍 How QR Verification Works</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <div className="font-medium">Scan QR Code</div>
                    <div className="text-sm text-gray-600">Use camera to scan product QR code</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <div className="font-medium">Blockchain Lookup</div>
                    <div className="text-sm text-gray-600">Verify token on Lisk Sepolia network</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <div className="font-medium">Instant Results</div>
                    <div className="text-sm text-gray-600">Get complete supply chain history</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Competitive Advantage */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">🏆 Competitive Advantage</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">GreenLedger</span>
                  <span className="text-green-600 font-bold">&lt;2 seconds</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>IBM Food Trust</span>
                  <span>No consumer interface</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Walmart System</span>
                  <span>Limited access</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>VeChain</span>
                  <span>Complex apps</span>
                </div>
              </div>
            </div>

            {/* Recent Verifications */}
            {verificationResult && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">📊 Latest Verification</h3>
                <div className={`p-4 rounded-lg ${
                  verificationResult.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${
                      verificationResult.isValid ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className="font-medium">
                      {verificationResult.isValid ? 'Verified' : 'Failed'}
                    </span>
                  </div>
                  {verificationResult.cropData && (
                    <div className="text-sm text-gray-700">
                      {verificationResult.cropData.cropType} from {verificationResult.cropData.location}
                    </div>
                  )}
                  {verificationResult.error && (
                    <div className="text-sm text-red-700">
                      {verificationResult.error}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to revolutionize your supply chain?
            </h3>
            <p className="text-gray-600 mb-6">
              Join thousands of farmers, transporters, and buyers using GreenLedger's blockchain verification
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate('/tokenization')}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Start Tokenizing
              </button>
              <button
                onClick={() => navigate('/marketplace')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Browse Marketplace
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRVerificationPage;