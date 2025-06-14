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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No reviews yet
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Be the first to leave a review for this seller!
        </p>
      </div>
    );
  }

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, limit);
  const hasMoreReviews = reviews.length > limit && !showAllReviews;

  return (
    <div className="space-y-4">
      {displayedReviews.map((review, index) => (
        <motion.div
          key={review.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-2">
                <User size={16} className="text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {review.customer_name}
                </h4>
                <div className="flex items-center space-x-2 mt-1">
                  <RatingStars rating={review.rating} size="sm" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {review.rating}/5
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Calendar size={14} className="mr-1" />
              {formatDate(review.created_at)}
            </div>
          </div>

          {review.comment && (
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {review.comment}
            </p>
          )}

          {review.is_verified && (
            <div className="mt-3 flex items-center">
              <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
                Verified Purchase
              </span>
            </div>
          )}
        </motion.div>
      ))}

      {hasMoreReviews && (
        <div className="text-center pt-4">
          <button
            onClick={() => setShowAllReviews(true)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
          >
            Show all {reviews.length} reviews
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewsList;