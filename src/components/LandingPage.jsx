import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Mail, 
  Lock, 
  User, 
  Briefcase, 
  ArrowRight, 
  AlertCircle, 
  ShieldCheck,
  X,
  LockKeyhole
} from 'lucide-react';

export default function LandingPage({ onLoginSuccess }) {
  const [showTerminal, setShowTerminal] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Portfolio Manager');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password || (isRegister && !name)) {
      setError('Please fill in all required fields.');
      return;
    }

    const registeredUsers = JSON.parse(localStorage.getItem('assetx_registered_users') || '[]');

    if (isRegister) {
      // Registration flow
      const userExists = registeredUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (userExists) {
        setError('An account with this email already exists.');
        return;
      }

      // Generate a unique Trading Desk ID for the new user
      const randomDesk = `#AX-${Math.floor(1000 + Math.random() * 9000)}-DX`;
      const newUser = {
        email: email.trim(),
        name: name.trim(),
        password: password,
        role: role,
        deskId: randomDesk,
        watchlist: ['AAPL', 'MSFT', 'BTC'] // default starting watchlist
      };

      const nextUsers = [...registeredUsers, newUser];
      localStorage.setItem('assetx_registered_users', JSON.stringify(nextUsers));
      
      setSuccess('Account provisioned successfully!');
      setTimeout(() => {
        setIsRegister(false);
        setPassword('');
        setError('');
        setSuccess('');
      }, 1500);

    } else {
      // Login flow
      const user = registeredUsers.find(
        u => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password
      );

      if (!user) {
        setError('Invalid secure credentials or key code.');
        return;
      }

      onLoginSuccess(user);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black flex justify-center items-center font-sans">
      {/* Fullscreen Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'translate3d(0, 0, 0)',
          imageRendering: '-webkit-optimize-contrast',
          filter: 'brightness(0.5) contrast(1.1) saturate(1.05)'
        }}
      >
        <source src="/demo.mp4" type="video/mp4" />
      </video>

      {/* Premium Cinematic Holographic Micro-Grid Texture */}
      <div 
        className="absolute inset-0 pointer-events-none z-10 opacity-25 mix-blend-overlay"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
          backgroundSize: '4px 4px'
        }}
      />

      {/* Cinematic Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/70 pointer-events-none z-20" />

      {/* AnimatePresence for transitions between Hero Landing and Auth Terminal */}
      <AnimatePresence mode="wait">
        {!showTerminal ? (
          // CINEMATIC HERO VIEW
          <motion.div
            key="hero-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-30"
          >
            {/* Center Cinematic Title */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="text-center select-none pointer-events-none px-4"
            >
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-[0.25em] bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-100 to-slate-400 uppercase leading-tight filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                AssetX
              </h1>
              <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-emerald-500 to-transparent mx-auto mt-4" />
              <p className="text-[10px] md:text-xs font-semibold tracking-[0.4em] uppercase text-emerald-400/90 mt-4 font-mono">
                Real-Time Investing Intelligence
              </p>
            </motion.div>

            {/* Top Right Glassmorphic Sign In Entry Button */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              className="absolute top-8 right-8"
            >
              <button
                onClick={() => setShowTerminal(true)}
                className="group relative flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-slate-950/40 backdrop-blur-md text-xs text-emerald-400 font-bold tracking-widest uppercase shadow-lg border border-emerald-500/20 hover:border-emerald-400/60 hover:text-white transition-all duration-300 active:scale-[0.97]"
              >
                <LockKeyhole className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white" />
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white transform group-hover:translate-x-1 transition-all duration-300" />
              </button>
            </motion.div>
          </motion.div>
        ) : (
          // DEDICATED SIGN IN VIEW (Terminal overlay)
          <motion.div
            key="terminal-view"
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex justify-center items-center z-40 bg-black/40"
          >
            {/* Terminal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="relative w-full max-w-md p-8 rounded-3xl glass-panel border border-white/10 shadow-2xl flex flex-col items-center text-slate-100 bg-slate-950/65"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowTerminal(false);
                  setIsRegister(false);
                  setError('');
                  setSuccess('');
                }}
                className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 border border-white/0 hover:border-white/5 transition-all duration-200"
                title="Close terminal"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Logo and Brand Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-pulse">
                  <Activity className="w-5.5 h-5.5 text-white" />
                </div>
                <div>
                  <span className="font-extrabold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 block leading-none">AssetX</span>
                  <span className="text-[10px] text-emerald-400 block font-semibold tracking-widest uppercase mt-0.5">FINTECH LABS</span>
                </div>
              </div>

              {/* Title */}
              <div className="text-center mb-6">
                <h2 className="text-lg font-bold text-slate-100">
                  {isRegister ? 'Access Provisioning Terminal' : 'Platform Security Terminal'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {isRegister ? 'Register your private trading credentials' : 'Input security credentials to enter desk'}
                </p>
              </div>

              {/* Alert Messages */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="w-full p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-400 text-xs font-semibold"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {success && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="w-full p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-400 text-xs font-semibold"
                  >
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>{success}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form Inputs */}
              <form onSubmit={handleSubmit} className="w-full space-y-4">
                {isRegister && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 overflow-hidden"
                  >
                    {/* Full Name */}
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-950/60 border border-white/5 rounded-xl text-xs placeholder:text-slate-500 text-slate-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all font-medium"
                      />
                    </div>

                    {/* Role Selector */}
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-950/60 border border-white/5 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all font-medium appearance-none"
                      >
                        <option value="Senior Analyst" className="bg-[#0c0c0e]">Senior Analyst</option>
                        <option value="Portfolio Manager" className="bg-[#0c0c0e]">Portfolio Manager</option>
                        <option value="Quantitative Trader" className="bg-[#0c0c0e]">Quantitative Trader</option>
                        <option value="Risk Evaluator" className="bg-[#0c0c0e]">Risk Evaluator</option>
                      </select>
                    </div>
                  </motion.div>
                )}

                {/* Email Address */}
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-950/60 border border-white/5 rounded-xl text-xs placeholder:text-slate-500 text-slate-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all font-medium"
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-950/60 border border-white/5 rounded-xl text-xs placeholder:text-slate-500 text-slate-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all font-medium"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-emerald-500/10 hover:shadow-emerald-400/20 active:scale-[0.98] transition-all duration-200 mt-2"
                >
                  <span>{isRegister ? 'Register Desk' : 'Sign in to Platform'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Toggle between register and login */}
              <div className="mt-6 flex flex-col items-center gap-2">
                <button
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError('');
                    setSuccess('');
                  }}
                  className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition duration-200"
                >
                  {isRegister ? 'Already registered? Connect Session' : 'Create new trading account'}
                </button>
                
                {!isRegister && (
                  <span className="text-[9px] text-slate-600 font-mono">
                    Seed Demo Account: analyst@assetx.ai / password123
                  </span>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
