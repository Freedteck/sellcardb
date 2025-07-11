import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Search, Plus, MessageSquare, User, Package, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isAddExpanded, setIsAddExpanded] = useState(false);

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

  const handleAddClick = () => {
    setIsAddExpanded(!isAddExpanded);
  };

  const handleAddOptionClick = () => {
    setIsAddExpanded(false);
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
      activeColor: 'text-pink-500'
    }
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50 safe-area-bottom"
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
                    className="relative flex flex-col items-center justify-center py-2 px-1 min-h-12 min-w-12"
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
  );
};

export default MobileBottomNav;