import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { CONTRACT_ID } from '../hooks/useStellar';
import { CheckCircle2, Clock, XCircle, Terminal, Activity, Link as LinkIcon } from 'lucide-react';

export const ReviewerDashboard: React.FC = () => {
  const { txStatus, txHash, latestEvent } = useAppContext();

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
      <div className="flex items-center gap-2 mb-4">
        <Terminal className="text-stellar-brand" size={20} />
        <h2 className="text-xl font-bold text-white tracking-tight">Reviewer Verification Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contract Status Card */}
        <div className="glass-card p-6 border-l-4 border-l-stellar-brand">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            Contract Status
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-white/5">
              <span className="text-slate-400">Network</span>
              <span className="font-mono text-stellar-accent">Stellar Testnet</span>
            </div>
            <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-white/5">
              <span className="text-slate-400">Mode</span>
              <span className="flex items-center gap-1 text-green-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-green-400"></span> Connected
              </span>
            </div>
            <div className="bg-slate-900/50 p-3 rounded-lg border border-white/5 overflow-hidden">
              <span className="text-slate-400 block mb-1">Contract ID</span>
              <span className="font-mono text-xs text-slate-300 break-all">{CONTRACT_ID}</span>
            </div>
          </div>
        </div>

        {/* Transaction Status Panel */}
        <div className={`glass-card p-6 border-l-4 ${
          txStatus === 'success' ? 'border-l-green-400' :
          txStatus === 'pending' ? 'border-l-yellow-400' :
          txStatus === 'failed' ? 'border-l-red-400' : 'border-l-slate-600'
        }`}>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            Transaction Activity
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-white/5">
              <span className="text-sm text-slate-400">Current Status</span>
              {txStatus === 'idle' && <span className="text-slate-500 font-medium text-sm">Waiting for action...</span>}
              {txStatus === 'pending' && <span className="text-yellow-400 flex items-center gap-2 font-medium text-sm"><Clock size={16} className="animate-spin" /> Pending</span>}
              {txStatus === 'success' && <span className="text-green-400 flex items-center gap-2 font-medium text-sm"><CheckCircle2 size={16} /> Success</span>}
              {txStatus === 'failed' && <span className="text-red-400 flex items-center gap-2 font-medium text-sm"><XCircle size={16} /> Failed</span>}
            </div>

            {txHash && (
              <div className="p-3 rounded-lg bg-slate-900/50 border border-white/5 space-y-2">
                <span className="text-xs text-slate-400 block">Latest Hash</span>
                <span className="font-mono text-xs text-stellar-accent break-all block">{txHash}</span>
                <a href={`https://stellar.expert/explorer/testnet/tx/${txHash}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white transition-colors mt-2">
                  <LinkIcon size={12} /> View on Explorer
                </a>
              </div>
            )}
            
            {latestEvent && (
              <div className="p-3 rounded-lg bg-stellar-brand/10 border border-stellar-brand/20">
                <span className="text-xs text-stellar-brand font-medium flex items-center gap-1 mb-1"><Activity size={12}/> Event Emitted</span>
                <div className="font-mono text-xs text-slate-300">
                  <span className="text-slate-400">Action:</span> DonationMade<br/>
                  <span className="text-slate-400">Amount:</span> {latestEvent.amount} XLM
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
