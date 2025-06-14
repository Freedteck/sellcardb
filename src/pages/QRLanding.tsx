import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QrCode, ArrowRight, Store } from 'lucide-react';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';

const QRLanding: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [redirectUrl, setRedirectUrl] = useState<string>('');

  useEffect(() => {
    if (type && id) {
      handleQRScan();
    }
  }, [type, id]);

  const handleQRScan = async () => {
    try {
      let url = '';
      
      switch (type) {
        case 'shop':
          url = `/shop/${id}`;
          // Increment shop view count
          await supabase.rpc('increment_seller_views', { seller_uuid: id });
          break;
        case 'product':
          url = `/product/${id}`;
          // Increment product view count
          await supabase.rpc('increment_product_views', { product_uuid: id });
          break;
        case 'service':
          url = `/service/${id}`;
          // Increment service view count
          await supabase.rpc('increment_service_views', { service_uuid: id });
          break;
        case 'card':
          url = `/card/${id}`;
          // Increment shop view count for business card
          await supabase.rpc('increment_seller_views', { seller_uuid: id });
          break;
        default:
          url = '/marketplace';
      }
      
      setRedirectUrl(url);
      
      // Auto-redirect after 2 seconds
      setTimeout(() => {
        navigate(url);
      }, 2000);
    } catch (error) {
      console.error('Error handling QR scan:', error);
      // Redirect to marketplace on error
      setTimeout(() => {
        navigate('/marketplace');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleManualRedirect = () => {
    if (redirectUrl) {
      navigate(redirectUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto px-4 text-center"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          {loading ? (
            <>
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full">
                  <QrCode className="h-12 w-12 text-white" />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Processing QR Code...
              </h1>
              
              <div className="flex justify-center mb-6">
                <LoadingSpinner size="lg" />
              </div>
              
              <p className="text-gray-600 dark:text-gray-300">
                Please wait while we redirect you to the requested content.
              </p>
            </>
          ) : (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="flex justify-center mb-6"
              >
                <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-full">
                  <QrCode className="h-12 w-12 text-white" />
                </div>
              </motion.div>
              
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                QR Code Scanned Successfully!
              </h1>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                You will be redirected automatically, or click the button below to continue.
              </p>
              
              <motion.button
                onClick={handleManualRedirect}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                Continue
                <ArrowRight className="ml-2 h-5 w-5" />
              </motion.button>
              
              <div className="mt-6 text-center">
                <a
                  href="/marketplace"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm transition-colors"
                >
                  Or browse our marketplace
                </a>
              </div>
            </>
          )}
        </div>
        
        {/* Powered by SellCard */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <Store className="h-4 w-4 mr-1" />
            <span className="text-sm">Powered by SellCard</span>
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default QRLanding;