import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { StellarWalletsKit, Networks } from '@creit.tech/stellar-wallets-kit';
import { defaultModules } from '@creit.tech/stellar-wallets-kit/modules/utils';
import { toast } from 'sonner';

interface WalletContextType {
  address: string | null;
  kit: typeof StellarWalletsKit | null;
  connect: (walletId: string) => Promise<void>;
  disconnect: () => void;
  isModalOpen: boolean;
  setModalOpen: (open: boolean) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    StellarWalletsKit.init({
      network: Networks.TESTNET,
      modules: defaultModules(),
    });
  }, []);

  const connect = async (walletId: string) => {
    console.log(`[Wallet] Connection attempt with: ${walletId}`);
    try {
      StellarWalletsKit.setWallet(walletId);
      console.log(`[Wallet] Selected wallet: ${walletId}`);
      
      const { address } = await StellarWalletsKit.fetchAddress();
      console.log(`[Wallet] Connection success. Retrieved address: ${address}`);
      
      setAddress(address);
      setModalOpen(false);
    } catch (e: any) {
      const msg = e?.message?.toLowerCase() || "";
      console.error(`[Wallet] Connection failure reason: ${e?.message}`);
      
      if (msg.includes("reject") || msg.includes("decline") || msg.includes("cancel")) {
        toast.error("User rejected the connection request.");
      } else if (msg.includes("not installed") || msg.includes("unavailable")) {
        toast.error(`Wallet ${walletId} is not installed or unavailable.`);
      } else {
        toast.error(`Failed to connect to ${walletId}: ${e?.message || "Unknown error"}`);
      }
      throw e;
    }
  };

  const disconnect = () => {
    setAddress(null);
  };

  return (
    <WalletContext.Provider value={{ address, kit: StellarWalletsKit, connect, disconnect, isModalOpen, setModalOpen }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
