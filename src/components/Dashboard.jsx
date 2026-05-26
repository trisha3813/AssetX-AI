import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  Briefcase,
  Eye,
  Cpu,
  ShieldAlert,
  Newspaper,
  Search,
  Bell,
  Plus,
  Trash2,
  LogOut,
  TrendingDown,
  Activity,
  DollarSign,
  AlertCircle,
  Globe,
  Check,
  CheckCircle2,
  MessageSquare,
  User,
  ChevronDown,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import {
  marketOverview,
  portfolioData,
  aiRecommendations,
  riskMetrics,
  newsSentiment,
  initialWatchlist
} from '../mockData';
import FinanceChatbot from './FinanceChatbot';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMarketData } from '../hooks/useMarketData';
import { useWatchlistStore } from '../hooks/useWatchlistStore';
import { useNewsSentiment } from '../hooks/useNewsSentiment';
import { calculateVolatility, deriveQuantitativeMetrics } from '../utils/financeMath';

const queryClient = new QueryClient();

// High-Fidelity Tailwind Card Loading Skeleton
function CardSkeleton() {
  return (
    <div className="glass-card p-6 rounded-2xl animate-pulse flex flex-col justify-between h-36 border border-white/5">
      <div className="flex justify-between items-start">
        <div className="h-3 w-28 bg-slate-800/80 rounded-full" />
        <div className="w-7 h-7 bg-slate-800/80 rounded-lg" />
      </div>
      <div className="mt-4 space-y-2.5 text-left">
        <div className="h-6 w-24 bg-slate-800/80 rounded-full" />
        <div className="h-3 w-32 bg-slate-800/50 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
      </div>
    </div>
  );
}

// High-Fidelity Tailwind Chart Loading Skeleton
function ChartSkeleton() {
  return (
    <div className="glass-card p-6 rounded-2xl animate-pulse h-[375px] flex flex-col justify-between border border-white/5 lg:col-span-2">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/5 pb-4 mb-4 text-left">
        <div className="space-y-2">
          <div className="h-4.5 w-48 bg-slate-800/80 rounded-full" />
          <div className="h-3.5 w-72 bg-slate-800/50 rounded-full" />
        </div>
        <div className="w-40 h-8 bg-slate-800/80 rounded-lg shrink-0" />
      </div>
      <div className="flex-1 bg-slate-800/10 border border-white/5 border-dashed rounded-xl flex items-center justify-center">
        <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase animate-pulse">Initializing Data Stream...</div>
      </div>
    </div>
  );
}

