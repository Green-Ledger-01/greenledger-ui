import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { createConfig, http, WagmiProvider, useAccount, useDisconnect, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectButton, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { liskSepolia } from './chains/liskSepolia';
import { injected, walletConnect, coinbaseWallet } from '@wagmi/core/connectors';
import UserManagementABI from './contracts/UserManagement.json';
import CropBatchTokenABI from './contracts/CropBatchToken.json';
import { Buffer } from 'buffer'; // Import Buffer for IPFS
import { AlertTriangle, RefreshCw, XCircle, CheckCircle, Info, Menu, ChevronRight, Filter, Search, Wallet } from 'lucide-react';
import clsx from 'clsx'; // For conditional class names

// Polyfill Buffer for IPFS
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = Buffer;
}

// --- Configuration ---

// Contract Addresses (placeholders - update with actual deployed addresses)
const CONTRACT_ADDRESSES = {
  UserManagement: '0x66BCB324f59035aD2B084Fe651ea82398A9fac82', // Replace with your deployed UserManagement address
  CropBatchToken: '0xA065205364784B3D7e830D0EB2681EB218e3aD27', // Replace with your deployed CropBatchToken address
};

// Wagmi Config
const wagmiConfig = createConfig({
  connectors: [
    injected(),
    coinbaseWallet({ appName: 'GreenLedger' }),
    walletConnect({ projectId: 'a2b252199b53298a09b4344c2ae77d33' }), // Replace with your WalletConnect Project ID
  ],
  chains: [liskSepolia],
  transports: {
    [liskSepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

// --- Contexts ---

interface AppToast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastContextType {
  addToast: (message: string, type?: AppToast['type'], duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<AppToast[]>([]);

  const addToast = useCallback((message: string, type: AppToast['type'] = 'info', duration: number = 5000) => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    toasts.forEach((toast) => {
      if (toast.duration) {
        const timer = setTimeout(() => removeToast(toast.id), toast.duration);
        return () => clearTimeout(timer);
      }
    });
  }, [toasts, removeToast]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={clsx(
              'p-4 rounded-lg shadow-md flex items-center transition-all duration-300 ease-out transform',
              {
                'bg-green-100 border border-green-400 text-green-800': toast.type === 'success',
                'bg-red-100 border border-red-400 text-red-800': toast.type === 'error',
                'bg-yellow-100 border border-yellow-400 text-yellow-800': toast.type === 'warning',
                'bg-blue-100 border border-blue-400 text-blue-800': toast.type === 'info',
              }
            )}
            style={{ minWidth: '250px' }}
          >
            {toast.type === 'success' && <CheckCircle className="h-5 w-5 mr-3" />}
            {toast.type === 'error' && <XCircle className="h-5 w-5 mr-3" />}
            {toast.type === 'warning' && <AlertTriangle className="h-5 w-5 mr-3" />}
            {toast.type === 'info' && <Info className="h-5 w-5 mr-3" />}
            <span>{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="ml-auto text-current opacity-70 hover:opacity-100">
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Web3 Context to manage user roles
interface Web3ContextType {
  userRoles: {
    isFarmer: boolean;
    isTransporter: boolean;
    isBuyer: boolean;
    isAdmin: boolean;
  };
  isLoadingRoles: boolean;
  refetchRoles: () => void;
  canPerformAction: (requiredRole: 'farmer' | 'transporter' | 'buyer' | 'admin') => boolean;
  needsRole: (requiredRole: 'farmer' | 'transporter' | 'buyer' | 'admin') => boolean;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address, isConnected } = useAccount();
  const { addToast } = useToast();

  const { data: rolesData, isLoading: isLoadingRoles, refetch: refetchRoles } = useReadContract({
    address: CONTRACT_ADDRESSES.UserManagement,
    abi: UserManagementABI,
    functionName: 'getUserRolesStatus',
    args: [address as `0x${string}`],
    query: {
      enabled: isConnected && !!address,
      select: (data: any) => ({
        isFarmer: data[0],
        isTransporter: data[1],
        isBuyer: data[2],
      }),
      onError: (err) => addToast(`Failed to fetch user roles: ${getErrorMessage(err)}`, 'error'),
    },
  });

  const { data: isAdminRole, isLoading: isLoadingAdminRole } = useReadContract({
    address: CONTRACT_ADDRESSES.UserManagement,
    abi: UserManagementABI,
    functionName: 'hasRole',
    args: [
      '0x0000000000000000000000000000000000000000000000000000000000000000', // DEFAULT_ADMIN_ROLE hash
      address as `0x${string}`
    ],
    query: {
      enabled: isConnected && !!address,
      onError: (err) => addToast(`Failed to fetch admin role: ${getErrorMessage(err)}`, 'error'),
    },
  });

  const userRoles = {
    isFarmer: rolesData?.isFarmer || false,
    isTransporter: rolesData?.isTransporter || false,
    isBuyer: rolesData?.isBuyer || false,
    isAdmin: isAdminRole || false,
  };

  const canPerformAction = useCallback((requiredRole: 'farmer' | 'transporter' | 'buyer' | 'admin') => {
    if (!isConnected) return false;
    if (requiredRole === 'farmer') return userRoles.isFarmer || userRoles.isAdmin;
    if (requiredRole === 'transporter') return userRoles.isTransporter || userRoles.isAdmin;
    if (requiredRole === 'buyer') return userRoles.isBuyer || userRoles.isAdmin;
    if (requiredRole === 'admin') return userRoles.isAdmin;
    return false;
  }, [isConnected, userRoles]);

  const needsRole = useCallback((requiredRole: 'farmer' | 'transporter' | 'buyer' | 'admin') => {
    if (!isConnected) return false; // If not connected, cannot "need" a role yet
    return !canPerformAction(requiredRole);
  }, [isConnected, canPerformAction]);

  const isLoadingCombined = isLoadingRoles || isLoadingAdminRole;

  return (
    <Web3Context.Provider value={{ userRoles, isLoadingRoles: isLoadingCombined, refetchRoles, canPerformAction, needsRole }}>
      {children}
    </Web3Context.Provider>
  );
};

const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

// Custom hook for role-based access
const useRequireRole = (role: 'farmer' | 'transporter' | 'buyer' | 'admin') => {
  const { canPerformAction, needsRole, isLoadingRoles } = useWeb3();
  return {
    canPerformAction: canPerformAction(role),
    needsRole: needsRole(role),
    isLoadingRoles,
  };
};

// --- Utils ---

// Helper function to get readable error messages from Wagmi/Ethers errors
const getErrorMessage = (error: any): string => {
  if (error instanceof Error) {
    if (error.message.includes('User rejected the request')) {
      return 'Transaction rejected by user.';
    }
    if (error.message.includes('insufficient funds')) {
      return 'Insufficient funds for transaction.';
    }
    if (error.message.includes('AccessControl')) {
      return 'You do not have the required role to perform this action.';
    }
    if (error.message.includes('Invalid role')) {
      return 'Invalid role specified.';
    }
    return error.shortMessage || error.message;
  }
  return String(error);
};

// Helper function to format transaction hash for display
const formatTxHash = (hash: string | undefined): string => {
  if (!hash) return '';
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
};

// Helper to get block explorer URL (using Lisk Sepolia as default)
const getBlockExplorerUrl = (hash: string, type: 'tx' | 'address' = 'tx', chainId: number = liskSepolia.id): string => {
  const explorer = liskSepolia.blockExplorers?.default?.url;
  if (!explorer) return '#';
  return `${explorer}/${type}/${hash}`;
};

// IPFS Utils (simplified for demonstration)
const PINATA_API_KEY = 'YOUR_PINATA_API_KEY'; // Replace with your Pinata API Key
const PINATA_SECRET_API_KEY = 'YOUR_PINATA_SECRET_API_KEY'; // Replace with your Pinata Secret API Key

interface CropMetadataAttribute {
  trait_type: string;
  value: string | number;
}

interface CropMetadata {
  name: string;
  description: string;
  image: string; // IPFS URI for the image
  attributes: CropMetadataAttribute[];
  cropType: string;
  quantity: number;
  originFarm: string;
  harvestDate: number; // Unix timestamp
  notes: string;
  certifications?: string[];
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
}

const uploadFileToIPFS = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`IPFS file upload failed: ${response.status} ${response.statusText}. ${errorData.error || ''}`);
    }

    const data = await response.json();
    return `ipfs://${data.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    throw error;
  }
};

const uploadMetadataToIPFS = async (metadata: CropMetadata): Promise<string> => {
  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`IPFS metadata upload failed: ${response.status} ${response.statusText}. ${errorData.error || ''}`);
    }

    const data = await response.json();
    return `ipfs://${data.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading metadata to IPFS:', error);
    throw error;
  }
};

const fetchMetadataFromIPFS = async (ipfsUri: string): Promise<CropMetadata> => {
  if (!ipfsUri.startsWith('ipfs://')) {
    throw new Error('Invalid IPFS URI format');
  }
  const hash = ipfsUri.replace('ipfs://', '');
  const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${hash}`;
  try {
    const response = await fetch(gatewayUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.status} ${response.statusText}`);
    }
    const metadata = await response.json();
    return metadata as CropMetadata;
  } catch (error) {
    console.error('Error fetching metadata from IPFS:', error);
    throw error;
  }
};

