import React, { useState, useEffect } from 'react';
import { useStellar } from '../hooks/useStellar';
import { useAppContext } from '../contexts/AppContext';
import { Rocket, Target, Users } from 'lucide-react';
import { toast } from 'sonner';

export const CampaignDashboard: React.FC = () => {
  const { donate, getCampaign } = useStellar();
  const { donorCount, setDonorCount, setTxStatus, setTxHash, setLatestEvent, triggerRefresh, refreshCampaign } = useAppContext();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const [campaignData, setCampaignData] = useState({ goal: 50000, raised: 12500, active: true });

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const fetchCampaign = async () => {
      const data = await getCampaign();
      setCampaignData(data);
      timeoutId = setTimeout(fetchCampaign, 10000); // Real-time state refresh
    };
    fetchCampaign();
    return () => clearTimeout(timeoutId);
  }, [getCampaign, triggerRefresh]);

  const { goal, raised } = campaignData;
  const progress = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }
    
    setLoading(true);
    setTxStatus('pending');
    setTxHash(null);

    try {
      const txHash = await donate(amount);
      setTxHash(txHash);
      setTxStatus('success');
      setDonorCount(prev => prev + 1);
      
      // Optimistic campaign update safely
      setCampaignData(prev => ({ ...prev, raised: Number(prev.raised) + numericAmount }));
      
      const newEvent = {
        id: txHash,
        donor: 'G_CURRENT_USER...',
        amount: numericAmount,
        time: new Date()
      };
      setLatestEvent(newEvent);
      
      toast.success(
        <div className="flex flex-col">
          <span>Donation successful!</span>
          <a href={`https://stellar.expert/explorer/testnet/tx/${txHash}`} target="_blank" rel="noreferrer" className="text-stellar-accent underline text-sm mt-1">
            View on Explorer
          </a>
        </div>
      );
      
      // Trigger immediate refresh globally
      refreshCampaign();
      
      const updatedData = await getCampaign();
      setCampaignData(updatedData);
      setAmount('');
    } catch (e: any) {
      setTxStatus('failed');
      // Error handled in hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both w-full max-w-4xl mx-auto mt-12 relative overflow-hidden group">
      <div className="absolute -right-20 -top-20 w-40 h-40 bg-stellar-brand/20 rounded-full blur-3xl group-hover:bg-stellar-brand/30 transition-colors duration-700" />
      <div className="flex flex-col md:flex-row gap-8 relative z-10">
        
        {/* Left Side: Campaign Info */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-stellar-brand/20 flex items-center justify-center text-stellar-accent border border-stellar-brand/30">
              <Rocket size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">StellarFlow Live Crowdfunding</h1>
              <p className="text-slate-400 mt-1 font-medium">Support the next generation of Stellar dApps.</p>
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-white/5 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-green-400"></span> <span className="text-green-400/90">Connected</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 flex items-center gap-2">
                <Target size={16} /> Raised so far
              </span>
              <span className="font-semibold text-white">{raised.toLocaleString()} XLM <span className="text-slate-500 font-normal">/ {goal.toLocaleString()} XLM</span></span>
            </div>
            <div className="h-4 w-full bg-slate-900/80 rounded-full overflow-hidden border border-white/5 relative shadow-inner">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-stellar-brand to-stellar-accent transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/40 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors">
              <div className="text-slate-400 text-sm mb-1 flex items-center gap-2"><Users size={16} /> Donors</div>
              <div className="text-2xl font-semibold text-white">{donorCount}</div>
            </div>
            <div className="bg-slate-800/40 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors">
              <div className="text-slate-400 text-sm mb-1 flex items-center gap-2"><Target size={16} /> Time Left</div>
              <div className="text-2xl font-semibold text-white">12 Days</div>
            </div>
          </div>
        </div>

        {/* Right Side: Donation Form */}
        <div className="md:w-80 bg-slate-900/60 rounded-xl p-6 border border-white/5 flex flex-col justify-center backdrop-blur-md shadow-xl shadow-black/20">
          <h3 className="text-xl font-semibold text-white mb-4">Make a Donation</h3>
          <form onSubmit={handleDonate} className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Amount (XLM)</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  required
                  className="w-full glass-input pl-4 pr-12"
                  placeholder="100.0"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  disabled={loading}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">XLM</span>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading || !amount}
              className="w-full glass-button flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="animate-pulse">Processing...</span>
              ) : (
                <>Donate Now</>
              )}
            </button>
          </form>
        </div>
        
      </div>
    </div>
  );
};
