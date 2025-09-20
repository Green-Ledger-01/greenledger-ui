export interface TokenMetadata {
  id: string;
  cropType: string;
  quantity: number;
  harvestDate: string;
  location: string;
  originFarm: string;
  certifications?: string[];
}

export interface ProvenanceStep {
  stage: 'produced' | 'transit' | 'delivered' | 'consumed';
  timestamp: number;
  location: string;
  actor: string;
  txHash?: string;
}

export interface VerificationResult {
  tokenId: string;
  isValid: boolean;
  metadata?: TokenMetadata;
  provenance?: ProvenanceStep[];
  verificationTime: number;
  error?: string;
}

export interface QRPayload {
  protocol: 'greenledger';
  version: '1.0';
  tokenId: string;
  checksum: string;
}