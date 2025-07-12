import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Search,
  Plus,
  MessageSquare,
  User,
  Package,
  Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
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

  useEffect(() => {
    setIsAddExpanded(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleAddClick = () => setIsAddExpanded((prev) => !prev);
  const handleAddOptionClick = () => setIsAddExpanded(false);

  const fabOptions = [
    {
      label: 'Add Product',
      icon: Package,
      path: user ? '/dashboard/products/new' : '/signup',
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Add Service',
      icon: Users,
      path: user ? '/dashboard/services/new' : '/signup',
      color: 'from-green-500 to-green-600'
    }
  ];

  return (
<AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50 safe-area-bottom"
      >
        <div className="relative">
          {/* Tap-away backdrop */}
          <AnimatePresence>
            {isAddExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAddExpanded(false)}
                className="fixed inset-0 bg-transparent z-30"
              />
            )}
          </AnimatePresence>

          {/* Expanded Add Options */}
          <AnimatePresence>
            {isAddExpanded && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute -top-28 left-1/2 transform -translate-x-1/2 z-40 flex flex-col items-end space-y-3"
              >
                {fabOptions.map((option, index) => (
                  <motion.div
                    key={option.label}
                    initial={{ opacity: 0, scale: 0, y: 20 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                      transition: { delay: index * 0.05 }
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0,
                      y: 20,
                      transition: { delay: (fabOptions.length - 1 - index) * 0.05 }
                    }}
                    className="flex items-center"
                  >
                    <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg mr-3 border border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                        {option.label}
                      </span>
                    </div>
                    <Link
                      to={option.path}
                      onClick={handleAddOptionClick}
                      className={`flex items-center justify-center w-12 h-12 bg-gradient-to-r ${option.color} text-white rounded-full shadow-lg hover:shadow-xl transition-all touch-target`}
                    >
                      <option.icon size={20} />
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

            {/* Bottom Nav */}
          <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
              {[
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
                  path: '',
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
              ].map((tab) => {
                const active = isActive(tab.path);
                const Icon = tab.icon;

                if (tab.id === 'add') {
                  return (
                    <div key="add" className="relative flex flex-col items-center justify-center min-w-0 flex-1">
                      <button
                        onClick={handleAddClick}
                        className="flex flex-col items-center justify-center py-2 px-1 min-h-12 min-w-12"
                      >
                        <motion.div
                          whileTap={{ scale: 0.9 }}
                          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full p-3 shadow-lg"
                        >
                          <motion.div
                            animate={{ rotate: isAddExpanded ? 45 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Plus size={24} />
                          </motion.div>
                        </motion.div>
                        {/* <span className="text-xs mt-1 font-medium text-gray-700 dark:text-gray-200">Add</span> */}
                      </button>
                    </div>
                  );
                }

                return (
                  <div key={tab.id} className="relative flex flex-col items-center justify-center min-w-0 flex-1">
                    <Link
                      to={tab.path}
                      className="relative flex flex-col items-center justify-center py-2 px-1 min-h-12 min-w-12"
                    >
                      <motion.div
                        whileTap={{ scale: 0.85 }}
                        className="relative flex flex-col items-center justify-center p-2"
                      >
                        {active && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-current rounded-full"
                            style={{ color: tab.activeColor.replace('text-', '') }}
                          />
                        )}
                        <Icon
                          size={22}
                          className={
                            active ? tab.activeColor : 'text-gray-500 dark:text-gray-400'
                          }
                        />
                        <span
                          className={`text-xs mt-1 font-medium ${
                            active ? tab.activeColor : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {tab.label}
                        </span>
                      </motion.div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileBottomNav;
