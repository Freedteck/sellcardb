import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, Package, Users, Eye, TrendingUp, Plus, Settings, MessageSquare, CreditCard, QrCode, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase, Seller, Product, Service, Inquiry } from '../lib/supabase';
import MobileHeader from '../components/MobileHeader';
import FloatingActionButton from '../components/FloatingActionButton';
import LoadingSpinner from '../components/LoadingSpinner';
import GuideModal from '../components/GuideModal';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalServices: 0,
    totalViews: 0,
    newInquiries: 0,
  });
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSellerData();
    }
  }, [user]);
  const [showGuide, setShowGuide] = useState(false);

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
      <div className="min-h-screen pb-20">
        <MobileHeader title="Dashboard" />
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen pb-20">
        <MobileHeader title="Welcome!" />
        <div className="px-4 py-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mobile-card p-6"
          >
            <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Welcome to SellCard!
            </h1>
            <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
              You haven't set up your shop yet. Create your seller profile to start selling.
            </p>
            <Link
              to="/setup-shop"
              className="mobile-button inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5 mr-2" />
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
    <div className="min-h-screen pb-20">
      <MobileHeader 
        title="Dashboard"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 py-6"
      >
              {showGuide && <GuideModal seller={seller} onClose={() => setShowGuide(false)} />}

      <div className="mobile-card p-4 mb-4 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 flex items-center justify-between">
  <div className="flex items-center">
    <TrendingUp className="h-4 w-4 text-blue-600 mr-2" />
    <span className="text-sm text-blue-900 dark:text-blue-200 font-medium">
      Want more customers?
    </span>
  </div>
  <button
    onClick={() => setShowGuide(true)}
    className="text-sm font-semibold text-blue-700 dark:text-blue-400 hover:underline"
  >
    View Tips
  </button>
</div>
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Welcome back, {seller.business_name}!
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Here's what's happening with your shop today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
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
              className="mobile-card p-4 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {stat.value}
                  </p>
                </div>
                <div className={`bg-gradient-to-r ${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              {stat.link && (
                <Link
                  to={stat.link}
                  className="text-blue-600 dark:text-blue-400 text-xs hover:text-blue-700 dark:hover:text-blue-300 mt-2 inline-block"
                >
                  View all →
                </Link>
              )}
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="mobile-card p-4 mb-6"
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Quick Actions
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <Link
                key={action.title}
                to={action.link}
                className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
              >
                <div className={`${action.color} p-2 rounded-lg mb-2`}>
                  <action.icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs text-center font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {action.title}
                </span>
              </Link>
            ))}
            
            <Link
              to={`/shop/${seller.id}`}
              className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
            >
              <div className="bg-blue-600 p-2 rounded-lg mb-2">
                <Store className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs text-center font-medium" style={{ color: 'var(--text-secondary)' }}>
                View Shop
              </span>
            </Link>
          </div>
        </motion.div>

        {/* Recent Inquiries */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="mobile-card p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Recent Inquiries
            </h3>
            <Link
              to="/dashboard/inquiries"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm"
            >
              View all
            </Link>
          </div>
          
          {recentInquiries.length > 0 ? (
            <div className="space-y-3">
              {recentInquiries.map((inquiry) => (
                <Link
                  key={inquiry.id}
                  to={`/dashboard/inquiries/${inquiry.id}`}
                  className="block border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                        {inquiry.customer_name}
                      </h4>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        {inquiry.product?.name || inquiry.service?.name}
                      </p>
                      <p className="text-xs mt-2 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
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
                  <div className="flex items-center justify-between mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span>{new Date(inquiry.created_at).toLocaleDateString()}</span>
                    {inquiry.customer_phone && (
                      <span className="truncate ml-2">{inquiry.customer_phone}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                No inquiries yet. Share your shop to start receiving messages!
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Floating Action Button */}
      <FloatingActionButton />
    </div>
  );
};

export default Dashboard;