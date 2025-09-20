import { VerificationResult, QRPayload, TokenMetadata, ProvenanceStep } from '../types/verification';

export class VerificationService {
  private static instance: VerificationService;

  static getInstance(): VerificationService {
    if (!VerificationService.instance) {
      VerificationService.instance = new VerificationService();
    }
    return VerificationService.instance;
  }

  async verify(tokenId: string): Promise<VerificationResult> {
    const startTime = performance.now();
    
    try {
      const [metadata, provenance] = await Promise.all([
        this.fetchMetadata(tokenId),
        this.fetchProvenance(tokenId)
      ]);

      return {
        tokenId,
        isValid: true,
        metadata,
        provenance,
        verificationTime: performance.now() - startTime
      };
    } catch (error) {
      return {
        tokenId,
        isValid: false,
        verificationTime: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Verification failed'
      };
    }
  }

  decodeQR(qrData: string): QRPayload | null {
    try {
      const parsed = JSON.parse(qrData);
      if (this.validatePayload(parsed)) return parsed;
    } catch {
      const match = qrData.match(/greenledger:\/\/1\.0\/(\d+)#([a-f0-9]+)/);
      if (match) {
        const [, tokenId, checksum] = match;
        return { protocol: 'greenledger', version: '1.0', tokenId, checksum };
      }
    }
    return null;
  }

  private validatePayload(payload: any): boolean {
    return payload.protocol === 'greenledger' && 
           payload.version === '1.0' && 
           payload.tokenId && 
           payload.checksum;
  }

  private async fetchMetadata(tokenId: string): Promise<TokenMetadata> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      id: tokenId,
      cropType: 'Organic Tomatoes',
      quantity: 100,
      harvestDate: '2024-01-15',
      location: 'Farm Valley, CA',
      originFarm: 'Green Valley Farm',
      certifications: ['Organic', 'Non-GMO']
    };
  }

  private async fetchProvenance(tokenId: string): Promise<ProvenanceStep[]> {
    await new Promise(resolve => setTimeout(resolve, 150));
    return [
      {
        stage: 'produced',
        timestamp: Date.now() - 172800000,
        location: 'Green Valley Farm, CA',
        actor: '0x1234...5678'
      },
      {
        stage: 'transit',
        timestamp: Date.now() - 86400000,
        location: 'Distribution Center, CA',
        actor: '0x2345...6789'
      }
    ];
  }
}