const ipfsToHttp = (ipfsUri: string, gateway: string = 'https://gateway.pinata.cloud/ipfs'): string => {
  if (!ipfsUri.startsWith('ipfs://')) {
    return ipfsUri; // Return as-is if not IPFS URI
  }
  const hash = ipfsUri.replace('ipfs://', '');
  return `${gateway}/${hash}`;
};

// --- Hooks for Contract Interaction ---

const useUserManagement = () => {
  const { addToast } = useToast();
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: confirmError } = useWaitForTransactionReceipt({ hash });

  const registerUser = useCallback(async (userAddress: `0x${string}`, role: number) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.UserManagement,
        abi: UserManagementABI,
        functionName: 'registerUser',
        args: [userAddress, role],
      });
    } catch (e) {
      addToast(getErrorMessage(e), 'error');
    }
  }, [writeContract, addToast]);

  useEffect(() => {
    if (writeError) {
      addToast(`Registration failed: ${getErrorMessage(writeError)}`, 'error');
    }
  }, [writeError, addToast]);

  useEffect(() => {
    if (isConfirmed) {
      addToast('User registered successfully!', 'success');
    }
    if (confirmError) {
      addToast(`Registration confirmation failed: ${getErrorMessage(confirmError)}`, 'error');
    }
  }, [isConfirmed, confirmError, addToast]);

  return {
    registerUser,
    isRegistering: isPending,
    isConfirmingRegistration: isConfirming,
    isRegistrationConfirmed: isConfirmed,
    registrationError: writeError || confirmError,
    registrationTxHash: hash,
  };
};

