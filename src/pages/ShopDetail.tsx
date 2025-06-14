import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, MapPin, MessageCircle, Phone, Mail, Globe, Instagram, Eye, Store, Package, Users, Calendar, TrendingUp, Award, Share2 } from 'lucide-react';
import { supabase, Seller, Product, Service } from '../lib/supabase';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ShopDetail: React.FC = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'services' | 'about'>('products');

  useEffect(() => {
    if (sellerId) {
      fetchShopData();
      incrementViewCount();
    }
  }, [sellerId]);

  const fetchShopData = async () => {
    try {
      const [sellerResult, productsResult, servicesResult] = await Promise.all([
        supabase
          .from('sellers')
          .select('*')
          .eq('id', sellerId)
          .eq('is_active', true)
          .single(),
        supabase
          .from('products')
          .select('*')
          .eq('seller_id', sellerId)
          .eq('is_available', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('services')
          .select('*')
          .eq('seller_id', sellerId)
          .eq('is_available', true)
          .order('created_at', { ascending: false })
      ]);

      if (sellerResult.error) throw sellerResult.error;
      
      setSeller(sellerResult.data);
      setProducts(productsResult.data || []);
      setServices(servicesResult.data || []);
    } catch (error) {
      console.error('Error fetching shop data:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async () => {
    try {
      await supabase.rpc('increment_seller_views', { seller_uuid: sellerId });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleContactSeller = (method: 'whatsapp' | 'phone' | 'email') => {
    if (!seller) return;

    const message = `Hi! I found your shop on SellCard. I'm interested in your products/services.`;
    
    switch (method) {
      case 'whatsapp':
        const whatsappUrl = `https://wa.me/${seller.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        break;
      case 'phone':
        if (seller.phone_number) {
          window.open(`tel:${seller.phone_number}`, '_blank');
        }
        break;
      case 'email':
        if (seller.email) {
          window.open(`mailto:${seller.email}?subject=Inquiry about your shop&body=${encodeURIComponent(message)}`, '_blank');
        }
        break;
    }
  };

  const shareShop = () => {
    const shopUrl = window.location.href;
    const shareText = seller ? `Check out ${seller.business_name} on SellCard` : 'Check out this shop on SellCard';
    
    if (navigator.share) {
      navigator.share({
        title: shareText,
        url: shopUrl,
      });
    } else {
      navigator.clipboard.writeText(shopUrl);
      toast.success('Shop link copied to clipboard!');
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Shop Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">The shop you're looking for doesn't exist or is no longer active.</p>
          <Link to="/marketplace" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline">
            Browse other shops
          </Link>
        </div>
      </div>
    );
  }

  const totalItems = products.length + services.length;
  const memberSince = new Date(seller.created_at).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  });

  return (
    <div className="min-h-screen">
      <Header />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8"
      >
        <div className="mb-4 sm:mb-6">
          <Link
            to="/marketplace"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Marketplace
          </Link>
        </div>

        {/* Shop Banner */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6 sm:mb-8">
          {/* Cover Image */}
          {seller.cover_image_url && (
            <div className="h-48 sm:h-64 md:h-80 overflow-hidden relative">
              <img
                src={seller.cover_image_url}
                alt={seller.business_name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30"></div>
              <button
                onClick={shareShop}
                className="absolute top-4 right-4 bg-white bg-opacity-90 text-gray-700 p-2 rounded-full hover:bg-opacity-100 transition-all touch-target"
                title="Share shop"
              >
                <Share2 size={20} />
              </button>
            </div>
          )}
          
          {/* Shop Info */}
          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col space-y-4 sm:space-y-6">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {seller.business_name}
                    </h1>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-500 dark:text-gray-400 space-y-1 sm:space-y-0">
                      {seller.location && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {seller.location}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Member since {memberSince}
                      </div>
                    </div>
                  </div>
                  {seller.is_verified && (
                    <div className="flex items-center bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full mt-2 sm:mt-0 self-start">
                      <Award className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">Verified</span>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 leading-relaxed">
                  {seller.description}
                </p>
                
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 mr-1" />
                      <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                        {seller.rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {seller.total_reviews} reviews
                    </p>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mr-1" />
                      <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                        {totalItems}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      Total items
                    </p>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-1" />
                      <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                        {seller.total_sales}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      Sales
                    </p>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 mr-1" />
                      <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                        {seller.view_count}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      Views
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Contact Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => handleContactSeller('whatsapp')}
                  className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center font-medium touch-target"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Contact via WhatsApp
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  {seller.phone_number && (
                    <button
                      onClick={() => handleContactSeller('phone')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center touch-target"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Call</span>
                      <span className="sm:hidden">📞</span>
                    </button>
                  )}
                  
                  {seller.email && (
                    <button
                      onClick={() => handleContactSeller('email')}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center touch-target"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Email</span>
                      <span className="sm:hidden">✉️</span>
                    </button>
                  )}
                </div>
                
                {/* Social Links */}
                {(seller.website || seller.instagram) && (
                  <div className="flex justify-center space-x-4 pt-2">
                    {seller.website && (
                      <a
                        href={seller.website.startsWith('http') ? seller.website : `https://${seller.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors touch-target"
                      >
                        <Globe className="h-4 w-4 mr-1" />
                        Website
                      </a>
                    )}
                    
                    {seller.instagram && (
                      <a
                        href={`https://instagram.com/${seller.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors touch-target"
                      >
                        <Instagram className="h-4 w-4 mr-1" />
                        Instagram
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-First Tabs */}
        <div className="mb-6 sm:mb-8">
          <div className="flex overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex space-x-2 min-w-max sm:justify-center sm:w-full">
              {[
                { id: 'products', label: `Products (${products.length})`, icon: Package },
                { id: 'services', label: `Services (${services.length})`, icon: Users },
                { id: 'about', label: 'About', icon: Store },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap touch-target ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <tab.icon size={18} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {products.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
                    >
                      {product.images.length > 0 && (
                        <div className="aspect-square sm:aspect-video overflow-hidden">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      
                      <div className="p-3 sm:p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2 line-clamp-1 text-sm sm:text-base">
                          {product.name}
                        </h3>
                        
                        <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
                          {product.description}
                        </p>
                        
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                          <span className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">
                            ${product.price}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            Stock: {product.stock_quantity}
                          </span>
                        </div>
                        
                        <Link
                          to={`/product/${product.id}`}
                          className="block w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center touch-target text-sm sm:text-base"
                        >
                          View Details
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No products available
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    This shop hasn't added any products yet.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'services' && (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {services.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {services.map((service, index) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
                    >
                      {service.images.length > 0 && (
                        <div className="aspect-square sm:aspect-video overflow-hidden">
                          <img
                            src={service.images[0]}
                            alt={service.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      
                      <div className="p-3 sm:p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2 line-clamp-1 text-sm sm:text-base">
                          {service.name}
                        </h3>
                        
                        <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
                          {service.description}
                        </p>
                        
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                          <span className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
                            ${service.price}
                          </span>
                          {service.duration_days && (
                            <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              {service.duration_days} days
                            </div>
                          )}
                        </div>
                        
                        <Link
                          to={`/service/${service.id}`}
                          className="block w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-center touch-target text-sm sm:text-base"
                        >
                          View Details
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No services available
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    This shop hasn't added any services yet.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 md:p-8"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                About {seller.business_name}
              </h2>
              
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Business Description
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {seller.description}
                  </p>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Contact Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <MessageCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                          {seller.whatsapp_number}
                        </span>
                      </div>
                      {seller.phone_number && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                            {seller.phone_number}
                          </span>
                        </div>
                      )}
                      {seller.email && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-300 text-sm sm:text-base break-all">
                            {seller.email}
                          </span>
                        </div>
                      )}
                      {seller.location && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                            {seller.location}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Shop Statistics
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Member since:</span>
                        <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{memberSince}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Total products:</span>
                        <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{products.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Total services:</span>
                        <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{services.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Total sales:</span>
                        <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{seller.total_sales}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Profile views:</span>
                        <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{seller.view_count}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Sticky Contact Bar for Mobile */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-40">
        <div className="flex space-x-3">
          <button
            onClick={() => handleContactSeller('whatsapp')}
            className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center font-medium touch-target"
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            WhatsApp
          </button>
          {seller?.phone_number && (
            <button
              onClick={() => handleContactSeller('phone')}
              className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors touch-target"
            >
              <Phone className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={shareShop}
            className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors touch-target"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Add bottom padding to account for sticky contact bar on mobile */}
      <div className="sm:hidden h-20"></div>

      <Footer />
    </div>
  );
};

export default ShopDetail;