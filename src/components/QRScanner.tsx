import React, { useState } from 'react';
import { Camera, X, CheckCircle, AlertCircle, Wifi, WifiOff, Shield } from 'lucide-react';
import { useVerification } from '../hooks/useVerification';
import { VerificationResult } from '../types/verification';
import { PWAService } from '../services/pwa.service';
import { QRTransactionFlow } from './QRTransactionFlow';
import { QROwnershipManager } from './QROwnershipManager';

interface QRScannerProps {
  onResult?: (_result: VerificationResult) => void;
  className?: string;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onResult, className = '' }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const { verify, decodeQR, isLoading } = useVerification();
  const pwaService = PWAService.getInstance();

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleScan = async (qrData: string) => {
    const payload = decodeQR(qrData);
    if (!payload) return;

    try {
      const verificationResult = await verify(payload.tokenId);
      setResult(verificationResult);
      onResult?.(verificationResult);
    } catch (_error) {
      setResult({
        tokenId: payload.tokenId,
        isValid: false,
        verificationTime: 0,
        error: 'Verification failed'
      });
    }
    setIsScanning(false);
  };

  const handleManualVerify = async () => {
    if (!manualInput.trim()) return;
    await handleScan(`greenledger://1.0/${manualInput}#00000000`);
    setManualInput('');
  };

  const reset = () => {
    setResult(null);
    setIsScanning(false);
    setManualInput('');
  };

  if (result) {
    return (
      <div className={`bg-white rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {result.isValid ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-600" />
            )}
            <h3 className="text-lg font-semibold">
              {result.isValid ? 'Verified' : 'Failed'}
            </h3>
          </div>
          <button onClick={reset} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-2 mb-3 text-sm">
          {isOnline ? (
            <><Wifi className="w-4 h-4 text-green-600" /><span className="text-green-600">Online</span></>
          ) : (
            <><WifiOff className="w-4 h-4 text-orange-600" /><span className="text-orange-600">Offline</span></>
          )}
          {result.offline && <span className="text-orange-600">(Cached data)</span>}
        </div>

        {/* Fraud Alerts */}
        {result.fraudAlerts && result.fraudAlerts.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-yellow-600" />
              <span className="font-medium text-yellow-800">Security Alerts</span>
            </div>
            {result.fraudAlerts.map((alert, index) => (
              <div key={index} className="text-sm text-yellow-700">
                {alert.type}: {alert.details}
              </div>
            ))}
          </div>
        )}

        {result.isValid && result.metadata && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium">Type:</span> {result.metadata.cropType}
              </div>
              <div>
                <span className="font-medium">Quantity:</span> {result.metadata.quantity}kg
              </div>
              <div>
                <span className="font-medium">Farm:</span> {result.metadata.originFarm}
              </div>
              <div>
                <span className="font-medium">Date:</span> {result.metadata.harvestDate}
              </div>
            </div>
            
            {result.provenance && result.provenance.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Supply Chain</h4>
                <div className="space-y-2">
                  {result.provenance.map((step, index) => (
                    <div key={index} className="text-sm border-l-2 border-blue-300 pl-3">
                      <div className="font-medium capitalize">{step.stage}</div>
                      <div className="text-gray-600">{step.location}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!result.isValid && (
          <div className="text-red-600 text-sm">
            {result.error || 'Token could not be verified'}
          </div>
        )}

        {/* Ownership History */}
        {result.isValid && (
          <div className="mt-4">
            <QROwnershipManager verificationResult={result} />
          </div>
        )}

        {/* Supply Chain Transaction Flow */}
        {result.isValid && (
          <div className="mt-4">
            <QRTransactionFlow 
              verificationResult={result}
              onTransactionComplete={(txResult) => {
                console.log('Transaction completed:', txResult);
              }}
            />
          </div>
        )}

        <div className="mt-4 text-xs text-gray-500">
          Verified in {result.verificationTime.toFixed(0)}ms
          {result.offline && ' (offline mode)'}
        </div>
      </div>
    );
  }

  if (isScanning) {
    return (
      <div className={`bg-white rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Scanning...</h3>
          <button onClick={() => setIsScanning(false)} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-gray-600 mb-4">Camera would be active here</p>
          <div className="space-y-2">
            <button
              onClick={() => handleScan('greenledger://1.0/123#12345678')}
              className="block w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Simulate: Token #123
            </button>
            <button
              onClick={() => handleScan('greenledger://1.0/456#87654321')}
              className="block w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Simulate: Token #456
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">QR Verification</h3>
      
      <div className="space-y-4">
        <button
          onClick={() => setIsScanning(true)}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          <Camera className="w-5 h-5" />
          Scan QR Code
        </button>
        
        <div className="text-center text-gray-500">or</div>
        
        <div className="space-y-2">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Enter Token ID"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button
            onClick={handleManualVerify}
            disabled={!manualInput.trim() || isLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Verify Token'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;