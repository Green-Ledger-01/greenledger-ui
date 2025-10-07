import React, { createContext, useContext, useState, useEffect } from 'react';

// Auth types for future Google integration
export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  picture?: string;
  walletAddress?: string;
  authMethod: 'wallet' | 'google';
  isVerified: boolean;
}

export interface AuthContextType {
  // Current user state
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Auth methods (prepared for future implementation)
  signInWithGoogle: () => Promise<void>;
  signInWithWallet: (address: string) => Promise<void>;
  signOut: () => Promise<void>;
  
  // Wallet connection
  connectWallet: (address: string) => void;
  disconnectWallet: () => void;
  
  // User preferences
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (completed: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Context Provider
 * 
 * Flexible authentication system that supports:
 * - Current: Wallet-only authentication
 * - Future: Google Sign-In + optional wallet connection
 * - Seamless user experience regardless of auth method
 */
export const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Load persisted auth state on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('greenledger_auth_user');
    const savedOnboarding = localStorage.getItem('greenledger_onboarding_completed');
    
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('greenledger_auth_user');
      }
    }
    
    setHasCompletedOnboarding(savedOnboarding === 'true');
  }, []);

  // Persist user state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('greenledger_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('greenledger_auth_user');
    }
  }, [user]);

  // Future: Google Sign-In implementation
  const signInWithGoogle = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // TODO: Implement Google OAuth
      // This will be implemented when Google Auth is ready
      console.log('Google Sign-In will be implemented here');
      throw new Error('Google Sign-In not yet implemented');
    } catch (error) {
      console.error('Google sign-in failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Current: Wallet authentication
  const signInWithWallet = async (address: string): Promise<void> => {
    setIsLoading(true);
    try {
      const walletUser: AuthUser = {
        id: address,
        walletAddress: address,
        authMethod: 'wallet',
        isVerified: true, // Wallet connection implies verification
      };
      
      setUser(walletUser);
    } catch (error) {
      console.error('Wallet sign-in failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    setUser(null);
    localStorage.removeItem('greenledger_auth_user');
    localStorage.removeItem('greenledger_onboarding_completed');
    setHasCompletedOnboarding(false);
  };

  // Connect wallet to existing user (for Google users)
  const connectWallet = (address: string): void => {
    if (user) {
      setUser({
        ...user,
        walletAddress: address,
      });
    } else {
      // If no user, create wallet user
      signInWithWallet(address);
    }
  };

  // Disconnect wallet
  const disconnectWallet = (): void => {
    if (user?.authMethod === 'wallet') {
      // If wallet-only user, sign out completely
      signOut();
    } else if (user) {
      // If Google user, just remove wallet
      setUser({
        ...user,
        walletAddress: undefined,
      });
    }
  };

  // Update onboarding status
  const updateOnboardingStatus = (completed: boolean): void => {
    setHasCompletedOnboarding(completed);
    localStorage.setItem('greenledger_onboarding_completed', completed.toString());
  };

  const contextValue: AuthContextType = {
    // State
    user,
    isAuthenticated: !!user,
    isLoading,
    
    // Auth methods
    signInWithGoogle,
    signInWithWallet,
    signOut,
    
    // Wallet connection
    connectWallet,
    disconnectWallet,
    
    // User preferences
    hasCompletedOnboarding,
    setHasCompletedOnboarding: updateOnboardingStatus,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
};

export default AuthContext;