function DashboardContent({ currentUser, onUpdateUser, onLogout }) {
  // Navigation State
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Search & Filtration States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStockTicker, setSelectedStockTicker] = useState('AAPL');
  const [timeframe, setTimeframe] = useState('1M');

  // Zustand persistent watchlist store
  const { watchlist, toggleAsset, setWatchlist } = useWatchlistStore();

  // Settings Toggles
  const [riskThreshold, setRiskThreshold] = useState(70);
  const [realtimeUpdates, setRealtimeUpdates] = useState(true);
  const [aiAnalysisDepth, setAiAnalysisDepth] = useState('Premium-LLM');

  // TanStack Query & Live RSS News Hooks
  const { marketData, isLoading: marketLoading, lastUpdated: marketLastUpdated } = useMarketData();
  const { news: newsSentimentList, isLoading: newsLoading } = useNewsSentiment();

  // Dynamic User Initials Memo
  const userInitials = useMemo(() => {
    if (!currentUser?.name) return 'UI';
    return currentUser.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [currentUser]);

  const lastSyncedWatchlistRef = useRef([]);

  // Sync state between Zustand and core parent App user session
  useEffect(() => {
    if (currentUser?.watchlist) {
      setWatchlist(currentUser.watchlist);
      lastSyncedWatchlistRef.current = currentUser.watchlist;
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const isDifferentFromLastSynced =
      watchlist.length !== lastSyncedWatchlistRef.current.length ||
      watchlist.some((t, i) => t !== lastSyncedWatchlistRef.current[i]);
    if (isDifferentFromLastSynced) {
      lastSyncedWatchlistRef.current = watchlist;
      onUpdateUser({
        ...currentUser,
        watchlist: watchlist
      });
    }
  }, [watchlist, currentUser, onUpdateUser]);

  // Map dynamic live prices from cached/live TanStack Query hook outputs
  const livePrices = useMemo(() => {
    const prices = {};
    marketData.forEach((asset) => {
      prices[asset.ticker] = {
        price: asset.price,
        change: asset.change,
        changePercent: asset.changePercent,
        volume: asset.volume,
        history: asset.history,
        dayHigh: asset.dayHigh,
        dayLow: asset.dayLow
      };
    });
    return prices;
  }, [marketData]);

  // Retrieve current active stock details
  const activeStock = useMemo(() => {
    return marketOverview.find(s => s.ticker === selectedStockTicker) || marketOverview[0];
  }, [selectedStockTicker]);

  // Live active stock metadata price block
  const activeStockLiveData = useMemo(() => {
    return livePrices[selectedStockTicker] || livePrices['AAPL'] || {
      price: 180,
      change: 0,
      changePercent: 0,
      dayHigh: 182,
      dayLow: 178,
      history: activeStock.history
    };
  }, [selectedStockTicker, livePrices, activeStock]);

  // Calculate dynamic recommendations based on Wilder's RSI smoothing and moving averages
  const dynamicRecommendations = useMemo(() => {
    return aiRecommendations.map(rec => {
      const liveStock = livePrices[rec.ticker];
      if (!liveStock) return rec;

      const history1D = liveStock.history?.["1D"] || [];
      const closes = history1D.map(h => h.value);
      
      const metrics = deriveQuantitativeMetrics(closes, liveStock.price);
      
      // Calculate dynamic mathematical targets
      const targetPrice = metrics.action.includes("BUY") 
        ? liveStock.price * 1.12
        : metrics.action.includes("SELL")
        ? liveStock.price * 0.90
        : liveStock.price * 1.02;

      const expectedGainPercent = ((targetPrice - liveStock.price) / liveStock.price) * 100;
      const expectedGain = `${expectedGainPercent >= 0 ? '+' : ''}${expectedGainPercent.toFixed(1)}%`;

      return {
        ...rec,
        action: metrics.action,
        confidence: metrics.confidence,
        reason: metrics.rationale,
        targetPrice: parseFloat(targetPrice.toFixed(2)),
        expectedGain
      };
    });
  }, [livePrices]);

  // Bind AI confidence indicators dynamically to selected focus stock
  const activeRec = useMemo(() => {
    return dynamicRecommendations.find(r => r.ticker === selectedStockTicker) || dynamicRecommendations[0];
  }, [selectedStockTicker, dynamicRecommendations]);

  // Calculate real historical volatility for risk assessment panel
  const activeVolatility = useMemo(() => {
    const liveStock = livePrices[selectedStockTicker];
    if (!liveStock) return 18.2;
    const history1D = liveStock.history?.["1D"] || [];
    const closes = history1D.map(h => h.value);
    const vol = calculateVolatility(closes);
    return vol > 0 ? vol : 19.4; // Fallback to standard
  }, [selectedStockTicker, livePrices]);

  // Derived quantitative Sharpe & VaR scores for selected asset
  const activeRiskMetrics = useMemo(() => {
    const sharpe = parseFloat(((12.5 - 4.5) / (activeVolatility / 3)).toFixed(2));
    const var95 = parseFloat((1.65 * (activeVolatility / 10) / Math.sqrt(252) * 100).toFixed(2));
    return {
      sharpe: sharpe > 0 ? sharpe : 1.84,
      var95: var95 > 0 ? var95 : 3.82
    };
  }, [activeVolatility]);

  // Handle Search Filtering
  const filteredStocks = useMemo(() => {
    if (!searchTerm.trim()) return marketOverview;
    return marketOverview.filter(s =>
      s.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Market Analytics', icon: TrendingUp },
    { name: 'Portfolio', icon: Briefcase },
    { name: 'Watchlist', icon: Eye },
    { name: 'AI Recommendations', icon: Cpu },
    { name: 'AI Chatbot', icon: MessageSquare },
    { name: 'Risk Analysis', icon: ShieldAlert },
    { name: 'News Sentiment', icon: Newspaper }
  ];

  const toggleWatchlist = (ticker) => {
    toggleAsset(ticker);
  };

  return (
    <div className="flex h-screen w-screen bg-dark-bg text-slate-100 font-sans overflow-hidden">
      
      {/* 1. Left Fixed Sidebar */}
      <aside className="w-72 h-full flex flex-col justify-between shrink-0 glass-sidebar relative z-30">
        <div>
          {/* Logo Brand Area */}
          <div className="h-20 flex items-center gap-3 px-8 border-b border-white/5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <span className="font-extrabold text-base tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">AssetX</span>
              <span className="text-[10px] text-emerald-400 block font-semibold tracking-widest uppercase">FINTECH LABS</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 mt-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative group ${
                    isActive
                      ? 'text-emerald-400 bg-emerald-500/5 border border-emerald-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeGlow"
                      className="absolute left-0 w-1 h-6 rounded-r bg-emerald-400"
                    />
                  )}
                  <Icon className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Brand Stamp */}
        <div className="p-6 border-t border-white/5 text-center shrink-0">
          <p className="text-[9px] text-slate-600 font-semibold tracking-widest uppercase">
            © 2026 AssetX Tech
          </p>
          <p className="text-[8px] text-slate-700 mt-1 font-mono">v3.4.2-alpha</p>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className="flex-1 h-full flex flex-col overflow-hidden relative">
        
        {/* 2. Top Navbar */}
        <header className="h-20 w-full flex items-center justify-between px-8 border-b border-white/5 glass-navbar relative z-20 shrink-0">
          <div className="text-left">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-200">
              AI Investment Analytics Dashboard
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Track stocks, analyze trends, and make smarter investment decisions.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search stocks by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900/60 border border-white/5 rounded-full text-xs placeholder:text-slate-500 text-slate-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all text-left"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 hover:text-slate-300"
                >
                  Clear
                </button>
              )}
            </div>

            <button className="p-2 rounded-full hover:bg-white/5 border border-white/5 text-slate-400 hover:text-slate-200 transition-colors relative shrink-0">
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/50" />
              <Bell className="w-4 h-4" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl hover:bg-white/5 border border-white/5 transition-colors duration-200"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-300 font-bold text-xs shrink-0">
                  {userInitials}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-slate-200 leading-none">{currentUser?.name || 'Quantum Investor'}</p>
                  <p className="text-[9px] text-slate-500 mt-0.5 leading-none">{currentUser?.email || 'analyst@assetx.ai'}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-44 rounded-xl bg-[#0f0f12] border border-white/10 p-1.5 shadow-2xl z-50 text-slate-200"
                    >
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setProfileModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition duration-200 text-left"
                      >
                        <User className="w-3.5 h-3.5 text-slate-400 animate-pulse" />
                        Profile
                      </button>
                      <div className="h-px bg-white/5 my-1" />
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition duration-200 text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Logout
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* 3. Central Application View */}
        <main className={`flex-1 relative z-10 ${activeTab === 'AI Chatbot' ? 'overflow-hidden p-0 h-[calc(100vh-80px)] flex flex-col' : 'overflow-y-scroll p-8'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className={activeTab === 'AI Chatbot' ? 'flex-grow flex flex-col h-full w-full' : 'space-y-6'}
            >
              
              {/* Tab: Dashboard Overview */}
              {activeTab === 'Dashboard' && (
                <>
                  {/* Top Stats Row */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {marketLoading ? (
                      <>
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                      </>
                    ) : (
                      <>
                        {/* Portfolio Balance Card */}
                        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group border border-white/5">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-all" />
                          <div className="flex justify-between items-start">
                            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">PORTFOLIO BALANCE</span>
                            <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                              <Briefcase className="w-3.5 h-3.5" />
                            </span>
                          </div>
                          <div className="mt-4 text-left">
                            <h3 className="text-2xl font-extrabold text-white font-mono">
                              ${portfolioData.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </h3>
                            <p className="text-xs font-semibold text-emerald-400 mt-1 flex items-center gap-1">
                              <TrendingUp className="w-3.5 h-3.5" />
                              {portfolioData.dayGainPercent}% (+${portfolioData.dayGain.toLocaleString()}) Today
                            </p>
                          </div>
                        </div>

                        {/* Active Stock Ticker Card */}
                        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group border border-white/5">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/10 transition-all" />
                          <div className="flex justify-between items-start">
                            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">ACTIVE STOCK TICKER</span>
                            <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400 font-mono">
                              {activeStock.ticker}
                            </span>
                          </div>
                          <div className="mt-4 text-left">
                            <h3 className="text-2xl font-extrabold text-white font-mono">
                              ${activeStockLiveData.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </h3>
                            <p className={`text-xs font-semibold mt-1 flex items-center gap-1 ${activeStockLiveData.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {activeStockLiveData.change >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                              {activeStockLiveData.changePercent}% (${activeStockLiveData.change > 0 ? '+' : ''}{activeStockLiveData.change})
                            </p>
                          </div>
                        </div>

                        {/* AI Confidence Indicator */}
                        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group border border-white/5">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/10 transition-all" />
                          <div className="flex justify-between items-start">
                            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">AI RECOMMENDER INDEX</span>
                            <span className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                              <Cpu className="w-3.5 h-3.5" />
                            </span>
                          </div>
                          <div className="mt-4 text-left">
                            <h3 className="text-2.5xl font-extrabold text-white font-mono">{activeRec.action}</h3>
                            <p className="text-xs text-purple-300 mt-1">
                              {activeStock.ticker} confidence at <span className="font-bold text-white">{activeRec.confidence}%</span>
                            </p>
                          </div>
                        </div>

                        {/* Risk Telemetry Metric Card */}
                        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group border border-white/5">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition-all" />
                          <div className="flex justify-between items-start">
                            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">ANNUALIZED VOLATILITY</span>
                            <span className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                              <ShieldAlert className="w-3.5 h-3.5" />
                            </span>
                          </div>
                          <div className="mt-4 text-left">
                            <h3 className="text-2xl font-extrabold text-white font-mono">{activeVolatility.toFixed(1)}% Vol</h3>
                            <p className="text-[10px] text-amber-300 mt-1.5 truncate">
                              Hi: <span className="font-bold text-white">${activeStockLiveData.dayHigh}</span> | Lo: <span className="font-bold text-white">${activeStockLiveData.dayLow}</span>
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Primary Chart Block & Mini-Stock List */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {marketLoading ? (
                      <ChartSkeleton />
                    ) : (
                      /* Big Interactive Chart Card */
                      <div className="glass-card p-6 rounded-2xl lg:col-span-2 flex flex-col justify-between border border-white/5">
                        <div>
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/5 pb-4 mb-4 text-left">
                            <div>
                              <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold text-slate-200">
                                  {activeStock.name} Historical Analytics
                                </h2>
                                <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 font-mono uppercase">
                                  LIVE
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5">
                                Dynamic area mapping over key fiscal milestones.
                              </p>
                            </div>

                            {/* Timeframe Selector */}
                            <div className="flex rounded-lg bg-slate-900 border border-white/5 p-1 shrink-0">
                              {['1D', '1W', '1M', '3M', '1Y'].map((tf) => (
                                <button
                                  key={tf}
                                  onClick={() => setTimeframe(tf)}
                                  className={`px-3 py-1 rounded text-xs font-semibold tracking-wider transition-all ${
                                    timeframe === tf
                                      ? 'bg-emerald-500 text-black font-bold shadow shadow-emerald-500/30'
                                      : 'text-slate-400 hover:text-slate-200'
                                  }`}
                                >
                                  {tf}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Recharts Area Chart */}
                        <div className="h-72 w-full mt-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={activeStockLiveData.history[timeframe] || activeStockLiveData.history['1M']}>
                              <defs>
                                <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                              <YAxis
                                stroke="#475569"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                domain={['auto', 'auto']}
                                tickFormatter={(val) => `$${val}`}
                              />
                              <Tooltip
                                formatter={(value) => [`$${value.toLocaleString()}`, 'Price']}
                                contentStyle={{
                                  backgroundColor: 'rgba(15, 15, 18, 0.95)',
                                  borderColor: 'rgba(16, 185, 129, 0.3)',
                                  borderRadius: '12px',
                                  color: '#e2e8f0',
                                  fontSize: '12px'
                                }}
                              />
                              <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#10b981"
                                strokeWidth={2.5}
                                fillOpacity={1}
                                fill="url(#emeraldGradient)"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* Stock Quick List and Tracker */}
                    <div className="glass-card p-6 rounded-2xl flex flex-col h-full border border-white/5">
                      <div className="border-b border-white/5 pb-4 mb-4 flex justify-between items-center text-left">
                        <div>
                          <h2 className="text-base font-bold text-slate-200">Asset Quick Tracker</h2>
                          <p className="text-xs text-slate-400 mt-0.5">Focus historical charts.</p>
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono shrink-0">
                          Refreshed: {marketLastUpdated.toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="flex-grow overflow-y-auto space-y-2.5 max-h-72 pr-1 custom-scrollbar text-left">
                        {filteredStocks.map((stock) => {
                          const isSelected = selectedStockTicker === stock.ticker;
                          const liveStock = livePrices[stock.ticker] || stock;
                          const isUp = liveStock.change >= 0;
                          return (
                            <div
                              key={stock.ticker}
                              onClick={() => setSelectedStockTicker(stock.ticker)}
                              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-200 ${
                                isSelected
                                  ? 'bg-emerald-500/10 border-emerald-500/30'
                                  : 'bg-slate-900/40 border-white/5 hover:bg-slate-900/80 hover:border-white/10'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${
                                  isSelected ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-300'
                                }`}>
                                  {stock.ticker.slice(0, 3)}
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-slate-200">{stock.ticker}</h4>
                                  <p className="text-[10px] text-slate-500 truncate max-w-24">{stock.name}</p>
                                </div>
                              </div>

                              <div className="text-right">
                                <p className="text-xs font-bold text-slate-200 font-mono">${liveStock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                <span className={`text-[10px] font-bold font-mono inline-flex items-center gap-0.5 ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {isUp ? '+' : ''}{liveStock.changePercent}%
                                </span>
                              </div>
                            </div>
                          );
                        })}

                        {filteredStocks.length === 0 && (
                          <div className="py-8 text-center text-xs text-slate-500">
                            No stocks match search query.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Portfolio Weighting & AI Signal Alerts */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Portfolio Asset Allocations */}
                    <div className="glass-card p-6 rounded-2xl flex flex-col justify-between border border-white/5">
                      <div className="border-b border-white/5 pb-4 mb-4 text-left">
                        <h2 className="text-base font-bold text-slate-200">Asset Class Allocation</h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Weighted breakdown of all systemic assets.
                        </p>
                      </div>

                      <div className="flex items-center justify-center py-2 h-44 relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={portfolioData.allocation}
                              cx="50%"
                              cy="50%"
                              innerRadius={55}
                              outerRadius={70}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {portfolioData.allocation.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value) => [`${value}%`, 'Weight']}
                              contentStyle={{
                                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                borderColor: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                color: '#e2e8f0'
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>

                        {/* Centered Balance Summary */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">STOCKS</span>
                          <span className="text-lg font-bold font-mono text-white">65% Weight</span>
                        </div>
                      </div>

                      {/* Legends */}
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {portfolioData.allocation.map((entry) => (
                          <div key={entry.name} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/50 border border-white/5 text-left">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                            <div className="overflow-hidden">
                              <p className="text-[10px] font-bold text-slate-300 truncate">{entry.name}</p>
                              <p className="text-[9px] text-slate-500 font-mono font-bold">{entry.value}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Recommendation Stream */}
                    <div className="glass-card p-6 rounded-2xl lg:col-span-2 flex flex-col border border-white/5">
                      <div className="border-b border-white/5 pb-4 mb-4 flex justify-between items-center text-left">
                        <div>
                          <h2 className="text-base font-bold text-slate-200">AI Recommender Trade Signals</h2>
                          <p className="text-xs text-slate-400 mt-0.5">
                            High-confidence technical overlays and Wilder indicators.
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-400 font-bold font-mono">
                          ASSETX_v3
                        </span>
                      </div>

                      <div className="flex-grow overflow-y-auto space-y-3 pr-1 max-h-72 custom-scrollbar text-left">
                        {dynamicRecommendations.slice(0, 3).map((rec) => {
                          const isStrong = rec.action.includes("STRONG");
                          const isBuy = rec.action.includes("BUY");
                          return (
                            <div key={rec.ticker} className="p-4 rounded-xl bg-slate-900/40 border border-white/5 flex flex-col md:flex-row justify-between gap-4">
                              <div className="space-y-1 md:max-w-md">
                                <div className="flex items-center gap-2.5">
                                  <span className="font-extrabold text-sm text-white font-mono">{rec.ticker}</span>
                                  <span className="text-slate-500 text-xs font-medium">| {rec.name}</span>
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold font-mono tracking-wider inline-block ${
                                    isStrong 
                                      ? (isBuy ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400') 
                                      : (isBuy ? 'bg-emerald-500/5 border border-emerald-500/15 text-emerald-400' : 'bg-amber-500/10 border border-amber-500/20 text-amber-400')
                                  }`}>
                                    {rec.action}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-1">
                                  {rec.reason}
                                </p>
                              </div>

                              <div className="flex md:flex-col justify-between md:justify-center items-end shrink-0 md:border-l border-white/5 md:pl-6 min-w-[120px]">
                                <div className="text-right">
                                  <span className="text-[10px] text-slate-500 block uppercase font-bold">CONFIDENCE</span>
                                  <span className="text-sm font-extrabold font-mono text-emerald-300">{rec.confidence}% Rating</span>
                                </div>
                                <div className="text-right md:mt-2">
                                  <span className="text-[10px] text-slate-500 block uppercase font-bold">EST. TARGET</span>
                                  <span className="text-sm font-extrabold font-mono text-emerald-400">{rec.expectedGain} (${rec.targetPrice})</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Small Compliance Stamp */}
                      <p className="text-[8px] text-slate-700 mt-3 text-center italic font-sans leading-relaxed">
                        ⚠️ Disclaimer: AssetX provides data-driven quantitative insights and algorithmic financial modeling. Environmental and market factors fluctuate rapidly; please verify market metrics independently before executing high-capital trades.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Tab: Market Analytics */}
              {activeTab === 'Market Analytics' && (
                <div className="space-y-6">
                  {/* Detailed Assets Grid */}
                  <div className="glass-card p-6 rounded-2xl border border-white/5">
                    <div className="border-b border-white/5 pb-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
                      <div>
                        <h2 className="text-base font-bold text-slate-200 flex items-center gap-3">
                          Global Financial Markets Grid
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-400 font-mono uppercase">
                            Live data as of {marketLastUpdated.toLocaleTimeString()}
                          </span>
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                          High-fidelity technical telemetry for active investment pools.
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedStockTicker('AAPL')}
                          className="px-3.5 py-1.5 rounded-lg border border-white/5 bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white transition"
                        >
                          Focus AAPL
                        </button>
                        <button
                          onClick={() => setSelectedStockTicker('BTC')}
                          className="px-3.5 py-1.5 rounded-lg border border-white/5 bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white transition"
                        >
                          Focus Bitcoin
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="py-3 px-4">Asset</th>
                            <th className="py-3 px-4">Price</th>
                            <th className="py-3 px-4">Change (%)</th>
                            <th className="py-3 px-4">Market Cap</th>
                            <th className="py-3 px-4">Volume (24H)</th>
                            <th className="py-3 px-4">P/E Ratio</th>
                            <th className="py-3 px-4">Div Yield</th>
                            <th className="py-3 px-4 text-center">Watchlist</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-medium">
                          {filteredStocks.map((stock) => {
                            const isWatched = watchlist.includes(stock.ticker);
                            const liveStock = livePrices[stock.ticker] || stock;
                            const isUp = liveStock.change >= 0;
                            return (
                              <tr key={stock.ticker} className="hover:bg-white/5 transition-colors">
                                <td className="py-3.5 px-4 flex items-center gap-3">
                                  <div className="w-7 h-7 rounded bg-slate-800 flex items-center justify-center font-bold font-mono text-[10px] text-slate-300">
                                    {stock.ticker}
                                  </div>
                                  <div className="text-left">
                                    <span className="font-extrabold text-slate-200 block">{stock.ticker}</span>
                                    <span className="text-[10px] text-slate-500 block">{stock.name}</span>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                                  ${liveStock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                                <td className={`py-3.5 px-4 font-mono font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {isUp ? '+' : ''}{liveStock.changePercent}%
                                </td>
                                <td className="py-3.5 px-4 text-slate-300 font-mono">{stock.marketCap}</td>
                                <td className="py-3.5 px-4 text-slate-300 font-mono">{liveStock.volume}</td>
                                <td className="py-3.5 px-4 text-slate-300 font-mono">{stock.peRatio}</td>
                                <td className="py-3.5 px-4 text-slate-300 font-mono">{stock.dividendYield}</td>
                                <td className="py-3.5 px-4 text-center">
                                  <button
                                    onClick={() => toggleWatchlist(stock.ticker)}
                                    className={`px-3 py-1 rounded-full text-[10px] font-bold border transition duration-150 ${
                                      isWatched
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400'
                                        : 'bg-slate-900 border-white/5 text-slate-400 hover:border-slate-300 hover:text-slate-200'
                                    }`}
                                  >
                                    {isWatched ? 'Tracked' : '+ Add'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Small Compliance Stamp */}
                    <p className="text-[8.5px] text-slate-700 mt-6 text-center italic font-sans leading-relaxed">
                      ⚠️ Disclaimer: AssetX provides data-driven quantitative insights and algorithmic financial modeling. Environmental and market factors fluctuate rapidly; please verify market metrics independently before executing high-capital trades.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab: Portfolio */}
              {activeTab === 'Portfolio' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Portfolio Asset Split */}
                    <div className="glass-card p-6 rounded-2xl flex flex-col justify-between border border-white/5">
                      <div className="border-b border-white/5 pb-4 mb-4 text-left">
                        <h2 className="text-base font-bold text-slate-200">Holdings Allocations</h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Visual weighting of all capital investments.
                        </p>
                      </div>

                      <div className="flex items-center justify-center h-44 py-2 relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={portfolioData.allocation}
                              cx="50%"
                              cy="50%"
                              innerRadius={55}
                              outerRadius={70}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {portfolioData.allocation.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value}%`, 'Weight']} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">NAV PORTFOLIO</span>
                          <span className="text-base font-extrabold font-mono text-white">$142,580</span>
                        </div>
                      </div>

                      <div className="space-y-2 mt-4 text-left">
                        {portfolioData.allocation.map((entry) => (
                          <div key={entry.name} className="flex justify-between items-center p-2 rounded-xl bg-slate-900/40 border border-white/5 text-xs font-semibold">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                              <span className="text-slate-300">{entry.name}</span>
                            </div>
                            <span className="font-mono text-slate-200">{entry.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Historical Asset Balance Progression */}
                    <div className="glass-card p-6 rounded-2xl lg:col-span-2 flex flex-col justify-between border border-white/5">
                      <div className="text-left">
                        <h2 className="text-base font-bold text-slate-200">Historical Portfolio Growth</h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Consolidated capital growth timeline tracking net asset value.
                        </p>
                      </div>

                      <div className="h-64 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={portfolioData.history}>
                            <defs>
                              <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis
                              stroke="#475569"
                              fontSize={10}
                              tickLine={false}
                              axisLine={false}
                              domain={['auto', 'auto']}
                              tickFormatter={(val) => `$${val/1000}k`}
                            />
                            <Tooltip
                              formatter={(value) => [`$${value.toLocaleString()}`, 'Balance']}
                              contentStyle={{
                                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                borderColor: 'rgba(16, 185, 129, 0.3)',
                                borderRadius: '12px'
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="balance"
                              stroke="#10b981"
                              strokeWidth={2.5}
                              fillOpacity={1}
                              fill="url(#emeraldGradient)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-[11px] font-medium text-emerald-300">
                            Portfolio is currently tracking <span className="font-extrabold text-white">36.5% Net Growth</span> over past 5 months.
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase shrink-0">Consolidated</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Watchlist */}
              {activeTab === 'Watchlist' && (
                <div className="glass-card p-6 rounded-2xl border border-white/5">
                  <div className="border-b border-white/5 pb-4 mb-6 text-left">
                    <h2 className="text-base font-bold text-slate-200">Tracked Market Watchlist</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Toggle, track, and monitor focus pool volatility limits.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {marketOverview.map((stock) => {
                      const isTracked = watchlist.includes(stock.ticker);
                      const liveStock = livePrices[stock.ticker] || stock;
                      const isUp = liveStock.change >= 0;
                      return (
                        <div
                          key={stock.ticker}
                          className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                            isTracked
                              ? 'bg-emerald-500/5 border-emerald-500/20 shadow-lg shadow-emerald-500/5'
                              : 'bg-slate-900/40 border-white/5 hover:border-white/10 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <div className="flex justify-between items-start text-left">
                            <div>
                              <span className="font-mono text-sm font-extrabold text-white block">{stock.ticker}</span>
                              <span className="text-[10px] text-slate-500 block truncate max-w-36">{stock.name}</span>
                            </div>
                            <button
                              onClick={() => toggleWatchlist(stock.ticker)}
                              className={`p-1.5 rounded-full border transition duration-150 ${
                                isTracked
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400'
                                  : 'bg-slate-900 border-white/5 text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              {isTracked ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          <div className="mt-8 flex justify-between items-end text-left">
                            <div>
                              <span className="text-[9px] text-slate-500 block uppercase font-bold">CURRENT PRICE</span>
                              <span className="text-base font-extrabold font-mono text-white">${liveStock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] text-slate-500 block uppercase font-bold">DAILY DELTA</span>
                              <span className={`text-xs font-extrabold font-mono inline-flex items-center gap-0.5 ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isUp ? '+' : ''}{liveStock.changePercent}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab: AI Recommendations */}
              {activeTab === 'AI Recommendations' && (
                <div className="space-y-6">
                  <div className="glass-card p-6 rounded-2xl border border-white/5">
                    <div className="border-b border-white/5 pb-4 mb-6 flex justify-between items-center text-left">
                      <div>
                        <h2 className="text-base font-bold text-slate-200">Neural Network Investment Models</h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Unbiased AI trade setups, entry ratings, and automated valuation models.
                        </p>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-bold font-mono">
                        MODELS_V4.2
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 text-left">
                      {dynamicRecommendations.map((rec) => {
                        const isBuy = rec.action.includes("BUY");
                        const isStrong = rec.action.includes("STRONG");
                        return (
                          <div key={rec.ticker} className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="space-y-2 md:max-w-2xl">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="font-extrabold text-base text-white font-mono">{rec.ticker}</span>
                                <span className="text-slate-500 text-xs font-semibold">| {rec.name}</span>
                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold font-mono tracking-wider inline-block ${
                                  isStrong
                                    ? (isBuy ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400')
                                    : (isBuy ? 'bg-emerald-500/5 border border-emerald-500/15 text-emerald-400' : 'bg-amber-500/10 border border-amber-500/20 text-amber-400')
                                }`}>
                                  {rec.action}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                {rec.reason}
                              </p>
                            </div>

                            <div className="flex md:flex-col justify-between items-end gap-2.5 shrink-0 md:border-l border-white/5 md:pl-8 min-w-[160px] w-full md:w-auto">
                              <div className="text-right">
                                <span className="text-[10px] text-slate-500 block uppercase font-bold">MODEL CONFIDENCE</span>
                                <div className="flex items-center gap-2 justify-end mt-0.5">
                                  <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${rec.confidence}%` }} />
                                  </div>
                                  <span className="text-xs font-bold text-slate-200 font-mono">{rec.confidence}%</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-slate-500 block uppercase font-bold">TARGET DELTA</span>
                                <span className="text-xs font-bold font-mono text-emerald-400">{rec.expectedGain} (${rec.targetPrice})</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Small Compliance Stamp */}
                    <p className="text-[8.5px] text-slate-700 mt-6 text-center italic font-sans leading-relaxed">
                      ⚠️ Disclaimer: AssetX provides data-driven quantitative insights and algorithmic financial modeling. Environmental and market factors fluctuate rapidly; please verify market metrics independently before executing high-capital trades.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab: Risk Analysis */}
              {activeTab === 'Risk Analysis' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Volatility Metrics */}
                  <div className="glass-card p-6 rounded-2xl space-y-6 border border-white/5">
                    <div className="border-b border-white/5 pb-4 text-left">
                      <h2 className="text-base font-bold text-slate-200">
                        {activeStock.ticker} Risk Telemetry
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Mathematical exposure bounds of nested positions.
                      </p>
                    </div>

                    <div className="space-y-4 text-left">
                      <div>
                        <div className="flex justify-between items-center text-xs font-bold mb-1">
                          <span className="text-slate-400">ANNUALIZED VOLATILITY</span>
                          <span className="text-amber-400 font-mono">{activeVolatility.toFixed(2)}% Vol</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${Math.min(100, activeVolatility * 2.5)}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center text-xs font-bold mb-1">
                          <span className="text-slate-400">SHARPE RATIO (DYNAMIC)</span>
                          <span className="text-emerald-400 font-mono">{activeRiskMetrics.sharpe} (Optimal)</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${Math.min(100, activeRiskMetrics.sharpe * 30)}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center text-xs font-bold mb-1">
                          <span className="text-slate-400">VALUE AT RISK (VaR 95%)</span>
                          <span className="text-amber-400 font-mono">{activeRiskMetrics.var95}% Daily</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${Math.min(100, activeRiskMetrics.var95 * 15)}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center text-xs font-bold mb-1">
                          <span className="text-slate-400">MAX DRAWDOWN (ANNUAL EST)</span>
                          <span className="text-rose-400 font-mono">-${(activeVolatility * 0.75).toFixed(1)}% Max</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-400 rounded-full" style={{ width: `${Math.min(100, activeVolatility * 0.75 * 2)}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sector Concentrations */}
                  <div className="glass-card p-6 rounded-2xl lg:col-span-2 flex flex-col justify-between border border-white/5">
                    <div className="text-left">
                      <h2 className="text-base font-bold text-slate-200">Sector Concentrations & Warnings</h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Alert states for asymmetric systemic exposures.
                      </p>
                    </div>

                    <div className="mt-4 space-y-3 flex-grow overflow-y-auto max-h-64 pr-1 custom-scrollbar text-left">
                      {riskMetrics.sectorConcentration.map((item) => {
                        const isHigh = item.rating === 'High';
                        const isModerate = item.rating === 'Moderate';
                        return (
                          <div key={item.sector} className="p-3.5 rounded-xl bg-slate-900/40 border border-white/5 flex justify-between items-center">
                            <div>
                              <span className="text-xs font-extrabold text-slate-200 block">{item.sector}</span>
                              <span className="text-[10px] text-slate-500 font-bold uppercase">CONCENTRATION METRIC</span>
                            </div>

                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <span className="text-xs font-bold font-mono text-slate-200">{item.weight}% Allocation</span>
                                <div className="w-20 bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                                  <div className="h-full bg-emerald-400" style={{ width: `${item.weight}%` }} />
                                </div>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold font-mono inline-block text-center w-16 ${
                                isHigh
                                  ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                                  : isModerate
                                  ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                                  : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                }`}>
                                {item.rating}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Small Compliance Stamp */}
                    <p className="text-[8.5px] text-slate-700 mt-4 text-center italic font-sans leading-relaxed">
                      ⚠️ Disclaimer: AssetX provides data-driven quantitative insights and algorithmic financial modeling. Environmental and market factors fluctuate rapidly; please verify market metrics independently before executing high-capital trades.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab: News Sentiment */}
              {activeTab === 'News Sentiment' && (
                <div className="glass-card p-6 rounded-2xl border border-white/5">
                  <div className="border-b border-white/5 pb-4 mb-6 flex justify-between items-center text-left">
                    <div>
                      <h2 className="text-base font-bold text-slate-200">AI Financial Sentiment Terminal</h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        High-volume financial news scoring pipelines analyzed via natural language models.
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-bold font-mono">
                      SENTIMENT_ANALYZER_v2
                    </span>
                  </div>

                  {newsLoading ? (
                    <div className="py-20 text-center animate-pulse space-y-4">
                      <div className="h-6 w-32 bg-slate-800/80 rounded-full mx-auto" />
                      <div className="h-4.5 w-64 bg-slate-800/50 rounded-full mx-auto" />
                    </div>
                  ) : (
                    <div className="space-y-4 text-left">
                      {newsSentimentList.map((news, idx) => {
                        const isBullish = news.sentiment === 'BULLISH';
                        const isBearish = news.sentiment === 'BEARISH';
                        return (
                          <div key={idx} className="p-4 rounded-xl bg-slate-900/40 border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="px-2 py-0.5 rounded bg-slate-800 border border-white/5 text-[9px] text-slate-400 font-bold font-mono">
                                  {news.source}
                                </span>
                                <span className="text-[10px] text-slate-500 font-medium font-mono">{news.time}</span>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold font-mono inline-block ${
                                  isBullish 
                                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                                    : isBearish
                                    ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                                    : 'bg-slate-500/10 border border-slate-500/20 text-slate-400'
                                }`}>
                                  {news.sentiment}
                                </span>
                              </div>
                              <h3 className="text-xs font-bold text-slate-200 hover:text-emerald-400 cursor-pointer transition">
                                {news.title}
                              </h3>
                            </div>

                            <div className="flex items-center gap-6 shrink-0 md:border-l border-white/5 md:pl-6 min-w-[120px] justify-between md:justify-end w-full md:w-auto">
                              <div className="text-right">
                                <span className="text-[10px] text-slate-500 block uppercase font-bold">SCORE</span>
                                <span className={`text-sm font-extrabold font-mono ${isBullish ? 'text-emerald-300' : isBearish ? 'text-rose-300' : 'text-slate-300'}`}>
                                  {news.score}/100
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-slate-500 block uppercase font-bold">IMPACT STATE</span>
                                <span className="text-xs font-extrabold text-slate-200 font-mono">{news.impact}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: AI Chatbot (Dedicated Immersive Section) */}
              {activeTab === 'AI Chatbot' && (
                <div className="flex-grow flex flex-col h-full w-full overflow-hidden">
                  <FinanceChatbot 
                    livePrices={livePrices} 
                    marketOverview={marketOverview} 
                    newsSentiment={newsSentimentList} 
                  />
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>

      </div>

      {/* State-Driven Profile Modal */}
      <AnimatePresence>
        {profileModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProfileModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-[#0f0f12] border border-white/10 rounded-2xl p-6 shadow-2xl relative z-50 text-slate-200 text-left"
            >
              <div className="flex justify-between items-start border-b border-white/5 pb-4 mb-5">
                <div>
                  <h3 className="text-base font-extrabold text-white">Investor Profile</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Secure credentials & workspace permissions</p>
                </div>
                <button 
                  onClick={() => setProfileModalOpen(false)}
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Profile Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-300 font-bold text-lg">
                    {userInitials}
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white">{currentUser?.name || 'Quantum Investor'}</h4>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-400 font-mono uppercase mt-1 inline-block">
                      {currentUser?.role || 'Senior Analyst'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-900/50 border border-white/5 rounded-xl">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Email Address</span>
                    <span className="text-xs font-bold text-slate-300 font-mono mt-1 block truncate">{currentUser?.email || 'analyst@assetx.ai'}</span>
                  </div>
                  <div className="p-3 bg-slate-900/50 border border-white/5 rounded-xl">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Workspace Access</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono mt-1 block">Full / Premium</span>
                  </div>
                  <div className="p-3 bg-slate-900/50 border border-white/5 rounded-xl">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Trading Desk ID</span>
                    <span className="text-xs font-bold text-slate-300 font-mono mt-1 block">{currentUser?.deskId || '#AX-9048-DX'}</span>
                  </div>
                  <div className="p-3 bg-slate-900/50 border border-white/5 rounded-xl">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Session IP</span>
                    <span className="text-xs font-bold text-slate-300 font-mono mt-1 block">192.168.1.104</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setProfileModalOpen(false)}
                  className="px-4 py-2 bg-emerald-500 text-black hover:bg-emerald-400 text-xs font-bold rounded-xl transition duration-200"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Dashboard(props) {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContent {...props} />
    </QueryClientProvider>
  );
}
