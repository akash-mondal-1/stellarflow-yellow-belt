import React from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Wallet, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { address, setModalOpen, disconnect } = useWallet();

  return (
    <nav className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-stellar-brand to-stellar-accent rounded-xl flex items-center justify-center shadow-lg shadow-stellar-brand/20">
            <div className="w-4 h-4 bg-white rounded-full"></div>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">StellarFlow</span>
        </div>
        
        <div className="flex items-center gap-4">
          {address ? (
            <div className="flex items-center gap-3">
              <div className="bg-slate-800/80 border border-white/10 px-4 py-2 rounded-full text-sm font-medium text-slate-200 shadow-inner">
                {address.substring(0, 6)}...{address.substring(address.length - 4)}
              </div>
              <button 
                onClick={disconnect}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                title="Disconnect"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setModalOpen(true)}
              className="glass-button flex items-center gap-2 py-2.5 px-5"
            >
              <Wallet size={18} />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