const useCropBatchToken = () => {
  const { addToast } = useToast();
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: confirmError } = useWaitForTransactionReceipt({ hash });

  const mintNewBatch = useCallback(async (params: {
    to: `0x${string}`;
    cropType: string;
    quantity: number;
    originFarm: string;
    harvestDate: number;
    notes: string;
    metadataUri: string;
  }) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.CropBatchToken,
        abi: CropBatchTokenABI,
        functionName: 'mintNewBatch',
        args: [
          params.to,
          params.cropType,
          BigInt(params.quantity),
          params.originFarm,
          BigInt(params.harvestDate),
          params.notes,
          params.metadataUri,
        ],
      });
    } catch (e) {
      addToast(getErrorMessage(e), 'error');
    }
  }, [writeContract, addToast]);

  // Read nextTokenId for display/form logic
  const { data: nextTokenIdBigInt, isLoading: isLoadingNextTokenId } = useReadContract({
    address: CONTRACT_ADDRESSES.CropBatchToken,
    abi: CropBatchTokenABI,
    functionName: 'nextTokenId',
    query: {
      select: (data: bigint) => Number(data),
      onError: (err) => addToast(`Failed to fetch next token ID: ${getErrorMessage(err)}`, 'error'),
    },
  });

  const nextTokenId = nextTokenIdBigInt || 1;

  useEffect(() => {
    if (writeError) {
      addToast(`Minting failed: ${getErrorMessage(writeError)}`, 'error');
    }
  }, [writeError, addToast]);

  useEffect(() => {
    if (isConfirmed) {
      addToast('Crop batch minted successfully!', 'success');
      // Potentially refetch all batches after a successful mint
    }
    if (confirmError) {
      addToast(`Minting confirmation failed: ${getErrorMessage(confirmError)}`, 'error');
    }
  }, [isConfirmed, confirmError, addToast]);

  return {
    mintNewBatch,
    isMinting: isPending,
    isConfirming: isConfirming,
    isConfirmed: isConfirmed,
    error: writeError || confirmError,
    hash,
    nextTokenId,
    isLoadingNextTokenId,
  };
};

// --- Components ---

const RegisterUser: React.FC = () => {
  const [addressToRegister, setAddressToRegister] = useState('');
  const [selectedRole, setSelectedRole] = useState<number | ''>('');
  const { registerUser, isRegistering, isConfirmingRegistration } = useUserManagement();
  const { addToast } = useToast();
  const { refetchRoles } = useWeb3();

  const handleRegister = async () => {
    if (!addressToRegister || selectedRole === '') {
      addToast('Please enter an address and select a role.', 'warning');
      return;
    }
    await registerUser(addressToRegister as `0x${string}`, selectedRole as number);
    // Refetch user roles after registration attempt
    refetchRoles();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Register User Role</h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="addressToRegister" className="block text-sm font-medium text-gray-700">
            User Address:
          </label>
          <input
            type="text"
            id="addressToRegister"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
            value={addressToRegister}
            onChange={(e) => setAddressToRegister(e.target.value)}
            placeholder="0x..."
          />
        </div>
        <div>
          <label htmlFor="selectRole" className="block text-sm font-medium text-gray-700">
            Select Role:
          </label>
          <select
            id="selectRole"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
            value={selectedRole}
            onChange={(e) => setSelectedRole(Number(e.target.value))}
          >
            <option value="" disabled>
              Select a role
            </option>
            <option value={0}>Farmer</option>
            <option value={1}>Transporter</option>
            <option value={2}>Buyer</option>
            {/* Admin role can also register others */}
            <option value={3}>Admin (UserManagement DEFAULT_ADMIN_ROLE)</option>
          </select>
        </div>
        <button
          onClick={handleRegister}
          disabled={isRegistering || isConfirmingRegistration}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {isRegistering ? 'Sending Transaction...' : isConfirmingRegistration ? 'Confirming...' : 'Register Role'}
        </button>
        {(isRegistering || isConfirmingRegistration) && (
          <p className="text-sm text-green-700 mt-2">Please confirm in your wallet...</p>
        )}
      </div>
    </div>
  );
};

interface MintCropBatchProps {
  onSuccess?: (tokenId: number) => void;
  onError?: (error: string) => void;
}

