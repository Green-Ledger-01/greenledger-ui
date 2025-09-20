import { VerificationResult } from '../types/verification';

export interface TransactionAction {
  type: 'TRANSFER' | 'RECEIVE' | 'VERIFY_ONLY';
  tokenId: string;
  fromAddress: string;
  toAddress: string;
  location?: string;
  notes?: string;
}

export interface TransactionResult {
  success: boolean;
  txHash?: string;
  error?: string;
  newOwner?: string;
}

export class SupplyChainTransactionService {
  private static instance: SupplyChainTransactionService;

  static getInstance(): SupplyChainTransactionService {
    if (!SupplyChainTransactionService.instance) {
      SupplyChainTransactionService.instance = new SupplyChainTransactionService();
    }
    return SupplyChainTransactionService.instance;
  }

  async processQRTransaction(
    verificationResult: VerificationResult,
    userAddress: string,
    action: TransactionAction
  ): Promise<TransactionResult> {
    if (!verificationResult.isValid || !verificationResult.metadata) {
      return { success: false, error: 'Invalid token' };
    }

    try {
      switch (action.type) {
        case 'TRANSFER':
          return await this.executeTransfer(action, userAddress);
        case 'RECEIVE':
          return await this.confirmReceival(action, userAddress);
        case 'VERIFY_ONLY':
          return { success: true };
        default:
          return { success: false, error: 'Unknown action type' };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transaction failed'
      };
    }
  }

  private async executeTransfer(action: TransactionAction, userAddress: string): Promise<TransactionResult> {
    // Mock implementation - replace with actual smart contract call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: true,
      txHash: '0x' + Math.random().toString(16).substr(2, 64),
      newOwner: action.toAddress
    };
  }

  private async confirmReceival(action: TransactionAction, userAddress: string): Promise<TransactionResult> {
    // Mock implementation - replace with actual smart contract call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      txHash: '0x' + Math.random().toString(16).substr(2, 64),
      newOwner: userAddress
    };
  }

  async transferOwnership(
    verificationResult: VerificationResult,
    userAddress: string,
    toAddress: string,
    location?: string,
    notes?: string
  ): Promise<TransactionResult> {
    const action: TransactionAction = {
      type: 'TRANSFER',
      tokenId: verificationResult.tokenId,
      fromAddress: userAddress,
      toAddress,
      location,
      notes
    };
    return this.processQRTransaction(verificationResult, userAddress, action);
  }

  async confirmReceipt(
    verificationResult: VerificationResult,
    userAddress: string,
    location?: string,
    notes?: string
  ): Promise<TransactionResult> {
    const action: TransactionAction = {
      type: 'RECEIVE',
      tokenId: verificationResult.tokenId,
      fromAddress: '',
      toAddress: userAddress,
      location,
      notes
    };
    return this.processQRTransaction(verificationResult, userAddress, action);
  }

  determineUserAction(verificationResult: VerificationResult, userAddress: string): TransactionAction | null {
    if (!verificationResult.metadata || !userAddress) return null;

    const currentOwner = verificationResult.metadata.id;
    
    if (currentOwner.toLowerCase() === userAddress.toLowerCase()) {
      return {
        type: 'TRANSFER',
        tokenId: verificationResult.tokenId,
        fromAddress: userAddress,
        toAddress: '',
      };
    }

    return {
      type: 'VERIFY_ONLY',
      tokenId: verificationResult.tokenId,
      fromAddress: currentOwner,
      toAddress: userAddress,
    };
  }
}