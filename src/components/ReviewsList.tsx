import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, User, Calendar, MessageSquare } from 'lucide-react';
import { supabase, Review } from '../lib/supabase';
import RatingStars from './RatingStars';
import LoadingSpinner from './LoadingSpinner';

interface ReviewsListProps {
  sellerId: string;
  limit?: number;
  showAll?: boolean;
}

const ReviewsList: React.FC<ReviewsListProps> = ({
  sellerId,
  limit = 5,
  showAll = false
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllReviews, setShowAllReviews] = useState(showAll);

  useEffect(() => {
    fetchReviews();
  }, [sellerId]);

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
    const date = new Date(dateString);
    return window.innerWidth < 640 
      ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <LoadingSpinner size="sm md:md" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-4 px-2">
        <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <h3 className="text-sm md:text-base font-medium text-gray-900 dark:text-white">
          No reviews yet
        </h3>
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Be the first to review this seller
        </p>
      </div>
    );
  }

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, limit);
  const hasMoreReviews = reviews.length > limit && !showAllReviews;

  return (
    <div className="space-y-2 md:space-y-3">
      {displayedReviews.map((review, index) => (
        <motion.div
          key={review.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-2 md:p-3 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex justify-between items-start gap-2 mb-1">
            <div className="flex items-center min-w-0">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-1 mr-2 flex-shrink-0">
                <User className="h-3 w-3 md:h-4 md:w-4 text-gray-500 dark:text-gray-400" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs md:text-sm font-medium text-gray-900 dark:text-white truncate">
                  {review.customer_name}
                </h4>
                <div className="flex items-center mt-0.5">
                  <RatingStars 
                    rating={review.rating} 
                    size="2xs md:xs" 
                    className="mr-1"
                  />
                  <span className="text-2xs md:text-xs text-gray-500 dark:text-gray-400">
                    {review.rating}/5
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center text-2xs md:text-xs text-gray-400 whitespace-nowrap">
              <Calendar className="h-2.5 w-2.5 md:h-3 md:w-3 mr-0.5" />
              {formatDate(review.created_at)}
            </div>
          </div>

          {review.comment && (
            <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 mt-1 line-clamp-3">
              {review.comment}
            </p>
          )}

          {review.is_verified && (
            <div className="mt-1 flex">
              <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-1 py-0.5 rounded-full text-2xs md:text-xs font-medium">
                Verified
              </span>
            </div>
          )}
        </motion.div>
      ))}

      {hasMoreReviews && (
        <div className="pt-2 text-center">
          <button
            onClick={() => setShowAllReviews(true)}
            className="text-xs md:text-sm text-blue-600 dark:text-blue-400 font-medium"
          >
            Show all {reviews.length} reviews
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewsList;