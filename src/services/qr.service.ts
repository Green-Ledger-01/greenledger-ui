import { QRPayload } from '../types/verification';

export class QRService {
  private static instance: QRService;

  static getInstance(): QRService {
    if (!QRService.instance) {
      QRService.instance = new QRService();
    }
    return QRService.instance;
  }

  generatePayload(tokenId: string): QRPayload {
    return {
      protocol: 'greenledger',
      version: '1.0',
      tokenId,
      checksum: this.generateChecksum(tokenId)
    };
  }

  encodePayload(payload: QRPayload): string {
    return `greenledger://1.0/${payload.tokenId}#${payload.checksum}`;
  }

  private generateChecksum(tokenId: string): string {
    let hash = 0;
    for (let i = 0; i < tokenId.length; i++) {
      const char = tokenId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }
}