export const MintCropBatch: React.FC<MintCropBatchProps> = ({ onSuccess }) => {
  const { address } = useAccount();
  const { mintNewBatch, isMinting, isConfirming, isConfirmed, error, hash, nextTokenId, isLoadingNextTokenId } = useCropBatchToken();
  const { canPerformAction, needsRole, isLoadingRoles } = useRequireRole('farmer');
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cropType: '',
    quantity: '',
    originFarm: '',
    harvestDate: '',
    notes: '',
    certifications: '',
    location: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string | null>>({});

  const validateField = (name: string, value: string): string | null => {
    if (!value) return 'This field is required.';
    if (name === 'quantity') {
      const q = parseInt(value);
      if (isNaN(q) || q <= 0 || q > 100) return 'Quantity must be between 1 and 100 kg.';
    }
    if (name === 'harvestDate') {
      const date = new Date(value);
      if (isNaN(date.getTime()) || date > new Date()) return 'Please enter a valid harvest date (not in the future).';
    }
    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setFormErrors(prev => ({ ...prev, imageFile: 'Please select a valid image file.' }));
        setImageFile(null);
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10 MB limit
        setFormErrors(prev => ({ ...prev, imageFile: 'Image file must be less than 10MB.' }));
        setImageFile(null);
        return;
      }
      setImageFile(file);
      setFormErrors(prev => ({ ...prev, imageFile: null }));
    } else {
      setImageFile(null);
      setFormErrors(prev => ({ ...prev, imageFile: 'Image file is required.' }));
    }
  };

  const validateForm = () => {
    let errors: Record<string, string | null> = {};
    Object.keys(formData).forEach(key => {
      errors[key] = validateField(key, formData[key as keyof typeof formData]);
    });
    if (!imageFile) {
      errors.imageFile = 'Image file is required.';
    }
    setFormErrors(errors);
    return !Object.values(errors).some(error => error !== null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      addToast('Please correct the form errors.', 'error');
      return;
    }
    if (!canPerformAction) {
      addToast('You need farmer role to mint crop batches.', 'warning');
      return;
    }
    if (!address) {
      addToast('Please connect your wallet.', 'warning');
      return;
    }

    try {
      setIsUploading(true);
      addToast('Uploading image and metadata to IPFS...', 'info');

      const quantity = parseInt(formData.quantity);
      const harvestDate = new Date(formData.harvestDate);

      const { metadataUri } = await uploadCropBatch({
        name: formData.name,
        description: formData.description,
        imageFile: imageFile!,
        cropType: formData.cropType,
        quantity,
        originFarm: formData.originFarm,
        harvestDate: Math.floor(harvestDate.getTime() / 1000),
        notes: formData.notes,
        certifications: formData.certifications ? formData.certifications.split(',').map(c => c.trim()) : undefined,
        location: formData.location ? { address: formData.location } : undefined,
      });

      addToast('IPFS upload complete. Initiating blockchain transaction...', 'info');
      await mintNewBatch({
        to: address,
        cropType: formData.cropType,
        quantity,
        originFarm: formData.originFarm,
        harvestDate: Math.floor(harvestDate.getTime() / 1000),
        notes: formData.notes,
        metadataUri,
      });

      // Clear form only on successful transaction confirmation
      // This is now handled in the useEffect below when `isConfirmed` becomes true
    } catch (err) {
      addToast(`Error minting batch: ${getErrorMessage(err)}`, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (isConfirmed && hash) {
      addToast(`Transaction confirmed! Token ID: ${nextTokenId}. Hash: ${formatTxHash(hash)}`, 'success', 10000);
      // Reset form on success
      setFormData({
        name: '', description: '', cropType: '', quantity: '', originFarm: '',
        harvestDate: '', notes: '', certifications: '', location: '',
      });
      setImageFile(null);
      setFormErrors({});
      onSuccess?.(nextTokenId);
    }
  }, [isConfirmed, hash, nextTokenId, onSuccess, addToast]);

  // Display role-based messages
  if (isLoadingRoles) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 text-center flex items-center justify-center space-x-2 animate-pulse">
        <Info className="h-5 w-5" />
        <span>Loading user roles...</span>
      </div>
    );
  }

  if (needsRole) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-center">
        <AlertTriangle className="h-6 w-6 inline-block mb-2" />
        <p className="font-semibold">Access Denied</p>
        <p>You need to be registered as a **Farmer** to mint new crop batches.</p>
        <p className="text-sm mt-2">
          Please contact an administrator to register your role.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg animate-fade-in-up">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4 border-green-200">Mint New Crop Batch (NFT)</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Crop Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Crop Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Organic Tomatoes"
            className={`mt-1 block w-full rounded-md border ${formErrors.name ? 'border-red-400' : 'border-gray-300'} shadow-sm p-3 focus:border-green-500 focus:ring-green-500`}
          />
          {formErrors.name && <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            placeholder="Detailed description of the crop batch, e.g., 'Harvested from fertile volcanic soil, rich in antioxidants.'"
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-3 focus:border-green-500 focus:ring-green-500"
          ></textarea>
        </div>

        {/* Crop Type & Quantity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="cropType" className="block text-sm font-medium text-gray-700 mb-1">
              Crop Type <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="cropType"
              name="cropType"
              value={formData.cropType}
              onChange={handleInputChange}
              placeholder="e.g., Tomato, Wheat, Coffee"
              className={`mt-1 block w-full rounded-md border ${formErrors.cropType ? 'border-red-400' : 'border-gray-300'} shadow-sm p-3 focus:border-green-500 focus:ring-green-500`}
            />
            {formErrors.cropType && <p className="mt-1 text-xs text-red-600">{formErrors.cropType}</p>}
          </div>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              Quantity (kg) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              min="1"
              max="100"
              placeholder="e.g., 50"
              className={`mt-1 block w-full rounded-md border ${formErrors.quantity ? 'border-red-400' : 'border-gray-300'} shadow-sm p-3 focus:border-green-500 focus:ring-green-500`}
            />
            {formErrors.quantity && <p className="mt-1 text-xs text-red-600">{formErrors.quantity}</p>}
          </div>
        </div>

        {/* Origin Farm & Harvest Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="originFarm" className="block text-sm font-medium text-gray-700 mb-1">
              Origin Farm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="originFarm"
              name="originFarm"
              value={formData.originFarm}
              onChange={handleInputChange}
              placeholder="e.g., Green Valley Farm"
              className={`mt-1 block w-full rounded-md border ${formErrors.originFarm ? 'border-red-400' : 'border-gray-300'} shadow-sm p-3 focus:border-green-500 focus:ring-green-500`}
            />
            {formErrors.originFarm && <p className="mt-1 text-xs text-red-600">{formErrors.originFarm}</p>}
          </div>
          <div>
            <label htmlFor="harvestDate" className="block text-sm font-medium text-gray-700 mb-1">
              Harvest Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="harvestDate"
              name="harvestDate"
              value={formData.harvestDate}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border ${formErrors.harvestDate ? 'border-red-400' : 'border-gray-300'} shadow-sm p-3 focus:border-green-500 focus:ring-green-500`}
            />
            {formErrors.harvestDate && <p className="mt-1 text-xs text-red-600">{formErrors.harvestDate}</p>}
          </div>
        </div>

        {/* Notes & Certifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <input
              type="text"
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="e.g., Organic, Pesticide-free, Lot-A"
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-3 focus:border-green-500 focus:ring-green-500"
            />
          </div>
          <div>
            <label htmlFor="certifications" className="block text-sm font-medium text-gray-700 mb-1">
              Certifications (comma-separated)
            </label>
            <input
              type="text"
              id="certifications"
              name="certifications"
              value={formData.certifications}
              onChange={handleInputChange}
              placeholder="e.g., USDA Organic, Fair Trade"
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-3 focus:border-green-500 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location (Address/Description)
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="e.g., 123 Farm Rd, Rural Town, Country"
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-3 focus:border-green-500 focus:ring-green-500"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 mb-1">
            Batch Image <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            id="imageFile"
            name="imageFile"
            accept="image/*"
            onChange={handleImageChange}
            className={`mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer ${formErrors.imageFile ? 'border border-red-400 rounded-md p-2' : ''}`}
          />
          {imageFile && <p className="mt-2 text-sm text-gray-600">Selected: {imageFile.name}</p>}
          {formErrors.imageFile && <p className="mt-1 text-xs text-red-600">{formErrors.imageFile}</p>}
        </div>

        <button
          type="submit"
          disabled={isMinting || isConfirming || isUploading || !address}
          className="w-full bg-green-700 text-white py-3 px-6 rounded-lg hover:bg-green-800 transition-colors duration-200 font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isUploading && (
            <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {isMinting ? 'Waiting for Wallet...' : isConfirming ? 'Confirming Transaction...' : isUploading ? 'Uploading to IPFS...' : 'Mint Crop Batch NFT'}
        </button>

        {hash && (
          <p className="mt-4 text-sm text-center text-gray-600">
            Transaction sent! View on{' '}
            <a href={getBlockExplorerUrl(hash)} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
              Block Explorer
            </a>
          </p>
        )}
      </form>
    </div>
  );
};

const CropBatchCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl shadow-lg p-5 animate-pulse border border-gray-200">
    <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
    <div className="h-4 bg-gray-200 rounded w-2/3 mb-1"></div>
    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
    <div className="mt-4 h-10 bg-gray-200 rounded-lg w-full"></div>
  </div>
);

interface CropBatchCardProps {
  batch: CropMetadata & { tokenId: number; }; // Ensure tokenId is present
}

const CropBatchCard: React.FC<CropBatchCardProps> = ({ batch }) => {
  const { addToast } = useToast();

  const handleMoreInfoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    addToast(`Displaying more info for Batch ID: ${batch.tokenId}. Crop Type: ${batch.cropType}`, 'info');
    // In a real app, this would open a modal or navigate to a detail page
  };

  const attributesToShow = batch.attributes.filter(attr =>
    ['Crop Type', 'Quantity (kg)', 'Origin Farm', 'Harvest Date'].includes(attr.trait_type)
  );

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 overflow-hidden group border border-gray-200">
      <div className="relative overflow-hidden">
        <img
          src={ipfsToHttp(batch.image)}
          alt={batch.name || 'Crop Batch Image'}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = `https://placehold.co/400x200/B0D9B1/000000?text=No+Image`;
            e.currentTarget.onerror = null; // Prevent infinite loop if placeholder also fails
          }}
        />
        <div className="absolute top-3 left-3 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
          ID: {batch.tokenId}
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">
          {batch.name || `Batch #${batch.tokenId}`}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {batch.description || 'No description available.'}
        </p>
        <div className="text-gray-700 text-sm space-y-1">
          {attributesToShow.map((attr, index) => (
            <p key={index}>
              <strong className="font-medium">{attr.trait_type}:</strong> {attr.value}
            </p>
          ))}
        </div>
        <button
          onClick={handleMoreInfoClick}
          className="mt-5 w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors duration-200 font-semibold flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
        >
          <span>More Info</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};


const Marketplace: React.FC = () => {
  const { addToast } = useToast();
  const { nextTokenId, isLoadingNextTokenId } = useCropBatchToken();
  const [batches, setBatches] = useState<Array<CropMetadata & { tokenId: number }>>([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(true);
  const { readContract } = useReadContract();

  // Mock data for marketplace display
  const mockBatches: (CropMetadata & { tokenId: number })[] = [
    {
      tokenId: 1,
      name: 'Organic Heirloom Tomatoes',
      description: 'Sweet, juicy, and vibrant red tomatoes harvested from sun-drenched fields.',
      image: 'ipfs://bafybeicg2q2f2j2b2f2j2b2f2j2b2f2j2b2f2j2b2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f', // Placeholder
      attributes: [
        { trait_type: 'Crop Type', value: 'Tomatoes' },
        { trait_type: 'Quantity (kg)', value: 75 },
        { trait_type: 'Origin Farm', value: 'Sunshine Acres' },
        { trait_type: 'Harvest Date', value: new Date('2024-05-20').getTime() / 1000 },
      ],
      cropType: 'Tomatoes',
      quantity: 75,
      originFarm: 'Sunshine Acres',
      harvestDate: new Date('2024-05-20').getTime() / 1000,
      notes: 'Certified organic, hand-picked',
    },
    {
      tokenId: 2,
      name: 'Premium Arabica Coffee Beans',
      description: 'Single-origin Arabica beans, shade-grown in high altitudes, with notes of chocolate and citrus.',
      image: 'ipfs://bafybeicg2q2f2j2b2f2j2b2f2j2b2f2j2b2f2j2b2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f', // Placeholder
      attributes: [
        { trait_type: 'Crop Type', value: 'Coffee Beans' },
        { trait_type: 'Quantity (kg)', value: 100 },
        { trait_type: 'Origin Farm', value: 'Mountain Peak Estate' },
        { trait_type: 'Harvest Date', value: new Date('2024-04-10').getTime() / 1000 },
      ],
      cropType: 'Coffee Beans',
      quantity: 100,
      originFarm: 'Mountain Peak Estate',
      harvestDate: new Date('2024-04-10').getTime() / 1000,
      notes: 'Fair trade certified, medium roast',
    },
    {
      tokenId: 3,
      name: 'Farm Fresh Eggs',
      description: 'Cage-free eggs from happy hens, rich in omega-3 fatty acids.',
      image: 'https://placehold.co/400x200/D0F0C0/000000?text=Eggs+Image', // Placeholder image
      attributes: [
        { trait_type: 'Crop Type', value: 'Eggs' },
        { trait_type: 'Quantity (kg)', value: 10 },
        { trait_type: 'Origin Farm', value: 'Green Pastures' },
        { trait_type: 'Harvest Date', value: new Date('2024-06-15').getTime() / 1000 },
      ],
      cropType: 'Eggs',
      quantity: 10,
      originFarm: 'Green Pastures',
      harvestDate: new Date('2024-06-15').getTime() / 1000,
      notes: 'Pasture-raised, large size',
    },
    {
      tokenId: 4,
      name: 'Wildflower Honey',
      description: 'Pure, raw honey from local wildflowers, unpasteurized and rich in natural enzymes.',
      image: 'https://placehold.co/400x200/F9E79F/000000?text=Honey+Image', // Placeholder image
      attributes: [
        { trait_type: 'Crop Type', value: 'Honey' },
        { trait_type: 'Quantity (kg)', value: 25 },
        { trait_type: 'Origin Farm', value: 'Busy Bee Apiary' },
        { trait_type: 'Harvest Date', value: new Date('2024-06-01').getTime() / 1000 },
      ],
      cropType: 'Honey',
      quantity: 25,
      originFarm: 'Busy Bee Apiary',
      harvestDate: new Date('2024-06-01').getTime() / 1000,
      notes: 'Unfiltered, ethically sourced',
    },
  ];

  // Function to fetch a single batch's details and metadata
  const fetchBatchData = useCallback(async (id: number): Promise<(CropMetadata & { tokenId: number }) | null> => {
    try {
      // Read batch details from smart contract
      const batchInfo = await readContract({
        address: CONTRACT_ADDRESSES.CropBatchToken,
        abi: CropBatchTokenABI,
        functionName: 'batchDetails',
        args: [BigInt(id)],
      }) as unknown as [string, bigint, string, bigint, string, string]; // Adjust types based on your ABI output

      const [cropType, quantityBigInt, originFarm, harvestDateBigInt, notes, metadataUri] = batchInfo;

      const quantity = Number(quantityBigInt);
      const harvestDate = Number(harvestDateBigInt);

      // Fetch metadata from IPFS
      const metadata = await fetchMetadataFromIPFS(metadataUri);

      return {
        tokenId: id,
        cropType,
        quantity,
        originFarm,
        harvestDate,
        notes,
        metadataUri,
        ...metadata, // Spread existing metadata properties
      };
    } catch (error) {
      console.error(`Error fetching batch ID ${id}:`, error);
      addToast(`Failed to load batch ID ${id}: ${getErrorMessage(error)}`, 'error');
      return null;
    }
  }, [readContract, addToast]);

  useEffect(() => {
    const loadBatches = async () => {
      setIsLoadingBatches(true);
      if (isLoadingNextTokenId) return; // Wait for nextTokenId to load

      const fetched: (CropMetadata & { tokenId: number })[] = [];
      const currentMaxTokenId = nextTokenId; // Use the fetched nextTokenId

      // Fetch actual batches from contract
      for (let i = 1; i < currentMaxTokenId; i++) {
        const batch = await fetchBatchData(i);
        if (batch) {
          fetched.push(batch);
        }
      }

      // Combine fetched batches with mock data, ensuring no duplicates by tokenId
      const combinedBatches = [...mockBatches];
      fetched.forEach(fetchedBatch => {
        if (!combinedBatches.some(mockBatch => mockBatch.tokenId === fetchedBatch.tokenId)) {
          combinedBatches.push(fetchedBatch);
        }
      });
      
      setBatches(combinedBatches.sort((a, b) => a.tokenId - b.tokenId));
      setIsLoadingBatches(false);
    };

    loadBatches();
  }, [nextTokenId, isLoadingNextTokenId, fetchBatchData, addToast]);

  const [filterCropType, setFilterCropType] = useState('');
  const [filterFarmName, setFilterFarmName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBatches = batches.filter(batch => {
    const matchesCropType = filterCropType ? batch.cropType.toLowerCase().includes(filterCropType.toLowerCase()) : true;
    const matchesFarmName = filterFarmName ? batch.originFarm.toLowerCase().includes(filterFarmName.toLowerCase()) : true;
    const matchesSearch = searchQuery
      ? JSON.stringify(batch).toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCropType && matchesFarmName && matchesSearch;
  });

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center animate-fade-in-down">
        GreenLedger Marketplace
      </h2>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
        <div className="flex items-center space-x-3">
          <Filter className="text-green-600 h-6 w-6" />
          <input
            type="text"
            placeholder="Filter by Crop Type"
            value={filterCropType}
            onChange={(e) => setFilterCropType(e.target.value)}
            className="flex-grow rounded-md border border-gray-300 shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div className="flex items-center space-x-3">
          <Filter className="text-green-600 h-6 w-6" />
          <input
            type="text"
            placeholder="Filter by Farm Name"
            value={filterFarmName}
            onChange={(e) => setFilterFarmName(e.target.value)}
            className="flex-grow rounded-md border border-gray-300 shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div className="flex items-center space-x-3">
          <Search className="text-green-600 h-6 w-6" />
          <input
            type="text"
            placeholder="Search all batches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow rounded-md border border-gray-300 shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      {isLoadingBatches ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <CropBatchCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {filteredBatches.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBatches.map((batch) => (
                <CropBatchCard key={batch.tokenId} batch={batch} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600 p-8 bg-white rounded-xl shadow-lg">
              <Info className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <p className="text-xl font-semibold">No crop batches found matching your criteria.</p>
              <p className="mt-2">Try adjusting your filters or search query.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};


// --- Layout Components ---

const Header: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { userRoles, isLoadingRoles } = useWeb3();
  const chainId = useChainId();

  const truncateAddress = (addr: string): string => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const getUserRoleDisplay = () => {
    if (isLoadingRoles) return 'Loading Role...';
    if (!isConnected) return 'Not Connected';

    const roles = [];
    if (userRoles.isAdmin) roles.push('Admin');
    if (userRoles.isFarmer) roles.push('Farmer');
    if (userRoles.isTransporter) roles.push('Transporter');
    if (userRoles.isBuyer) roles.push('Buyer');

    return roles.length > 0 ? roles.join(', ') : 'No Role';
  };

  return (
    <header className="bg-white shadow-md py-4 px-6 flex items-center justify-between sticky top-0 z-10 rounded-b-xl">
      <div className="flex items-center">
        <img src="https://placehold.co/40x40/B0D9B1/000000?text=GL" alt="GreenLedger Logo" className="h-10 w-10 mr-3 rounded-full" />
        <h1 className="text-2xl font-bold text-green-800">GreenLedger</h1>
      </div>

      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center space-x-4 text-sm text-gray-700">
          {isConnected && (
            <>
              <span className="font-medium">Role: <span className="font-semibold text-green-700">{getUserRoleDisplay()}</span></span>
              <span className="font-medium">Chain ID: <span className="font-semibold text-green-700">{chainId}</span></span>
              <div className="flex items-center border border-green-300 rounded-full px-3 py-1 bg-green-50 text-green-800">
                <Wallet className="h-4 w-4 mr-2" />
                <span>{truncateAddress(address!)}</span>
                <button onClick={() => navigator.clipboard.writeText(address!)} className="ml-2 text-green-600 hover:text-green-800 transition-colors" title="Copy Address">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>
                </button>
              </div>
              <button
                onClick={() => disconnect()}
                className="bg-red-500 text-white text-sm px-4 py-2 rounded-full hover:bg-red-600 transition-colors"
              >
                Disconnect
              </button>
            </>
          )}
        </div>
        <div className="md:hidden">
          <ConnectButton /> {/* Full WalletConnect button for mobile */}
        </div>
      </div>
    </header>
  );
};

