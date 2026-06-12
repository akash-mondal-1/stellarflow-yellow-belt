import React, { useEffect, useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { X, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const wallets = [
  { id: "freighter", name: 'Freighter' },
  { id: "xbull", name: 'xBull' },
  { id: "albedo", name: 'Albedo' },
];

export const WalletModal: React.FC = () => {
  const { isModalOpen, setModalOpen, connect, kit } = useWallet();
  const [walletStates, setWalletStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isModalOpen && kit) {
      kit.refreshSupportedWallets().then((supportedWallets: any[]) => {
        const states: Record<string, boolean> = {};
        supportedWallets.forEach(w => {
          states[w.id] = w.isAvailable;
        });
        setWalletStates(states);
      }).catch(console.error);
    }
  }, [isModalOpen, kit]);

  if (!isModalOpen) return null;

  const handleConnect = async (id: string) => {
    try {
      await connect(id);
      toast.success('Wallet connected successfully!');
    } catch (error) {
      // Error is handled in the context
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
      <div className="glass-card w-full max-w-md relative animate-in fade-in zoom-in duration-200 shadow-2xl shadow-stellar-brand/20">
        <button 
          onClick={() => setModalOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-white text-center">Connect Wallet</h2>
        <div className="space-y-4">
          {wallets.map(w => {
            const isAvailable = walletStates[w.id];
            
            return (
              <button
                key={w.id}
                onClick={() => handleConnect(w.id)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:-translate-y-1 hover:bg-white/10 hover:border-stellar-accent/50 hover:shadow-[0_0_15px_rgba(0,209,255,0.2)] transition-all cursor-pointer group"
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium text-lg text-slate-200 group-hover:text-white">{w.name}</span>
                  {isAvailable !== undefined && (
                    <span className={`text-xs flex items-center gap-1 mt-1 ${isAvailable ? 'text-green-400' : 'text-red-400'}`}>
                      {isAvailable ? <><CheckCircle2 size={12}/> Installed</> : <><XCircle size={12}/> Not Installed</>}
                    </span>
                  )}
                </div>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-stellar-brand/80 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
