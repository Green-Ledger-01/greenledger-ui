import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { PWAService } from '../services/pwa.service';

export const InstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const pwaService = PWAService.getInstance();

  useEffect(() => {
    const checkInstallability = () => {
      if (pwaService.canInstall() && !pwaService.isStandalone()) {
        setShowPrompt(true);
      }
    };

    checkInstallability();
    window.addEventListener('beforeinstallprompt', checkInstallability);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', checkInstallability);
    };
  }, [pwaService]);

  const handleInstall = async () => {
    setIsInstalling(true);
    const installed = await pwaService.installApp();
    if (installed) {
      setShowPrompt(false);
    }
    setIsInstalling(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 max-w-sm mx-auto">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">
            Install GreenLedger
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Get instant access to QR verification without opening a browser
          </p>
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            {isInstalling ? 'Installing...' : 'Install App'}
          </button>
        </div>
        <button
          onClick={() => setShowPrompt(false)}
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};