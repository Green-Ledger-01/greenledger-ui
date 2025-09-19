/**
 * Mobile wallet detection utilities
 * Helps identify different mobile wallet browsers and their capabilities
 */

export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    window.navigator.userAgent
  );
};

export const isMetaMaskMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  const userAgent = window.navigator.userAgent;
  return userAgent.includes('MetaMaskMobile');
};

export const isCoinbaseMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  const userAgent = window.navigator.userAgent;
  return userAgent.includes('CoinbaseWallet');
};

export const isTrustWallet = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(window as any).trustwallet;
};

export const hasInjectedWallet = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(window as any).ethereum;
};

export const getWalletType = (): string => {
  if (isMetaMaskMobile()) return 'MetaMask Mobile';
  if (isCoinbaseMobile()) return 'Coinbase Mobile';
  if (isTrustWallet()) return 'Trust Wallet';
  if (hasInjectedWallet()) return 'Injected Wallet';
  if (isMobile()) return 'Mobile Browser';
  return 'Desktop Browser';
};

export const shouldUseWalletConnect = (): boolean => {
  // Use WalletConnect if:
  // 1. On mobile but not in a wallet browser
  // 2. No injected wallet detected
  return isMobile() && !hasInjectedWallet();
};

export const getMobileConnectionStrategy = () => {
  if (isMetaMaskMobile() || isCoinbaseMobile() || isTrustWallet()) {
    return 'injected'; // Use injected connector
  }
  
  if (isMobile()) {
    return 'walletconnect'; // Use WalletConnect for mobile browsers
  }
  
  return 'auto'; // Let RainbowKit decide
};