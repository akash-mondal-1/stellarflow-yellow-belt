import React, { createContext, useContext, useState, type ReactNode } from 'react';

type TxStatus = 'idle' | 'pending' | 'success' | 'failed';

interface AppContextType {
  donorCount: number;
  setDonorCount: React.Dispatch<React.SetStateAction<number>>;
  
  txStatus: TxStatus;
  setTxStatus: React.Dispatch<React.SetStateAction<TxStatus>>;
  
  txHash: string | null;
  setTxHash: React.Dispatch<React.SetStateAction<string | null>>;
  
  latestEvent: any | null;
  setLatestEvent: React.Dispatch<React.SetStateAction<any | null>>;
  
  triggerRefresh: number;
  refreshCampaign: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [donorCount, setDonorCount] = useState(0);
  const [txStatus, setTxStatus] = useState<TxStatus>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [latestEvent, setLatestEvent] = useState<any | null>(null);
  const [triggerRefresh, setTriggerRefresh] = useState(0);

  const refreshCampaign = () => {
    setTriggerRefresh(prev => prev + 1);
  };

  return (
    <AppContext.Provider value={{ 
      donorCount, setDonorCount, 
      txStatus, setTxStatus, 
      txHash, setTxHash, 
      latestEvent, setLatestEvent,
      triggerRefresh, refreshCampaign
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
