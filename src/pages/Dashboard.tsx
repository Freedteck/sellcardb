import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, Package, Users, Eye, TrendingUp, Plus, Settings, MessageSquare, CreditCard, QrCode, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Seller, Product, Service, Inquiry } from '../lib/supabase';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalServices: 0,
    totalViews: 0,
    newInquiries: 0,
  });
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileNav, setShowMobileNav] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSellerData();
    }
  }, [user]);

  const fetchSellerData = async () => {
    try {
      // Get seller profile
      const { data: sellerData, error: sellerError } = await supabase
        .from('sellers')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (sellerError && sellerError.code !== 'PGRST116') {
        throw sellerError;
      }

      if (sellerData) {
        setSeller(sellerData);
        await fetchStats(sellerData.id);
        await fetchRecentInquiries(sellerData.id);
      }
    } catch (error) {
      console.error('Error fetching seller data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (sellerId: string) => {
    try {
      const [productsResult, servicesResult, inquiriesResult] = await Promise.all([
        supabase.from('products').select('view_count').eq('seller_id', sellerId),
        supabase.from('services').select('view_count').eq('seller_id', sellerId),
        supabase.from('inquiries').select('id').eq('seller_id', sellerId).eq('status', 'new'),
      ]);

      const totalProducts = productsResult.data?.length || 0;
      const totalServices = servicesResult.data?.length || 0;
      const totalViews = [
        ...(productsResult.data || []),
        ...(servicesResult.data || [])
      ].reduce((sum, item) => sum + (item.view_count || 0), 0);
      const newInquiries = inquiriesResult.data?.length || 0;

      setStats({
        totalProducts,
        totalServices,
        totalViews,
        newInquiries,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentInquiries = async (sellerId: string) => {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select(`
          *,
          product:products(name),
          service:services(name)
        `)
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentInquiries(data || []);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8"
          >
            <Store className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to SellCard!
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-6">
              You haven't set up your shop yet. Create your seller profile to start selling.
            </p>
            <Link
              to="/setup-shop"
              className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl text-sm sm:text-base touch-target"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Set Up My Shop
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const quickActions = [
    { title: 'Add Product', icon: Package, link: '/dashboard/products/new', color: 'bg-blue-600' },
    { title: 'Add Service', icon: Users, link: '/dashboard/services/new', color: 'bg-green-600' },
    { title: 'View Inquiries', icon: MessageSquare, link: '/dashboard/inquiries', color: 'bg-purple-600' },
    { title: 'Business Card', icon: CreditCard, link: '/dashboard/business-card', color: 'bg-orange-600' },
    { title: 'QR Codes', icon: QrCode, link: '/dashboard/qr-codes', color: 'bg-indigo-600' },
    { title: 'Shop Settings', icon: Settings, link: '/dashboard/settings', color: 'bg-gray-600' },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8"
      >
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {seller.business_name}!
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Here's what's happening with your shop today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {[
            {
              title: 'Products',
              value: stats.totalProducts,
              icon: Package,
              color: 'from-blue-500 to-blue-600',
              link: '/dashboard/products'
            },
            {
              title: 'Services',
              value: stats.totalServices,
              icon: Users,
              color: 'from-green-500 to-green-600',
              link: '/dashboard/services'
            },
            {
              title: 'Total Views',
              value: stats.totalViews,
              icon: Eye,
              color: 'from-purple-500 to-purple-600',
            },
            {
              title: 'New Inquiries',
              value: stats.newInquiries,
              icon: MessageSquare,
              color: 'from-orange-500 to-orange-600',
              link: '/dashboard/inquiries'
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm font-medium">
                    {stat.title}
                  </p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div className={`bg-gradient-to-r ${stat.color} p-2 sm:p-3 rounded-lg`}>
                  <stat.icon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
              {stat.link && (
                <Link
                  to={stat.link}
                  className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm hover:text-blue-700 dark:hover:text-blue-300 mt-2 inline-block touch-target"
                >
                  View all →
                </Link>
              )}
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Quick Actions
              </h3>
              <button
                onClick={() => setShowMobileNav(!showMobileNav)}
                className="sm:hidden p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 touch-target"
              >
                <Menu size={20} />
              </button>
            </div>
            
            <div className={`space-y-2 sm:space-y-3 ${showMobileNav ? 'block' : 'hidden sm:block'}`}>
              {quickActions.map((action, index) => (
                <Link
                  key={action.title}
                  to={action.link}
                  className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group touch-target"
                >
                  <div className={`${action.color} p-2 rounded-lg mr-3`}>
                    <action.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                    {action.title}
                  </span>
                </Link>
              ))}
              
              <Link
                to={`/shop/${seller.id}`}
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group touch-target"
              >
                <div className="bg-blue-600 p-2 rounded-lg mr-3">
                  <Store className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                  View Shop
                </span>
              </Link>
            </div>
          </motion.div>

          {/* Recent Inquiries */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Inquiries
              </h3>
              <Link
                to="/dashboard/inquiries"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm touch-target"
              >
                View all
              </Link>
            </div>
            
            {recentInquiries.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {recentInquiries.map((inquiry) => (
                  <Link
                    key={inquiry.id}
                    to={`/dashboard/inquiries/${inquiry.id}`}
                    className="block border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors touch-target"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                          {inquiry.customer_name}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {inquiry.product?.name || inquiry.service?.name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                          {inquiry.message}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${
                        inquiry.status === 'new' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : inquiry.status === 'replied'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {inquiry.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
                      <span>{new Date(inquiry.created_at).toLocaleDateString()}</span>
                      {inquiry.customer_phone && (
                        <span className="truncate ml-2">{inquiry.customer_phone}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <MessageSquare className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                  No inquiries yet. Share your shop to start receiving messages!
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;