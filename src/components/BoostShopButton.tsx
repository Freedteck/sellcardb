import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

interface BoostShopButtonProps {
  onClick: () => void;
  className?: string;
}

const BoostShopButton: React.FC<BoostShopButtonProps> = ({ onClick, className = '' }) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`fixed bottom-32 right-4 z-40 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 touch-target ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 }}
    >
      <TrendingUp size={20} />
      <span className="font-medium text-sm">Boost My Shop</span>
    </motion.button>
  );
};

export default BoostShopButton;