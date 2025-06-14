import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Package, Users, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface FloatingActionButtonProps {
  className?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ 
  className = ''
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  // Only show on relevant pages
  const showOnPages = ['/dashboard', '/marketplace', '/'];
  const shouldShow = showOnPages.some(page => 
    location.pathname === page || location.pathname.startsWith('/dashboard')
  );

  // if (!shouldShow) return null;

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

  const handleMainButtonClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleOptionClick = () => {
    setIsExpanded(false);
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
            className="fixed inset-0 bg-black/20 z-40"
          />
        )}
      </AnimatePresence>

      {/* FAB Container */}
      <div className={`fixed bottom-20 right-4 z-50 ${className}`}>
        {/* Option Buttons */}
        <AnimatePresence>
          {isExpanded && (
            <div className="flex flex-col space-y-3 mb-3">
              {fabOptions.map((option, index) => (
                <motion.div
                  key={option.label}
                  initial={{ opacity: 0, scale: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    y: 0,
                    transition: { delay: index * 0.1 }
                  }}
                  exit={{ 
                    opacity: 0, 
                    scale: 0, 
                    y: 20,
                    transition: { delay: (fabOptions.length - 1 - index) * 0.05 }
                  }}
                  className="flex items-center"
                >
                  {/* Label */}
                  <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg mr-3 border border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {option.label} jjj
                    </span>
                  </div>
                  
                  {/* Button */}
                  <Link
                    to={option.path}
                    onClick={handleOptionClick}
                    className={`flex items-center justify-center w-12 h-12 bg-gradient-to-r ${option.color} text-white rounded-full shadow-lg hover:shadow-xl transition-all touch-target`}
                  >
                    <option.icon size={20} />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Main FAB Button */}
        <motion.button
          onClick={handleMainButtonClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all touch-target"
        >
          <motion.div
            animate={{ rotate: isExpanded ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isExpanded ? <X size={24} /> : <Plus size={24} />}
          </motion.div>
        </motion.button>
      </div>
    </>
  );
};

export default FloatingActionButton;