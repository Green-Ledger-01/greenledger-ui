export class PWAService {
  private static instance: PWAService;
  private deferredPrompt: any = null;

  static getInstance(): PWAService {
    if (!PWAService.instance) {
      PWAService.instance = new PWAService();
    }
    return PWAService.instance;
  }

  init(): void {
    this.registerServiceWorker();
    this.setupInstallPrompt();
  }

  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('SW registered:', registration);
      } catch (error) {
        console.log('SW registration failed:', error);
      }
    }
  }

  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
    });
  }

  async installApp(): Promise<boolean> {
    if (!this.deferredPrompt) return false;

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
    
    return outcome === 'accepted';
  }

  canInstall(): boolean {
    return !!this.deferredPrompt;
  }

  isStandalone(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  async cacheVerification(tokenId: string, result: any): Promise<void> {
    if ('caches' in window) {
      const cache = await caches.open('verification-cache-v1');
      const response = new Response(JSON.stringify(result));
      await cache.put(`/verify/${tokenId}`, response);
    }
  }

  async getCachedVerification(tokenId: string): Promise<any | null> {
    if ('caches' in window) {
      const cache = await caches.open('verification-cache-v1');
      const response = await cache.match(`/verify/${tokenId}`);
      if (response) {
        return await response.json();
      }
    }
    return null;
  }

  isOnline(): boolean {
    return navigator.onLine;
  }
}