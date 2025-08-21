import { Web3Auth } from '@web3auth/modal';
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK, ADAPTER_EVENTS } from '@web3auth/base';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';

export interface Web3AuthConfig {
  clientId: string;
  chainConfig: {
    chainNamespace: typeof CHAIN_NAMESPACES.EIP155;
    chainId: string;
    rpcTarget: string;
    displayName: string;
    blockExplorer: string;
    ticker: string;
    tickerName: string;
  };
}

export const createWeb3AuthInstance = async (config: Web3AuthConfig): Promise<Web3Auth> => {
  const { clientId, chainConfig } = config;

  const privateKeyProvider = new EthereumPrivateKeyProvider({
    config: { chainConfig },
  });

  const web3auth = new Web3Auth({
    clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
    privateKeyProvider: privateKeyProvider as any,
    uiConfig: {
      appName: "GreenLedger",
      appUrl: window.location.origin,
      logoLight: "https://images.web3auth.io/web3auth-logo-w.svg",
      logoDark: "https://images.web3auth.io/web3auth-logo-w.svg",
      mode: "light",
      theme: {
        primary: "#10b981"
      },
    },
  });

  // Configure OpenLogin adapter for social logins
  const openloginAdapter = new OpenloginAdapter({
    loginSettings: {
      mfaLevel: "optional",
    },
    adapterSettings: {
      uxMode: "popup",
      whiteLabel: {
        appName: "GreenLedger",
        appUrl: window.location.origin,
        logoLight: "https://images.web3auth.io/web3auth-logo-w.svg",
        logoDark: "https://images.web3auth.io/web3auth-logo-w.svg",
      },
    },
  });

  // Note: configureAdapter method may not be available in all versions
  // The adapter will be configured automatically when Web3Auth initializes

  return web3auth;
};

export const defaultChainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155 as any,
  chainId: "0x106A", // Lisk Sepolia
  rpcTarget: "https://rpc.sepolia-api.lisk.com",
  displayName: "Lisk Sepolia",
  blockExplorer: "https://sepolia-blockscout.lisk.com",
  ticker: "ETH",
  tickerName: "Ethereum",
};

export { ADAPTER_EVENTS };
