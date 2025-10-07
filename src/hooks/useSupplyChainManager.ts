import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { SUPPLY_CHAIN_STATES } from '../config/constants';
import { useContractAddresses } from './useContractAddresses';
import { useCurrentChain } from './useCurrentChain';
import SupplyChainManagerABI from '../contracts/SupplyChainManager.json';
import { secureLog, secureError } from '../utils/secureLogger';

export interface ProvenanceRecord {
  tokenId: bigint;
  originalFarmer: string;
  creationTime: bigint;
  currentState: number;
  currentOwner: string;
  totalSteps: bigint;
}

export interface ProvenanceStep {
  actor: string;
  state: number;
  timestamp: bigint;
  location: string;
  notes: string;
  transactionHash: string;
}

export const useInitializeProvenance = () => {
  const { writeContract, ...rest } = useWriteContract();
  const { address } = useAccount();
  const { addresses: CONTRACT_ADDRESSES, hasSupplyChain } = useContractAddresses();
  const currentChain = useCurrentChain();

  const initializeProvenance = (args: {
    tokenId: bigint;
    farmer: string;
    location: string;
    notes: string;
  }) => {
    // Check if SupplyChain contract is available
    if (!hasSupplyChain) {
      throw new Error('SupplyChain contract not available on this network');
    }

    // Validate inputs before calling contract
    if (!args.tokenId || args.tokenId <= 0n) {
      throw new Error('Invalid token ID provided');
    }

    if (!args.farmer || args.farmer === '0x0000000000000000000000000000000000000000') {
      throw new Error('Invalid farmer address provided');
    }

    if (!args.location || args.location.trim() === '') {
      throw new Error('Location is required');
    }

    if (!args.notes || args.notes.trim() === '') {
      throw new Error('Notes are required');
    }

    secureLog('Calling initializeProvenance with tokenId:', args.tokenId.toString(), 'farmer:', args.farmer, 'location:', args.location, 'notes:', args.notes);

    return writeContract({
      address: CONTRACT_ADDRESSES.SupplyChainManager as `0x${string}`,
      abi: SupplyChainManagerABI,
      functionName: 'initializeProvenance',
      args: [args.tokenId, args.farmer, args.location, args.notes],
      chain: currentChain,
      account: address,
    });
  };

  return {
    writeContract: initializeProvenance,
    ...rest,
  };
};

export const useTransferWithProvenance = () => {
  const { writeContract, ...rest } = useWriteContract();
  const { address } = useAccount();
  const { addresses: CONTRACT_ADDRESSES, hasSupplyChain } = useContractAddresses();
  const currentChain = useCurrentChain();

  const transferWithProvenance = (args: {
    tokenId: bigint;
    to: string;
    newState: number;
    location: string;
    notes: string;
  }) => {
    if (!hasSupplyChain) {
      throw new Error('SupplyChain contract not available on this network');
    }
    
    return writeContract({
      address: CONTRACT_ADDRESSES.SupplyChainManager as `0x${string}`,
      abi: SupplyChainManagerABI,
      functionName: 'transferWithProvenance',
      args: [args.tokenId, args.to, args.newState, args.location, args.notes],
      chain: currentChain,
      account: address,
    });
  };

  return {
    writeContract: transferWithProvenance,
    ...rest,
  };
};

export const useMarkAsConsumed = () => {
  const { writeContract, ...rest } = useWriteContract();
  const { address } = useAccount();
  const { addresses: CONTRACT_ADDRESSES, hasSupplyChain } = useContractAddresses();
  const currentChain = useCurrentChain();

  const markAsConsumed = (args: {
    tokenId: bigint;
    location: string;
    notes: string;
  }) => {
    if (!hasSupplyChain) {
      throw new Error('SupplyChain contract not available on this network');
    }
    
    return writeContract({
      address: CONTRACT_ADDRESSES.SupplyChainManager as `0x${string}`,
      abi: SupplyChainManagerABI,
      functionName: 'markAsConsumed',
      args: [args.tokenId, args.location, args.notes],
      chain: currentChain,
      account: address,
    });
  };

  return {
    writeContract: markAsConsumed,
    ...rest,
  };
};

export const useProvenanceHistory = (tokenId?: bigint) => {
  const { addresses: CONTRACT_ADDRESSES, isSupported, hasSupplyChain } = useContractAddresses();
  return useReadContract({
    address: CONTRACT_ADDRESSES.SupplyChainManager as `0x${string}`,
    query: {
      enabled: !!tokenId && isSupported && hasSupplyChain,
    },
    abi: SupplyChainManagerABI,
    functionName: 'getProvenanceHistory',
    args: tokenId ? [tokenId] : undefined,

  });
};