const Sidebar: React.FC<{ isOpen: boolean; toggleSidebar: () => void; setActiveRoute: (route: string) => void }> = ({ isOpen, toggleSidebar, setActiveRoute }) => {
  const { userRoles } = useWeb3();

  const navItems = [
    { name: 'Dashboard', route: 'dashboard' },
    { name: 'Mint Batch', route: 'mint', roles: ['farmer', 'admin'] },
    { name: 'Marketplace', route: 'marketplace' },
    { name: 'Register Role', route: 'register', roles: ['admin'] },
    // { name: 'Track Batch', route: 'track' }, // Future feature
    // { name: 'Reports', route: 'reports', roles: ['admin', 'buyer'] }, // Future feature
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={toggleSidebar}></div>
      )}
      <div className={clsx(
        "fixed top-0 left-0 h-full bg-green-900 text-white w-64 p-6 transition-transform duration-300 ease-in-out z-30",
        "md:relative md:translate-x-0 md:flex-shrink-0 md:rounded-r-xl md:shadow-lg",
        {
          'translate-x-0': isOpen,
          '-translate-x-full': !isOpen,
        }
      )}>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white">Navigation</h2>
          <button onClick={toggleSidebar} className="md:hidden text-white focus:outline-none">
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        <nav>
          <ul className="space-y-3">
            {navItems.map((item) => {
              const hasRequiredRole = !item.roles || item.roles.some(role => userRoles[`is${role.charAt(0).toUpperCase() + role.slice(1)}` as keyof typeof userRoles]);
              return (
                <li key={item.route}>
                  <button
                    onClick={() => {
                      setActiveRoute(item.route);
                      toggleSidebar(); // Close sidebar on mobile after selection
                    }}
                    disabled={!hasRequiredRole}
                    className={clsx(
                      "w-full text-left flex items-center p-3 rounded-lg transition-colors duration-200",
                      "hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500",
                      {
                        'bg-green-700': location.pathname === `/${item.route}`, // Highlight active route (mocked by location.pathname)
                        'opacity-50 cursor-not-allowed': !hasRequiredRole,
                      }
                    )}
                  >
                    {item.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
};

const Dashboard: React.FC = () => {
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center animate-fade-in-down">
        GreenLedger Dashboard
      </h2>

      {/* Hero Section */}
      <section className="bg-green-700 text-white rounded-xl shadow-lg p-8 mb-10 text-center animate-fade-in-up">
        <h3 className="text-4xl font-extrabold mb-4">
          Transparent Agricultural Supply Chain
        </h3>
        <p className="text-lg mb-6 max-w-2xl mx-auto">
          Track your produce from farm to table with immutable blockchain records, ensuring trust and traceability at every step.
        </p>
        <div className="flex justify-center space-x-4">
          <button className="bg-white text-green-700 font-semibold px-6 py-3 rounded-full shadow-lg hover:bg-green-100 transition-colors transform hover:scale-105">
            Explore Batches
          </button>
          <button className="bg-green-800 text-white font-semibold px-6 py-3 rounded-full shadow-lg border border-green-600 hover:bg-green-900 transition-colors transform hover:scale-105">
            Register as User
          </button>
        </div>
      </section>

      {/* Live Data Visualizations (Placeholder) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in-up delay-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-activity text-green-600 mr-2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
            Recent Token Mints
          </h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
            <p>Chart/Graph Placeholder</p>
          </div>
          <p className="mt-4 text-sm text-gray-600">Visualizing the latest crop batch tokenizations on the blockchain.</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in-up delay-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin text-green-600 mr-2"><path d="M12 12.01v.01"></path><path d="M18.66 17.43L12 22 5.34 17.43a3 3 0 0 1-1.66-2.61V6.63a3 3 0 0 1 1.66-2.61L12 2l6.66 4.02a3 3 0 0 1 1.66 2.61v8.19a3 3 0 0 1-1.66 2.61z"></path></svg>
            Supply Chain Map
          </h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
            <p>Interactive Map Placeholder</p>
          </div>
          <p className="mt-4 text-sm text-gray-600">See the global movement and origin of agricultural products.</p>
        </div>
      </section>

      {/* Quick Access */}
      <section className="bg-white rounded-xl shadow-lg p-6 animate-fade-in-up delay-300">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap text-green-600 mr-2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="bg-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-600 transition-colors shadow-md">
            Register Role
          </button>
          <button className="bg-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors shadow-md">
            Mint New Batch
          </button>
          <button className="bg-purple-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-600 transition-colors shadow-md">
            Transfer Batch
          </button>
          <button className="bg-yellow-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-yellow-600 transition-colors shadow-md">
            Explore Batches
          </button>
        </div>
      </section>
    </div>
  );
};


const AppRoutes: React.FC = () => {
  const [activeRoute, setActiveRoute] = useState('dashboard'); // Default route
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderContent = () => {
    switch (activeRoute) {
      case 'dashboard':
        return <Dashboard />;
      case 'mint':
        return <MintCropBatch />;
      case 'marketplace':
        return <Marketplace />;
      case 'register':
        return <RegisterUser />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-100 via-white to-green-200 font-inter">
      {/* Mobile Header with Hamburger */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white shadow-md">
        <button onClick={toggleSidebar} className="text-green-800 focus:outline-none">
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold text-green-800">GreenLedger</h1>
        <ConnectButton />
      </div>

      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar isOpen={true} toggleSidebar={() => {}} setActiveRoute={setActiveRoute} />
        </div>
        {/* Mobile Sidebar (controlled by state) */}
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} setActiveRoute={setActiveRoute} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50 bg-opacity-80 rounded-tl-xl">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};


export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({
          accentColor: '#10B981', // green-500
          accentColorForeground: 'white',
          borderRadius: 'large',
          fontStack: 'system',
          overlayBlur: 'small',
        })}
        modalSize="compact">
          <ToastProvider>
            <Web3Provider>
              <ErrorBoundary>
                <AppRoutes />
              </ErrorBoundary>
            </Web3Provider>
          </ToastProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// ErrorBoundary Component (provided in problem statement)
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2"> Oops! Something went wrong </h1>
            <p className="text-gray-600 mb-6"> We encountered an unexpected error. This might be due to a network issue or a temporary problem. </p>
            <div className="space-y-3 mb-6">
              <button onClick={this.handleReset} className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"> Try Again </button>
              <button onClick={this.handleReload} className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center">
                <RefreshCw className="h-4 w-4 mr-2" /> Reload Page
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-gray-50 rounded-lg p-4 mt-4">
                <summary className="cursor-pointer font-medium text-gray-700 mb-2"> Error Details (Development) </summary>
                <div className="text-sm text-gray-600 space-y-2">
                  <div>
                    <strong>Error:</strong>
                    <pre className="mt-1 text-xs bg-red-50 p-2 rounded overflow-auto"> {this.state.error.toString()} </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 text-xs bg-red-50 p-2 rounded overflow-auto"> {this.state.errorInfo.componentStack} </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
            <div className="mt-6 text-sm text-gray-500">
              <p>If the problem persists, please:</p>
              <ul className="mt-2 space-y-1 text-left">
                <li>• Check your internet connection</li>
                <li>• Ensure your wallet is connected</li>
                <li>• Try refreshing the page</li>
                <li>• Contact support if needed</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

