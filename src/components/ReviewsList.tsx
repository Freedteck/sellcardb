import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, User, Calendar, MessageSquare } from 'lucide-react';
import { supabase, Review } from '../lib/supabase';
import RatingStars from './RatingStars';
import LoadingSpinner from './LoadingSpinner';

interface ReviewsListProps {
  sellerId: string;
  refreshKey: number;
  limit?: number;
  showAll?: boolean;
}

const ReviewsList: React.FC<ReviewsListProps> = ({
  sellerId,
  limit = 5,
  refreshKey,
  showAll = false
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllReviews, setShowAllReviews] = useState(showAll);

  useEffect(() => {
    fetchReviews();
  }, [sellerId, refreshKey]);

  const fetchReviews = async () => {
    try {
      let query = supabase
        .from('reviews')
        .select('*')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (!showAllReviews) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-6 sm:py-8">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-6 sm:py-8">
        <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
        <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-1 sm:mb-2">
          No reviews yet
        </h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
          Be the first to leave a review for this seller!
        </p>
      </div>
    );
  }

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, limit);
  const hasMoreReviews = reviews.length > limit && !showAllReviews;

  return (
    <div className="space-y-3 sm:space-y-4">
      {displayedReviews.map((review, index) => (
        <motion.div
          key={review.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-0 mb-2 sm:mb-3">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-1.5 sm:p-2">
                <User size={14} className="text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h4 className="font-medium text-sm sm:text-base text-gray-900 dark:text-white">
                  {review.customer_name}
                </h4>
                <div className="flex items-center space-x-1 sm:space-x-2 mt-0.5 sm:mt-1">
                  <RatingStars rating={review.rating} size="xs sm:sm" />
                  {/* <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {review.rating}/5
                  </span> */} 
                </div>
              </div>
            </div>
            <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <Calendar size={12} className="mr-0.5 sm:mr-1" />
              {formatDate(review.created_at)}
            </div>
          </div>

          {review.comment && (
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              {review.comment}
            </p>
          )}

          {review.is_verified && (
            <div className="mt-2 sm:mt-3 flex items-center">
              <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xxs sm:text-xs font-medium">
                Verified Purchase
              </span>
            </div>
          )}
        </motion.div>
      ))}

      {hasMoreReviews && (
        <div className="text-center pt-2 sm:pt-4">
          <button
            onClick={() => setShowAllReviews(true)}
            className="text-sm sm:text-base text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
          >
            Show all {reviews.length} reviews
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewsList;