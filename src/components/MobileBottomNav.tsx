import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Search, Plus, MessageSquare, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      setShowSignOutConfirm(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const tabs = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: user ? '/dashboard' : '/',
      activeColor: 'text-blue-500'
    },
    {
      id: 'browse',
      label: 'Browse',
      icon: Search,
      path: '/marketplace',
      activeColor: 'text-green-500'
    },
    {
      id: 'add',
      label: 'Add',
      icon: Plus,
      path: user ? '/dashboard/products/new' : '/signup',
      activeColor: 'text-purple-500',
      isSpecial: true
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      path: user ? '/dashboard/inquiries' : '/login',
      activeColor: 'text-orange-500'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: user ? '/dashboard/settings' : '/login',
      activeColor: 'text-pink-500',
      hasSignOut: user ? true : false
    }
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleTabClick = (tab: any) => {
    if (tab.id === 'profile' && tab.hasSignOut) {
      setShowSignOutConfirm(true);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50 safe-area-bottom"
            style={{
              background: 'var(--nav-bg)',
              borderColor: 'var(--nav-border)',
            }}
          >
            <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
              {tabs.map((tab) => {
                const active = isActive(tab.path);
                const Icon = tab.icon;
                
                return (
                  <div key={tab.id} className="relative flex flex-col items-center justify-center min-w-0 flex-1">
                    <Link
                      to={tab.path}
                      onClick={() => handleTabClick(tab)}
                      className="relative flex flex-col items-center justify-center py-2 px-1 touch-target"
                    >
                      <motion.div
                        whileTap={{ scale: 0.85 }}
                        className={`relative flex flex-col items-center justify-center ${
                          tab.isSpecial 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full p-3 shadow-lg'
                            : 'p-2'
                        }`}
                      >
                        {/* Active indicator */}
                        {active && !tab.isSpecial && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-current rounded-full"
                            style={{ color: tab.activeColor.replace('text-', '') }}
                          />
                        )}
                        
                        <Icon 
                          size={tab.isSpecial ? 24 : 22} 
                          className={
                            tab.isSpecial 
                              ? 'text-white' 
                              : active 
                                ? tab.activeColor 
                                : 'text-gray-500 dark:text-gray-400'
                          }
                        />
                        
                        {!tab.isSpecial && (
                          <span 
                            className={`text-xs mt-1 font-medium ${
                              active 
                                ? tab.activeColor 
                                : 'text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            {tab.label}
                          </span>
                        )}
                      </motion.div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sign Out Confirmation Modal */}
      <AnimatePresence>
        {showSignOutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSignOutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="mobile-card p-6 w-full max-w-sm"
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Profile Options
              </h3>
              
              <div className="space-y-3">
                <Link
                  to="/dashboard/settings"
                  onClick={() => setShowSignOutConfirm(false)}
                  className="mobile-button w-full bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <User className="h-4 w-4 mr-2" />
                  View Profile Settings
                </Link>
                
                <button
                  onClick={handleSignOut}
                  className="mobile-button w-full bg-red-600 text-white px-4 py-3 rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
                
                <button
                  onClick={() => setShowSignOutConfirm(false)}
                  className="mobile-button w-full bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-xl hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileBottomNav;