import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp } from 'lucide-react';
import { Seller } from '../lib/supabase';
import CustomerAcquisitionGuide from './CustomerAcquisitionGuide';

interface BoostShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  seller: Seller;
}

const BoostShopModal: React.FC<BoostShopModalProps> = ({ isOpen, onClose, seller }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ 
              opacity: 0, 
              x: '100%',
              y: 0
            }}
            animate={{ 
              opacity: 1, 
              x: 0,
              y: 0
            }}
            exit={{ 
              opacity: 0, 
              x: '100%',
              y: 0
            }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 200,
              duration: 0.3
            }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-gray-900 z-50 shadow-2xl sm:max-w-lg md:max-w-xl lg:max-w-2xl sm:right-4 sm:top-4 sm:bottom-4 sm:rounded-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-10">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    Boost My Shop
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Get more customers with these proven strategies
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-target"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <CustomerAcquisitionGuide seller={seller} />
            </div>
          </motion.div>

          {/* Mobile Bottom Sheet Alternative */}
          <motion.div
            initial={{ 
              opacity: 0, 
              y: '100%'
            }}
            animate={{ 
              opacity: 1, 
              y: 0
            }}
            exit={{ 
              opacity: 0, 
              y: '100%'
            }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 200,
              duration: 0.3
            }}
            className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 z-50 max-h-[90vh] overflow-hidden rounded-t-3xl shadow-2xl"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Boost My Shop
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Get more customers
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-target"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <CustomerAcquisitionGuide seller={seller} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BoostShopModal;