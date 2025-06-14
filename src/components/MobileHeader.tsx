import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MobileHeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  onBack?: () => void;
  transparent?: boolean;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  showBack = false,
  rightAction,
  onBack,
  transparent = false
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`sticky top-0 z-40 ${
        transparent 
          ? 'bg-transparent' 
          : 'bg-white/95 dark:bg-black/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50'
      }`}
    >
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left side */}
        <div className="flex items-center">
          {showBack && (
            <button
              onClick={handleBack}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-target"
            >
              <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
            </button>
          )}
        </div>

        {/* Title */}
        <h1 className="text-lg flex-1 font-semibold text-gray-900 dark:text-white truncate text-center">
          {title}
        </h1>

        {/* Right side */}
        <div className="flex items-center">
          {rightAction}
        </div>
      </div>
    </motion.header>
  );
};

export default MobileHeader;