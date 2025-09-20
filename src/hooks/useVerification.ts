import { useState, useCallback } from 'react';
import { VerificationService } from '../services/verification.service';
import { VerificationResult } from '../types/verification';

export const useVerification = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const verificationService = VerificationService.getInstance();

  const verify = useCallback(async (tokenId: string): Promise<VerificationResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await verificationService.verify(tokenId);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [verificationService]);

  const decodeQR = useCallback((qrData: string) => {
    return verificationService.decodeQR(qrData);
  }, [verificationService]);

  return {
    verify,
    decodeQR,
    isLoading,
    error
  };
};