export const useProvenanceStep = (tokenId?: bigint, stepIndex?: bigint) => {
  const { addresses: CONTRACT_ADDRESSES, isSupported, hasSupplyChain } = useContractAddresses();
  return useReadContract({
    address: CONTRACT_ADDRESSES.SupplyChainManager as `0x${string}`,
    query: {
      enabled: !!tokenId && stepIndex !== undefined && isSupported && hasSupplyChain,
    },
    abi: SupplyChainManagerABI,
    functionName: 'getProvenanceStep',
    args: tokenId && stepIndex !== undefined ? [tokenId, stepIndex] : undefined,

  });
};

export const useTokensByState = (state?: number) => {
  const { addresses: CONTRACT_ADDRESSES, isSupported, hasSupplyChain } = useContractAddresses();
  return useReadContract({
    address: CONTRACT_ADDRESSES.SupplyChainManager as `0x${string}`,
    query: {
      enabled: state !== undefined && isSupported && hasSupplyChain,
    },
    abi: SupplyChainManagerABI,
    functionName: 'getTokensByState',
    args: state !== undefined ? [state] : undefined,

  });
};

export const useTokensInState = (state?: number, offset?: bigint, limit?: bigint) => {
  const { addresses: CONTRACT_ADDRESSES, isSupported, hasSupplyChain } = useContractAddresses();
  return useReadContract({
    address: CONTRACT_ADDRESSES.SupplyChainManager as `0x${string}`,
    query: {
      enabled: state !== undefined && offset !== undefined && limit !== undefined && isSupported && hasSupplyChain,
    },
    abi: SupplyChainManagerABI,
    functionName: 'getTokensInState',
    args: state !== undefined && offset !== undefined && limit !== undefined ? [state, offset, limit] : undefined,

  });
};

export const useUserTokenHistory = (userAddress?: string) => {
  const { addresses: CONTRACT_ADDRESSES, isSupported, hasSupplyChain } = useContractAddresses();
  return useReadContract({
    address: CONTRACT_ADDRESSES.SupplyChainManager as `0x${string}`,
    query: {
      enabled: !!userAddress && isSupported && hasSupplyChain,
    },
    abi: SupplyChainManagerABI,
    functionName: 'getUserTokenHistory',
    args: userAddress ? [userAddress] : undefined,

  });
};

export const useHasUserInteracted = (tokenId?: bigint, userAddress?: string) => {
  const { addresses: CONTRACT_ADDRESSES, isSupported, hasSupplyChain } = useContractAddresses();
  return useReadContract({
    address: CONTRACT_ADDRESSES.SupplyChainManager as `0x${string}`,
    query: {
      enabled: !!tokenId && !!userAddress && isSupported && hasSupplyChain,
    },
    abi: SupplyChainManagerABI,
    functionName: 'hasUserInteracted',
    args: tokenId && userAddress ? [tokenId, userAddress] : undefined,

  });
};

// Helper function to get state label
export const getStateLabel = (state: number): string => {
  switch (state) {
    case SUPPLY_CHAIN_STATES.PRODUCED:
      return 'Produced';
    case SUPPLY_CHAIN_STATES.IN_TRANSIT:
      return 'In Transit';
    case SUPPLY_CHAIN_STATES.DELIVERED:
      return 'Delivered';
    case SUPPLY_CHAIN_STATES.CONSUMED:
      return 'Consumed';
    default:
      return 'Unknown';
  }
};

// Helper function to get state color
export const getStateColor = (state: number): string => {
  switch (state) {
    case SUPPLY_CHAIN_STATES.PRODUCED:
      return '#52c41a'; // green
    case SUPPLY_CHAIN_STATES.IN_TRANSIT:
      return '#1890ff'; // blue
    case SUPPLY_CHAIN_STATES.DELIVERED:
      return '#722ed1'; // purple
    case SUPPLY_CHAIN_STATES.CONSUMED:
      return '#8c8c8c'; // gray
    default:
      return '#d9d9d9'; // light gray
  }
};

// Helper function to format timestamp
export const formatTimestamp = (timestamp: bigint): string => {
  return new Date(Number(timestamp) * 1000).toLocaleString();
};

// Helper function to format address
export const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
