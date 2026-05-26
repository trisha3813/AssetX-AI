import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import './App.css';

// Seed default users if none exist in localStorage
const seedDefaultUsers = () => {
  const existing = localStorage.getItem('assetx_registered_users');
  if (!existing) {
    const defaultUsers = [
      {
        email: 'analyst@assetx.ai',
        name: 'Quantum Investor',
        password: 'password123',
        role: 'Senior Analyst',
        deskId: '#AG-9048-DX',
        watchlist: ['AAPL', 'MSFT', 'NVDA', 'BTC']
      }
    ];
    localStorage.setItem('assetx_registered_users', JSON.stringify(defaultUsers));
  }
};

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  // Initialize and load session on mount
  useEffect(() => {
    seedDefaultUsers();
    const savedSession = localStorage.getItem('assetx_current_user');
    if (savedSession) {
      try {
        setCurrentUser(JSON.parse(savedSession));
      } catch (e) {
        console.error('Failed to parse user session:', e);
      }
    }
  }, []);

  const handleLoginSuccess = (user) => {
    localStorage.setItem('assetx_current_user', JSON.stringify(user));
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('assetx_current_user');
    setCurrentUser(null);
  };

  // Sync user changes (like custom watchlist updates) back to the registered users array and current session
  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('assetx_current_user', JSON.stringify(updatedUser));

    const users = JSON.parse(localStorage.getItem('assetx_registered_users') || '[]');
    const nextUsers = users.map(u => u.email.toLowerCase() === updatedUser.email.toLowerCase() ? updatedUser : u);
    localStorage.setItem('assetx_registered_users', JSON.stringify(nextUsers));
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200">
      <AnimatePresence mode="wait">
        {!currentUser ? (
          <motion.div
            key="landing-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="w-full h-full"
          >
            <LandingPage onLoginSuccess={handleLoginSuccess} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="w-full h-full"
          >
            <Dashboard 
              currentUser={currentUser} 
              onUpdateUser={handleUpdateUser} 
              onLogout={handleLogout} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;