import { useReadContract, useWriteContract } from 'wagmi';
import { CONTRACT_ADDRESSES, SUPPLY_CHAIN_STATES } from '../config/constants';
import SupplyChainManagerABI from '../contracts/SupplyChainManager.json';

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
  const { writeContractAsync, ...rest } = useWriteContract();

  const initializeProvenance = async (args: {
    tokenId: bigint;
    farmer: string;
    location: string;
    notes: string;
  }) => {
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

    console.log('Calling initializeProvenance with:', {
      address: CONTRACT_ADDRESSES.SupplyChainManager,
      tokenId: args.tokenId.toString(),
      farmer: args.farmer,
      location: args.location,
      notes: args.notes
    });

    try {
      const result = await writeContractAsync({
        address: CONTRACT_ADDRESSES.SupplyChainManager as `0x${string}`,
        abi: SupplyChainManagerABI,
        functionName: 'initializeProvenance',
        args: [args.tokenId, args.farmer, args.location, args.notes],
      });

      console.log('initializeProvenance transaction result:', result);
      return result;
    } catch (error: any) {
      console.error('initializeProvenance contract call failed:', error);
      throw error;
    }
  };

  return {
    writeAsync: initializeProvenance,
    ...rest,
  };
};

export const useTransferWithProvenance = () => {
  const { writeContractAsync, ...rest } = useWriteContract();

  const transferWithProvenance = async (args: {
    tokenId: bigint;
    to: string;
    newState: number;
    location: string;
    notes: string;
  }) => {
    return await writeContractAsync({
      address: CONTRACT_ADDRESSES.SupplyChainManager as `0x${string}`,
      abi: SupplyChainManagerABI,
      functionName: 'transferWithProvenance',
      args: [args.tokenId, args.to, args.newState, args.location, args.notes],
    });
  };

  return {
    writeAsync: transferWithProvenance,
    ...rest,
  };
};

export const useMarkAsConsumed = () => {
  const { writeContractAsync, ...rest } = useWriteContract();

  const markAsConsumed = async (args: {
    tokenId: bigint;
    location: string;
    notes: string;
  }) => {
    return await writeContractAsync({
      address: CONTRACT_ADDRESSES.SupplyChainManager as `0x${string}`,
      abi: SupplyChainManagerABI,
      functionName: 'markAsConsumed',
      args: [args.tokenId, args.location, args.notes],
    });
  };

  return {
    writeAsync: markAsConsumed,
    ...rest,
  };
};

export const useProvenanceHistory = (tokenId?: bigint) => {
  return useReadContract({
    address: CONTRACT_ADDRESSES.SupplyChainManager as `0x${string}`,
    abi: SupplyChainManagerABI,
    functionName: 'getProvenanceHistory',
    args: tokenId ? [tokenId] : undefined,
    query: {
      enabled: !!tokenId,
    },
  });
};

export const useProvenanceStep = (tokenId?: bigint, stepIndex?: bigint) => {
  return useReadContract({
    address: CONTRACT_ADDRESSES.SupplyChainManager as `0x${string}`,
    abi: SupplyChainManagerABI,
    functionName: 'getProvenanceStep',
    args: tokenId && stepIndex !== undefined ? [tokenId, stepIndex] : undefined,
    query: {
      enabled: !!tokenId && stepIndex !== undefined,
    },
  });
};

export const useTokensByState = (state?: number) => {
  return useReadContract({
    address: CONTRACT_ADDRESSES.SupplyChainManager as `0x${string}`,
    abi: SupplyChainManagerABI,
    functionName: 'getTokensByState',
    args: state !== undefined ? [state] : undefined,
    query: {
      enabled: state !== undefined,
    },
  });
};

export const useTokensInState = (state?: number, offset?: bigint, limit?: bigint) => {
  return useReadContract({
    address: CONTRACT_ADDRESSES.SupplyChainManager as `0x${string}`,
    abi: SupplyChainManagerABI,
    functionName: 'getTokensInState',
    args: state !== undefined && offset !== undefined && limit !== undefined ? [state, offset, limit] : undefined,
    query: {
      enabled: state !== undefined && offset !== undefined && limit !== undefined,
    },
  });
};

export const useUserTokenHistory = (userAddress?: string) => {
  return useReadContract({
    address: CONTRACT_ADDRESSES.SupplyChainManager as `0x${string}`,
    abi: SupplyChainManagerABI,
    functionName: 'getUserTokenHistory',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });
};

export const useHasUserInteracted = (tokenId?: bigint, userAddress?: string) => {
  return useReadContract({
    address: CONTRACT_ADDRESSES.SupplyChainManager as `0x${string}`,
    abi: SupplyChainManagerABI,
    functionName: 'hasUserInteracted',
    args: tokenId && userAddress ? [tokenId, userAddress] : undefined,
    query: {
      enabled: !!tokenId && !!userAddress,
    },
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
