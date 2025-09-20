import React, { useState } from 'react';
import { ArrowRight, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { VerificationResult } from '../types/verification';
import { TransactionResult } from '../services/supply-chain-transaction.service';
import { useQRTransactions } from '../hooks/useQRTransactions';

interface QRTransactionFlowProps {
  verificationResult: VerificationResult;
  onTransactionComplete?: (result: TransactionResult) => void;
}

export const QRTransactionFlow: React.FC<QRTransactionFlowProps> = ({
  verificationResult,
  onTransactionComplete
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionResult, setTransactionResult] = useState<TransactionResult | null>(null);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  
  const { transferOwnership, confirmReceipt, getUserAction, isProcessing: hookProcessing, isConnected } = useQRTransactions();
  const suggestedAction = getUserAction(verificationResult);

  const handleTransfer = async () => {
    if (!recipientAddress || !suggestedAction) return;

    setIsProcessing(true);
    try {
      const result = await transferOwnership(
        verificationResult,
        recipientAddress,
        location || undefined,
        notes || undefined
      );
      setTransactionResult(result);
      onTransactionComplete?.(result);
    } catch (error) {
      setTransactionResult({
        success: false,
        error: error instanceof Error ? error.message : 'Transaction failed'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReceive = async () => {
    if (!suggestedAction) return;

    setIsProcessing(true);
    try {
      const result = await confirmReceipt(
        verificationResult,
        location || undefined,
        notes || undefined
      );
      setTransactionResult(result);
      onTransactionComplete?.(result);
    } catch (error) {
      setTransactionResult({
        success: false,
        error: error instanceof Error ? error.message : 'Transaction failed'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="text-yellow-800 text-sm">
          Connect your wallet to manage supply chain transactions
        </div>
      </div>
    );
  }

  if (transactionResult) {
    return (
      <div className={`border rounded-lg p-4 ${
        transactionResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          {transactionResult.success ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <h3 className="font-semibold">
            {transactionResult.success ? 'Transaction Successful' : 'Transaction Failed'}
          </h3>
        </div>
        
        {transactionResult.success && transactionResult.txHash && (
          <div className="text-sm text-gray-600 mb-2">
            <div>Transaction Hash: <span className="font-mono text-xs">{transactionResult.txHash}</span></div>
            {transactionResult.newOwner && (
              <div>New Owner: <span className="font-mono text-xs">{transactionResult.newOwner}</span></div>
            )}
          </div>
        )}
        
        {!transactionResult.success && transactionResult.error && (
          <div className="text-sm text-red-700">
            {transactionResult.error}
          </div>
        )}
        
        <button
          onClick={() => setTransactionResult(null)}
          className="mt-3 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
        >
          New Transaction
        </button>
      </div>
    );
  }

  if (isProcessing || hookProcessing) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <div>
            <div className="font-semibold text-blue-900">Processing Transaction</div>
            <div className="text-sm text-blue-700">Updating blockchain records...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!suggestedAction) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="text-gray-600 text-sm">
          No actions available for this token
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="font-semibold mb-3">Supply Chain Action</h3>
      
      {suggestedAction.type === 'TRANSFER' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded">
            <Send className="w-4 h-4" />
            <span>You own this token and can transfer it</span>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Recipient Address</label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="0x..."
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Location (Optional)</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Current location"
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Transfer notes"
              rows={2}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
          </div>
          
          <button
            onClick={handleTransfer}
            disabled={!recipientAddress.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowRight className="w-4 h-4" />
            Transfer Ownership
          </button>
        </div>
      )}
      
      {suggestedAction.type === 'VERIFY_ONLY' && (
        <div className="space-y-4">
          <div className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
            Token verified successfully. You can view the supply chain history above.
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Your Location (Optional)</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Current location"
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          
          <button
            onClick={handleReceive}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <CheckCircle className="w-4 h-4" />
            Confirm Receipt
          </button>
        </div>
      )}
    </div>
  );
};