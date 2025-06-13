import { ethers } from 'ethers';
import { getContract, getPublicClient, getWalletClient } from '@wagmi/core';
import { config } from '../config/wagmiConfig';

// Contract ABIs
import GreenLedgerAccessABI from '../contracts/GreenLedgerAccess.json';
import CropBatchTokenABI from '../contracts/CropBatchToken.json';
import GreenLedgerPaymasterABI from '../contracts/GreenLedgerPaymaster.json';

// Import contract addresses from config
import { getContractAddress } from '../config/contracts';

// User roles enum to match smart contract
export enum UserRole {
  FARMER = 0,
  TRANSPORTER = 1,
  BUYER = 2,
}

// Role constants (bytes32 hashes)
export const ROLE_HASHES = {
  DEFAULT_ADMIN_ROLE: '0x0000000000000000000000000000000000000000000000000000000000000000',
  FARMER_ROLE: ethers.keccak256(ethers.toUtf8Bytes('FARMER_ROLE')),
  TRANSPORTER_ROLE: ethers.keccak256(ethers.toUtf8Bytes('TRANSPORTER_ROLE')),
  BUYER_ROLE: ethers.keccak256(ethers.toUtf8Bytes('BUYER_ROLE')),
};

// Get contract instances
export const getGreenLedgerAccessContract = async (withSigner = false) => {
  const client = withSigner ? await getWalletClient(config) : getPublicClient(config);

  return getContract({
    address: getContractAddress('GreenLedgerAccess') as `0x${string}`,
    abi: GreenLedgerAccessABI,
    client,
  });
};

export const getCropBatchTokenContract = async (withSigner = false) => {
  const client = withSigner ? await getWalletClient(config) : getPublicClient(config);

  return getContract({
    address: getContractAddress('CropBatchToken') as `0x${string}`,
    abi: CropBatchTokenABI,
    client,
  });
};

export const getGreenLedgerPaymasterContract = async (withSigner = false) => {
  const client = withSigner ? await getWalletClient(config) : getPublicClient(config);

  return getContract({
    address: getContractAddress('GreenLedgerPaymaster') as `0x${string}`,
    abi: GreenLedgerPaymasterABI,
    client,
  });
};

// Utility functions for contract interactions
export const contractUtils = {
  // Access Control Functions
  async registerUser(userAddress: string, role: UserRole) {
    try {
      const contract = await getGreenLedgerAccessContract(true);
      const tx = await contract.write.registerUser([userAddress, role]);
      return tx;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  },

  async getUserRoles(userAddress: string) {
    try {
      const contract = await getGreenLedgerAccessContract();
      const roles = await contract.read.getUserRolesStatus([userAddress]);
      return {
        isFarmer: roles[0],
        isTransporter: roles[1],
        isBuyer: roles[2],
      };
    } catch (error) {
      console.error('Error getting user roles:', error);
      throw error;
    }
  },

  async hasRole(role: string, userAddress: string) {
    try {
      const contract = await getGreenLedgerAccessContract();
      return await contract.read.hasRole([role, userAddress]);
    } catch (error) {
      console.error('Error checking role:', error);
      throw error;
    }
  },

  // Crop Batch Token Functions
  async mintNewBatch(
    to: string,
    cropType: string,
    quantity: number,
    originFarm: string,
    harvestDate: number,
    notes: string,
    metadataUri: string
  ) {
    try {
      const contract = await getCropBatchTokenContract(true);
      const tx = await contract.write.mintNewBatch([
        to,
        cropType,
        BigInt(quantity),
        originFarm,
        BigInt(harvestDate),
        notes,
        metadataUri,
      ]);
      return tx;
    } catch (error) {
      console.error('Error minting batch:', error);
      throw error;
    }
  },

  async getBatchDetails(tokenId: number) {
    try {
      const contract = await getCropBatchTokenContract();
      const details = await contract.read.batchDetails([BigInt(tokenId)]);
      return {
        cropType: details[0],
        quantity: Number(details[1]),
        originFarm: details[2],
        harvestDate: Number(details[3]),
        notes: details[4],
        metadataUri: details[5],
      };
    } catch (error) {
      console.error('Error getting batch details:', error);
      throw error;
    }
  },

  async getTokenBalance(userAddress: string, tokenId: number) {
    try {
      const contract = await getCropBatchTokenContract();
      const balance = await contract.read.balanceOf([userAddress, BigInt(tokenId)]);
      return Number(balance);
    } catch (error) {
      console.error('Error getting token balance:', error);
      throw error;
    }
  },

  async transferToken(
    from: string,
    to: string,
    tokenId: number,
    amount: number,
    data: string = '0x'
  ) {
    try {
      const contract = await getCropBatchTokenContract(true);
      const tx = await contract.write.safeTransferFrom([
        from,
        to,
        BigInt(tokenId),
        BigInt(amount),
        data,
      ]);
      return tx;
    } catch (error) {
      console.error('Error transferring token:', error);
      throw error;
    }
  },

  async getNextTokenId() {
    try {
      const contract = await getCropBatchTokenContract();
      const nextId = await contract.read.nextTokenId();
      return Number(nextId);
    } catch (error) {
      console.error('Error getting next token ID:', error);
      throw error;
    }
  },

  async setApprovalForAll(operator: string, approved: boolean) {
    try {
      const contract = await getCropBatchTokenContract(true);
      const tx = await contract.write.setApprovalForAll([operator, approved]);
      return tx;
    } catch (error) {
      console.error('Error setting approval:', error);
      throw error;
    }
  },

  async isApprovedForAll(owner: string, operator: string) {
    try {
      const contract = await getCropBatchTokenContract();
      return await contract.read.isApprovedForAll([owner, operator]);
    } catch (error) {
      console.error('Error checking approval:', error);
      throw error;
    }
  },
};

// Event listeners for contract events
export const setupEventListeners = () => {
  // This would be implemented with wagmi's useWatchContractEvent hook in components
  // or with viem's watchContractEvent function
};

// Helper function to format addresses
export const formatAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Helper function to format token amounts
export const formatTokenAmount = (amount: bigint | number, decimals = 0) => {
  const num = typeof amount === 'bigint' ? Number(amount) : amount;
  return new Intl.NumberFormat().format(num);
};
