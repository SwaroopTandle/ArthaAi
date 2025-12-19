
import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, BarChart3, Clock, History, IndianRupee, TrendingUp, Info, Zap, RefreshCcw } from 'lucide-react';
import { analyzeIndianStock, fetchRealTimePrice, isIndianMarketOpen } from './services/geminiService';
import { StockAnalysis, SearchHistoryItem } from './types';
import { AnalysisReport } from './components/AnalysisReport';

const popularSymbols = ["RELIANCE", "TCS", "HDFCBANK", "INFY", "ZOMATO", "TATASTEEL", "ADANIENT", "ITC"];

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<StockAnalysis | null>(null);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Real-time price states
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [livePriceChange, setLivePriceChange] = useState<number | null>(null);
  const [isRefreshingPrice, setIsRefreshingPrice] = useState(false);
  
  // Ref to track the polling timeout ID
  const pollingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('artha_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  /**
   * Dynamic Polling Logic:
   * - Market Open: 30s interval
   * - Market Closed: 15min interval (to save resources)
   */
  useEffect(() => {
    if (!analysis) {
      setLivePrice(null);
      setLivePriceChange(null);
      if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
      return;
    }

    setLivePrice(analysis.currentPrice);
    
    const runPolling = async () => {
      const marketOpen = isIndianMarketOpen();
      const interval = marketOpen ? 30000 : 900000; // 30s vs 15min

      setIsRefreshingPrice(true);
      try {
        const update = await fetchRealTimePrice(analysis.symbol);
        if (update && update.price > 0) {
          setLivePrice(update.price);
          setLivePriceChange(update.change);
        }
      } catch (err) {
        console.warn("Dynamic price update failed", err);
      } finally {
        setIsRefreshingPrice(false);
        // Schedule next update
        pollingTimeoutRef.current = setTimeout(runPolling, interval);
      }
    };

    // Trigger first dynamic poll immediately if it was from a fresh search
    // But since handleSearch already sets the initial price, we just schedule the next one
    pollingTimeoutRef.current = setTimeout(runPolling, isIndianMarketOpen() ? 30000 : 900000);

    return () => {
      if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
    };
  }, [analysis]);

  const handleSearch = async (symbol: string) => {
    if (!symbol) return;
    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);
    setLivePrice(null); 

    try {
      const result = await analyzeIndianStock(symbol);
      setAnalysis(result);
      setLivePrice(result.currentPrice);
      
      const newItem: SearchHistoryItem = {
        symbol: result.symbol,
        companyName: result.companyName,
        timestamp: Date.now(),
        action: result.action
      };

      const updatedHistory = [newItem, ...history.filter(h => h.symbol !== result.symbol)].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem('artha_history', JSON.stringify(updatedHistory));
    } catch (err) {
      setError("Analysis failed. This might be due to market volatility or invalid ticker. Please try again.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-card border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]">
              <IndianRupee size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white leading-none">ArthaAI</h1>
              <span className="text-[10px] text-blue-400 uppercase tracking-widest font-bold">Research Terminal</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <div className={`flex items-center gap-2 px-3 py-1 border rounded-full transition-colors ${
              isIndianMarketOpen() ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isIndianMarketOpen() ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">
                {isIndianMarketOpen() ? 'Market Open' : 'Market Closed'}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
              <Zap size={12} className="text-blue-400 fill-blue-400" />
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">Fast AI Active</span>
            </div>
            <a href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Markets</a>
            <div className="w-px h-6 bg-slate-800" />
            <button className="text-sm font-semibold text-blue-400 hover:text-blue-300">Sign In</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-12">
        {/* Hero & Search */}
        {!analysis && !isAnalyzing && (
          <div className="max-w-3xl mx-auto text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-1000">
            <h2 className="text-5xl font-extrabold text-white mb-6 leading-tight">
              Indian Equity Research <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Fast-Lite Intelligence</span>
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
              Real-time fundamental and technical analysis for NSE & BSE stocks. 
              Powered by <span className="text-blue-400 font-semibold">Gemini Flash Lite</span> with resilient auto-refresh.
            </p>

            <div className="relative group max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Search symbol (e.g. RELIANCE, TCS, ZOMATO)..."
                className="w-full h-16 bg-slate-800 border-2 border-slate-700 rounded-2xl px-14 text-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all shadow-2xl group-hover:border-slate-600"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400" size={24} />
              <button 
                onClick={() => handleSearch(query)}
                disabled={!query}
                className="absolute right-3 top-3 bottom-3 px-6 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-xl font-bold transition-all flex items-center gap-2"
              >
                <Zap size={18} />
                Analyze
              </button>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-2">
              <span className="text-slate-500 text-xs font-bold uppercase py-2">Trending:</span>
              {popularSymbols.map(sym => (
                <button 
                  key={sym} 
                  onClick={() => handleSearch(sym)}
                  className="px-4 py-2 rounded-full glass-card text-xs font-medium text-slate-300 hover:border-blue-500/50 hover:text-white transition-all"
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="relative">
              <Loader2 className="animate-spin text-blue-500 mb-6" size={64} />
              <div className="absolute inset-0 animate-ping rounded-full border-4 border-blue-500 opacity-20" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight flex items-center gap-2">
              <Zap className="text-blue-400 fill-blue-400" size={24} />
              Fast-Lite Analysis in Progress
            </h3>
            <p className="text-slate-400 animate-pulse">Evaluating technical triggers and syncing NSE data streams...</p>
            <div className="mt-8 flex gap-4">
               <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-lg text-[10px] text-slate-500 font-mono">
                  <CheckCircle size={12} className="text-emerald-500" /> SYNCING_EXCHANGE_DATA
               </div>
               <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-lg text-[10px] text-slate-500 font-mono">
                  <CheckCircle size={12} className="text-emerald-500" /> RESILIENT_FETCH_ACTIVE
               </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-md mx-auto p-6 bg-rose-900/20 border border-rose-500/30 rounded-2xl text-center mb-8">
            <Info className="text-rose-500 mx-auto mb-4" size={32} />
            <p className="text-rose-200 font-medium">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-4 text-sm text-slate-400 underline hover:text-white"
            >
              Clear error
            </button>
          </div>
        )}

        {/* Analysis View */}
        {analysis && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => { setAnalysis(null); setQuery(''); }}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
              >
                <div className="p-1 rounded bg-slate-800 group-hover:bg-slate-700 transition-colors">
                  <Search size={14} />
                </div>
                New Search
              </button>
              
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 px-3 py-1.5 glass-card rounded-full border border-blue-500/30">
                   <div className={`w-2 h-2 rounded-full ${isRefreshingPrice ? 'bg-blue-400 animate-pulse' : (isIndianMarketOpen() ? 'bg-emerald-400' : 'bg-slate-500')} `} />
                   <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                     {isRefreshingPrice ? 'Updating Price...' : (isIndianMarketOpen() ? 'Live Updates Active' : 'Market Closed')}
                   </span>
                 </div>
                 {livePrice !== null && (
                   <div className="flex items-center gap-2">
                     <span className="text-xs text-slate-500 font-medium">LTP:</span>
                     <span className="text-lg font-bold text-white transition-all duration-500 tabular-nums">₹{livePrice.toLocaleString('en-IN')}</span>
                     {livePriceChange !== null && (
                       <span className={`text-xs font-bold ${livePriceChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                         {livePriceChange >= 0 ? '▲' : '▼'}{Math.abs(livePriceChange)}%
                       </span>
                     )}
                   </div>
                 )}
              </div>
            </div>
            
            <AnalysisReport analysis={{...analysis, currentPrice: livePrice || analysis.currentPrice}} />
          </div>
        )}

        {/* History Grid */}
        {!analysis && !isAnalyzing && history.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <History className="text-slate-500" size={20} />
                Recent Research
              </h3>
              <button 
                onClick={() => { setHistory([]); localStorage.removeItem('artha_history'); }}
                className="text-xs font-bold text-slate-500 hover:text-rose-400 transition-colors uppercase tracking-widest"
              >
                Clear History
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {history.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSearch(item.symbol)}
                  className="p-5 rounded-xl glass-card text-left hover:border-blue-500/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded">{item.symbol}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      item.action === 'BUY' ? 'text-emerald-400 border-emerald-400/20' : 
                      item.action === 'HOLD' ? 'text-amber-400 border-amber-400/20' : 
                      'text-rose-400 border-rose-400/20'
                    }`}>
                      {item.action}
                    </span>
                  </div>
                  <h4 className="font-bold text-white mb-1 group-hover:text-blue-400 transition-colors line-clamp-1">{item.companyName}</h4>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock size={10} /> {new Date(item.timestamp).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer Disclaimer */}
      <footer className="fixed bottom-0 left-0 right-0 py-4 glass-card border-t border-slate-800 z-40 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
             <p className="text-[11px] text-slate-400">
               <span className="text-blue-400 font-bold">Resilient Model:</span> Gemini Flash Lite with exponential backoff retries.
             </p>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCcw size={12} className={`text-emerald-500 ${isRefreshingPrice ? 'animate-spin' : ''}`} />
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              Dynamic Polling Logic: {isIndianMarketOpen() ? '30s (Market Open)' : '15min (Market Closed)'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const CheckCircle: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export default App;
