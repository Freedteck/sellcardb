import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface FloatingActionButtonProps {
  action?: 'add-product' | 'add-service' | 'create-profile';
  className?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ 
  action = 'add-product',
  className = ''
}) => {
  const { user } = useAuth();

  const getPath = () => {
    switch (action) {
      case 'add-product':
        return user ? '/dashboard/products/new' : '/signup';
      case 'add-service':
        return user ? '/dashboard/services/new' : '/signup';
      case 'create-profile':
        return '/create';
      default:
        return user ? '/dashboard/products/new' : '/signup';
    }
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`fixed bottom-20 right-4 z-40 ${className}`}
    >
      <Link
        to={getPath()}
        className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        <Plus size={24} />
      </Link>
    </motion.div>
  );
};

export default FloatingActionButton;