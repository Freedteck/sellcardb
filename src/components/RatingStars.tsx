import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {Array.from({ length: maxRating }, (_, index) => {
        const starRating = index + 1;
        const isFilled = starRating <= rating;
        const isPartial = starRating > rating && starRating - 1 < rating;
        
        return (
          <motion.button
            key={index}
            type="button"
            onClick={() => handleStarClick(starRating)}
            disabled={!interactive}
            whileHover={interactive ? { scale: 1.1 } : {}}
            whileTap={interactive ? { scale: 0.9 } : {}}
            className={`${interactive ? 'cursor-pointer' : 'cursor-default'} ${
              interactive ? 'hover:scale-110 transition-transform' : ''
            }`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                isFilled
                  ? 'text-yellow-400 fill-yellow-400'
                  : isPartial
                  ? 'text-yellow-400 fill-yellow-200'
                  : 'text-gray-300 dark:text-gray-600'
              } transition-colors`}
            />
          </motion.button>
        );
      })}
    </div>
  );
};

export default RatingStars;