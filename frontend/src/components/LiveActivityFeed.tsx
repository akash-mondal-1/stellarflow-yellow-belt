import React, { useEffect, useState } from 'react';
import { useStellar, CONTRACT_ID } from '../hooks/useStellar';
import { useAppContext } from '../contexts/AppContext';
import { ArrowRight, Activity } from 'lucide-react';

interface Event {
  id: string;
  donor: string;
  amount: number;
  time: Date;
}

export const LiveActivityFeed: React.FC = () => {
  const { server } = useStellar();
  const { latestEvent } = useAppContext();
  const [events, setEvents] = useState<Event[]>([]);

  // Automatically prepend global new events
  useEffect(() => {
    if (latestEvent) {
      setEvents(prev => [latestEvent, ...prev].slice(0, 10)); // Keep top 10
    }
  }, [latestEvent]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const fetchEvents = async () => {
      try {
        if (!CONTRACT_ID) {
          timeoutId = setTimeout(fetchEvents, 10000);
          return;
        }

        const latest = await server.getLatestLedger();
        const startLedger = Math.max(1, latest.sequence - 100);

        const response = await server.getEvents({
          startLedger,
          filters: [
            {
              type: "contract",
              contractIds: [CONTRACT_ID],
              topics: [["*", "*"]]
            }
          ]
        });

        if (response.events && response.events.length > 0) {
          const parsed = response.events.map((ev: any) => ({
            id: `${ev.id}-${ev.ledger}-${ev.ledgerClosedAt}`,
            donor: "G...TEST", // In production, we decode ev.topic[1] scVal
            amount: 100, // In production, we decode ev.value scVal
            time: new Date(ev.ledgerClosedAt)
          }));
          setEvents(parsed);
        }
      } catch (e) {
        console.error("Failed to fetch events", e);
      }
      timeoutId = setTimeout(fetchEvents, 10000);
    };

    fetchEvents();

    return () => clearTimeout(timeoutId);
  }, [server, events.length]);

  return (
    <div className="glass-card animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both w-full max-w-4xl mx-auto mt-8">
      <div className="flex items-center gap-2 mb-6 text-white border-b border-white/10 pb-4">
        <Activity size={20} className="text-stellar-accent animate-pulse" />
        <h3 className="text-xl font-semibold tracking-tight">Live Activity</h3>
      </div>
      
      <div className="space-y-3">
        {events.map(ev => (
          <div key={ev.id} className="bg-slate-800/40 hover:bg-slate-800/60 transition-colors rounded-lg p-4 flex items-center justify-between border border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-stellar-brand to-stellar-accent flex items-center justify-center text-white font-medium shadow-lg">
                {ev.donor.substring(1, 3)}
              </div>
              <div>
                <p className="text-white font-medium text-sm flex items-center gap-2">
                  {ev.donor} <ArrowRight size={14} className="text-slate-500" /> Campaign
                </p>
                <p className="text-slate-400 text-xs mt-0.5">{ev.time.toLocaleTimeString()}</p>
              </div>
            </div>
            <div className="text-stellar-accent font-semibold bg-stellar-accent/10 px-3 py-1 rounded-full text-sm">
              +{ev.amount} XLM
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
