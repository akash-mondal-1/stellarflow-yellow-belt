import { WalletProvider } from './contexts/WalletContext';
import { AppProvider } from './contexts/AppContext';
import { WalletModal } from './components/WalletModal';
import { Navbar } from './components/Navbar';
import { CampaignDashboard } from './components/CampaignDashboard';
import { LiveActivityFeed } from './components/LiveActivityFeed';
import { ReviewerDashboard } from './components/ReviewerDashboard';
import { Toaster } from 'sonner';

function App() {
  return (
    <WalletProvider>
      <AppProvider>
        <div className="min-h-screen bg-slate-900 relative selection:bg-stellar-brand/30 text-slate-100 font-sans">
        {/* Dynamic Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-stellar-brand/20 blur-[120px] mix-blend-screen animate-blob" />
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-stellar-accent/20 blur-[120px] mix-blend-screen animate-blob" style={{ animationDelay: '2s' }} />
          <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] mix-blend-screen animate-blob" style={{ animationDelay: '4s' }} />
        </div>

        <Navbar />
        
        <main className="max-w-6xl mx-auto px-4 py-8 relative z-10">
          <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="inline-flex px-4 py-1.5 rounded-full border border-stellar-accent/30 bg-stellar-accent/10 text-stellar-accent text-sm font-semibold mb-6 shadow-[0_0_15px_rgba(0,209,255,0.2)]">
              Stellar Testnet
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight pb-2">
              Decentralized Crowdfunding
            </h1>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto font-medium">
              Empower builders. Fund the future. Built on Soroban Smart Contracts.
            </p>
          </div>

          <CampaignDashboard />
          <ReviewerDashboard />
          <LiveActivityFeed />
        </main>

        <WalletModal />
          <Toaster theme="dark" position="bottom-right" toastOptions={{ style: { background: '#0e1c2e', borderColor: 'rgba(255,255,255,0.1)' } }} />
        </div>
      </AppProvider>
    </WalletProvider>
  );
}

export default App;
