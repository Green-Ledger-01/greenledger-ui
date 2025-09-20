import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { SupplyChainTransactionService, TransactionResult } from '../services/supply-chain-transaction.service';
import { VerificationResult } from '../types/verification';

export const useQRTransactions = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<TransactionResult | null>(null);
  const { address } = useAccount();
  
  const transactionService = SupplyChainTransactionService.getInstance();

  const transferOwnership = useCallback(async (
    verificationResult: VerificationResult,
    toAddress: string,
    location?: string,
    notes?: string
  ): Promise<TransactionResult> => {
    if (!address) throw new Error('Wallet not connected');
    
    setIsProcessing(true);
    try {
      const result = await transactionService.transferOwnership(
        verificationResult, address, toAddress, location, notes
      );
      setLastTransaction(result);
      return result;
    } finally {
      setIsProcessing(false);
    }
  }, [address, transactionService]);

  const confirmReceipt = useCallback(async (
    verificationResult: VerificationResult,
    location?: string,
    notes?: string
  ): Promise<TransactionResult> => {
    if (!address) throw new Error('Wallet not connected');
    
    setIsProcessing(true);
    try {
      const result = await transactionService.confirmReceipt(
        verificationResult, address, location, notes
      );
      setLastTransaction(result);
      return result;
    } finally {
      setIsProcessing(false);
    }
  }, [address, transactionService]);

  const getUserAction = useCallback((verificationResult: VerificationResult) => {
    if (!address) return null;
    return transactionService.determineUserAction(verificationResult, address);
  }, [address, transactionService]);

  return {
    transferOwnership,
    confirmReceipt,
    getUserAction,
    isProcessing,
    lastTransaction,
    isConnected: !!address
  };
};