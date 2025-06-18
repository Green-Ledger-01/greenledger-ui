import { useContract, usePublicClient, useWalletClient } from 'wagmi';
import { getContract } from 'viem';
import { CONTRACT_CONFIG } from '../config/contracts';

// Import ABIs
import UserManagementABI from '../contracts/UserManagement.json';
import CropBatchTokenABI from '../contracts/CropBatchToken.json';
import GreenLedgerAccessABI from '../contracts/GreenLedgerAccess.json';
import GreenLedgerPaymasterABI from '../contracts/GreenLedgerPaymaster.json';

/**
 * Hook to get contract instances with proper typing and error handling
 */
export const useContracts = () => {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // UserManagement Contract
  const userManagementContract = useContract({
    address: CONTRACT_CONFIG.addresses.UserManagement as `0x${string}`,
    abi: UserManagementABI,
    client: { public: publicClient, wallet: walletClient },
  });

  // CropBatchToken Contract
  const cropBatchTokenContract = useContract({
    address: CONTRACT_CONFIG.addresses.CropBatchToken as `0x${string}`,
    abi: CropBatchTokenABI,
    client: { public: publicClient, wallet: walletClient },
  });

  // GreenLedgerAccess Contract
  const greenLedgerAccessContract = useContract({
    address: CONTRACT_CONFIG.addresses.GreenLedgerAccess as `0x${string}`,
    abi: GreenLedgerAccessABI,
    client: { public: publicClient, wallet: walletClient },
  });

  // GreenLedgerPaymaster Contract
  const greenLedgerPaymasterContract = useContract({
    address: CONTRACT_CONFIG.addresses.GreenLedgerPaymaster as `0x${string}`,
    abi: GreenLedgerPaymasterABI,
    client: { public: publicClient, wallet: walletClient },
  });

  return {
    userManagement: userManagementContract,
    cropBatchToken: cropBatchTokenContract,
    greenLedgerAccess: greenLedgerAccessContract,
    greenLedgerPaymaster: greenLedgerPaymasterContract,
    publicClient,
    walletClient,
  };
};

/**
 * Hook to get read-only contract instances for queries
 */
export const useReadContracts = () => {
  const publicClient = usePublicClient();

  if (!publicClient) {
    throw new Error('Public client not available');
  }

  const userManagement = getContract({
    address: CONTRACT_CONFIG.addresses.UserManagement as `0x${string}`,
    abi: UserManagementABI,
    client: publicClient,
  });

  const cropBatchToken = getContract({
    address: CONTRACT_CONFIG.addresses.CropBatchToken as `0x${string}`,
    abi: CropBatchTokenABI,
    client: publicClient,
  });

  const greenLedgerAccess = getContract({
    address: CONTRACT_CONFIG.addresses.GreenLedgerAccess as `0x${string}`,
    abi: GreenLedgerAccessABI,
    client: publicClient,
  });

  const greenLedgerPaymaster = getContract({
    address: CONTRACT_CONFIG.addresses.GreenLedgerPaymaster as `0x${string}`,
    abi: GreenLedgerPaymasterABI,
    client: publicClient,
  });

  return {
    userManagement,
    cropBatchToken,
    greenLedgerAccess,
    greenLedgerPaymaster,
  };
};

/**
 * Contract addresses for easy access
 */
export const CONTRACT_ADDRESSES = CONTRACT_CONFIG.addresses;

/**
 * Contract ABIs for external use
 */
export const CONTRACT_ABIS = {
  UserManagement: UserManagementABI,
  CropBatchToken: CropBatchTokenABI,
  GreenLedgerAccess: GreenLedgerAccessABI,
  GreenLedgerPaymaster: GreenLedgerPaymasterABI,
};