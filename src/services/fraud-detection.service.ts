interface ScanEvent {
  tokenId: string;
  timestamp: number;
  location?: string;
  userAgent: string;
  ipHash?: string;
}

interface FraudAlert {
  type: 'RAPID_SCANNING' | 'INVALID_TOKEN' | 'SUSPICIOUS_PATTERN' | 'DUPLICATE_SCAN';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  tokenId: string;
  details: string;
  timestamp: number;
}

export class FraudDetectionService {
  private static instance: FraudDetectionService;
  private scanHistory: ScanEvent[] = [];
  private readonly MAX_SCANS_PER_MINUTE = 10;
  private readonly RAPID_SCAN_THRESHOLD = 5000; // 5 seconds

  static getInstance(): FraudDetectionService {
    if (!FraudDetectionService.instance) {
      FraudDetectionService.instance = new FraudDetectionService();
    }
    return FraudDetectionService.instance;
  }

  recordScan(tokenId: string, location?: string): FraudAlert[] {
    const scanEvent: ScanEvent = {
      tokenId,
      timestamp: Date.now(),
      location,
      userAgent: navigator.userAgent
    };

    this.scanHistory.push(scanEvent);
    this.cleanOldScans();

    return this.detectFraud(scanEvent);
  }

  private detectFraud(currentScan: ScanEvent): FraudAlert[] {
    const alerts: FraudAlert[] = [];
    const recentScans = this.getRecentScans(60000); // Last minute

    // Detect rapid scanning
    const rapidScans = this.detectRapidScanning(currentScan);
    if (rapidScans) alerts.push(rapidScans);

    // Detect excessive scanning
    const excessiveScanning = this.detectExcessiveScanning(recentScans);
    if (excessiveScanning) alerts.push(excessiveScanning);

    // Detect duplicate token scanning
    const duplicateScanning = this.detectDuplicateScanning(currentScan, recentScans);
    if (duplicateScanning) alerts.push(duplicateScanning);

    return alerts;
  }

  private detectRapidScanning(currentScan: ScanEvent): FraudAlert | null {
    const recentScans = this.scanHistory
      .filter(scan => 
        scan.timestamp > currentScan.timestamp - this.RAPID_SCAN_THRESHOLD &&
        scan.userAgent === currentScan.userAgent
      );

    if (recentScans.length >= 3) {
      return {
        type: 'RAPID_SCANNING',
        severity: 'MEDIUM',
        tokenId: currentScan.tokenId,
        details: `${recentScans.length} scans in ${this.RAPID_SCAN_THRESHOLD/1000} seconds`,
        timestamp: Date.now()
      };
    }

    return null;
  }

  private detectExcessiveScanning(recentScans: ScanEvent[]): FraudAlert | null {
    if (recentScans.length > this.MAX_SCANS_PER_MINUTE) {
      return {
        type: 'SUSPICIOUS_PATTERN',
        severity: 'HIGH',
        tokenId: recentScans[0].tokenId,
        details: `${recentScans.length} scans in 1 minute (limit: ${this.MAX_SCANS_PER_MINUTE})`,
        timestamp: Date.now()
      };
    }

    return null;
  }

  private detectDuplicateScanning(currentScan: ScanEvent, recentScans: ScanEvent[]): FraudAlert | null {
    const duplicates = recentScans.filter(scan => 
      scan.tokenId === currentScan.tokenId &&
      scan.userAgent === currentScan.userAgent
    );

    if (duplicates.length >= 3) {
      return {
        type: 'DUPLICATE_SCAN',
        severity: 'LOW',
        tokenId: currentScan.tokenId,
        details: `Same token scanned ${duplicates.length} times`,
        timestamp: Date.now()
      };
    }

    return null;
  }

  private getRecentScans(timeWindow: number): ScanEvent[] {
    const cutoff = Date.now() - timeWindow;
    return this.scanHistory.filter(scan => scan.timestamp > cutoff);
  }

  private cleanOldScans(): void {
    const cutoff = Date.now() - 3600000; // Keep 1 hour of history
    this.scanHistory = this.scanHistory.filter(scan => scan.timestamp > cutoff);
  }

  getAlertMessage(alert: FraudAlert): string {
    const severityEmoji = {
      LOW: '⚠️',
      MEDIUM: '🚨',
      HIGH: '🔴',
      CRITICAL: '💀'
    };

    return `${severityEmoji[alert.severity]} ${alert.type}: ${alert.details}`;
  }
}