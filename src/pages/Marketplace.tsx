import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, MapPin, Star, Eye, MessageCircle, Package, Users, Store, Calendar, TrendingUp, Award, X, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, Product, Service, Seller } from '../lib/supabase';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';

type MarketplaceItem = (Product | Service) & {
  type: 'product' | 'service';
  seller: Seller;
};

const Marketplace: React.FC = () => {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [featuredSellers, setFeaturedSellers] = useState<Seller[]>([]);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [filteredItems, setFilteredItems] = useState<MarketplaceItem[]>([]);
  const [filteredSellers, setFilteredSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'services' | 'sellers'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const categories = [
    'Electronics',
    'Fashion & Clothing',
    'Home & Garden',
    'Beauty & Personal Care',
    'Sports & Outdoors',
    'Books & Media',
    'Toys & Games',
    'Food & Beverages',
    'Health & Wellness',
    'Automotive',
    'Art & Crafts',
    'Consulting',
    'Design & Creative',
    'Digital Marketing',
    'Writing & Translation',
    'Video & Animation',
    'Music & Audio',
    'Programming & Tech',
    'Business',
    'Lifestyle',
    'Education & Training',
    'Home Services',
    'Photography',
    'Legal Services',
    'Other'
  ];

  const nigerianCities = [
    'Lagos',
    'Abuja',
    'Kano',
    'Ibadan',
    'Port Harcourt',
    'Benin City',
    'Kaduna',
    'Enugu',
    'Ilorin',
    'Aba',
    'Jos',
    'Warri',
    'Calabar',
    'Akure',
    'Abeokuta',
    'Osogbo',
    'Uyo',
    'Sokoto',
    'Maiduguri',
    'Zaria'
  ];

  useEffect(() => {
    fetchMarketplaceData();
  }, []);

  useEffect(() => {
    filterData();
    updateActiveFilters();
  }, [searchTerm, selectedCategory, locationFilter, priceRange, items, sellers, activeTab]);

  const fetchMarketplaceData = async () => {
    try {
      const [productsResult, servicesResult, sellersResult] = await Promise.all([
        supabase
          .from('products')
          .select(`
            *,
            seller:sellers(*)
          `)
          .eq('is_available', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('services')
          .select(`
            *,
            seller:sellers(*)
          `)
          .eq('is_available', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('sellers')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
      ]);

      const products: MarketplaceItem[] = (productsResult.data || []).map(item => ({
        ...item,
        type: 'product' as const
      }));

      const services: MarketplaceItem[] = (servicesResult.data || []).map(item => ({
        ...item,
        type: 'service' as const
      }));

      const allItems = [...products, ...services].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setItems(allItems);
      setSellers(sellersResult.data || []);

      // Set featured sellers (top rated or verified)
      const featured = (sellersResult.data || [])
        .filter(seller => seller.is_verified || seller.rating >= 4.0)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 6);
      setFeaturedSellers(featured);

      // Set latest products
      const latest = products.slice(0, 6);
      setLatestProducts(latest.map(p => ({ ...p, seller: p.seller })));

      // Set available services
      const servicesOnly = services.slice(0, 6);
      setAvailableServices(servicesOnly.map(s => ({ ...s, seller: s.seller })));

    } catch (error) {
      console.error('Error fetching marketplace data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    // Filter items
    let filtered = items;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.seller.business_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (locationFilter) {
      filtered = filtered.filter(item =>
        item.seller.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter(item => {
        // Handle optional pricing for services
        if (item.type === 'service' && !item.price) return true;
        
        const price = item.price || 0;
        const min = priceRange.min ? parseFloat(priceRange.min) : 0;
        const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
        return price >= min && price <= max;
      });
    }

    // Apply tab filter
    if (activeTab === 'products') {
      filtered = filtered.filter(item => item.type === 'product');
    } else if (activeTab === 'services') {
      filtered = filtered.filter(item => item.type === 'service');
    }

    setFilteredItems(filtered);

    // Filter sellers
    let filteredSellersData = sellers;

    if (searchTerm) {
      filteredSellersData = filteredSellersData.filter(seller =>
        seller.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (locationFilter) {
      filteredSellersData = filteredSellersData.filter(seller =>
        seller.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    setFilteredSellers(filteredSellersData);
  };

  const updateActiveFilters = () => {
    const filters = [];
    if (searchTerm) filters.push(`Search: ${searchTerm}`);
    if (selectedCategory) filters.push(`Category: ${selectedCategory}`);
    if (locationFilter) filters.push(`Location: ${locationFilter}`);
    if (priceRange.min) filters.push(`Min: $${priceRange.min}`);
    if (priceRange.max) filters.push(`Max: $${priceRange.max}`);
    setActiveFilters(filters);
  };

  const clearFilter = (filterText: string) => {
    if (filterText.startsWith('Search:')) {
      setSearchTerm('');
    } else if (filterText.startsWith('Category:')) {
      setSelectedCategory('');
    } else if (filterText.startsWith('Location:')) {
      setLocationFilter('');
    } else if (filterText.startsWith('Min:')) {
      setPriceRange(prev => ({ ...prev, min: '' }));
    } else if (filterText.startsWith('Max:')) {
      setPriceRange(prev => ({ ...prev, max: '' }));
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setLocationFilter('');
    setPriceRange({ min: '', max: '' });
  };

  const handleContactSeller = (seller: Seller, itemName?: string) => {
    const message = itemName 
      ? `Hi! I'm interested in your ${itemName}. Can you provide more details?`
      : `Hi! I found your business on SellCard. I'm interested in your products/services.`;
    const whatsappUrl = `https://wa.me/${seller.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const tabs = [
    { id: 'all', label: 'All', icon: Store, count: items.length },
    { id: 'products', label: 'Products', icon: Package, count: items.filter(i => i.type === 'product').length },
    { id: 'services', label: 'Services', icon: Users, count: items.filter(i => i.type === 'service').length },
    { id: 'sellers', label: 'Shops', icon: Store, count: sellers.length },
  ];

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

  return (
    <div className="min-h-screen">
      <Header />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8"
      >
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
            Marketplace
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300">
            Discover amazing products and services from local businesses
          </p>
        </div>

        {/* Mobile-First Tab Navigation */}
        <div className="mb-6">
          <div className="flex overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex space-x-2 min-w-max sm:justify-center sm:w-full">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap touch-target ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <tab.icon size={18} />
                  <span>{tab.label}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {tab.count}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search products, services, or sellers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Mobile Filter Button & Active Filters */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors touch-target"
            >
              <SlidersHorizontal size={20} />
              <span>Filters</span>
              {activeFilters.length > 0 && (
                <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
                  {activeFilters.length}
                </span>
              )}
            </button>
            
            {activeFilters.length > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium touch-target"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Active Filter Chips */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {activeFilters.map((filter, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
                >
                  <span>{filter}</span>
                  <button
                    onClick={() => clearFilter(filter)}
                    className="ml-2 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-1 touch-target"
                  >
                    <X size={12} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {/* Expandable Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location
                    </label>
                    <select
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">All Locations</option>
                      {nigerianCities.map(city => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range */}
                  {activeTab !== 'sellers' && (
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Price Range
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2 w-full">
                        <input
                          type="number"
                          placeholder="Min"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                          className="w-full sm:w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-0"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                          className="w-full sm:w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-0"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'all' ? (
            /* All Items View - Three Sections */
            <motion.div
              key="all-sections"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8 sm:space-y-12"
            >
              {/* Featured Shops Section */}
              <section>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Award className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Featured Shops</h2>
                  </div>
                  <button
                    onClick={() => setActiveTab('sellers')}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm sm:text-base touch-target"
                  >
                    View All →
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <div className="flex space-x-4 sm:space-x-6 pb-4">
                    {featuredSellers.map((seller, index) => (
                      <motion.div
                        key={seller.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex-shrink-0 w-72 sm:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
                      >
                        <Link to={`/shop/${seller.id}`}>
                          {seller.cover_image_url && (
                            <div className="h-24 sm:h-32 overflow-hidden">
                              <img
                                src={seller.cover_image_url}
                                alt={seller.business_name}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 text-sm sm:text-base">
                                {seller.business_name}
                              </h3>
                              {seller.is_verified && (
                                <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
                                  Verified
                                </span>
                              )}
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mb-3 line-clamp-2">
                              {seller.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 mr-1" />
                                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                  {seller.rating.toFixed(1)} ({seller.total_reviews})
                                </span>
                              </div>
                              {seller.location && (
                                <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  <span className="truncate max-w-20">{seller.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Latest Products Section */}
              <section>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Latest Products</h2>
                  </div>
                  <button
                    onClick={() => setActiveTab('products')}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm sm:text-base touch-target"
                  >
                    View All →
                  </button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {latestProducts.map((product, index) => (
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
                        
                        <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-1 sm:line-clamp-2">
                          {product.description}
                        </p>
                        
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                          <span className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">
                            ${product.price}
                          </span>
                          {/* Mobile-only View button */}
                          <Link
                            to={`/product/${product.id}`}
                            className="sm:hidden bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center text-xs"
                          >
                            View
                          </Link>
                          {/* Hide category on mobile, show on larger screens */}
                          <span className="hidden sm:inline-block bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-xs">
                            {product.category} 
                          </span>
                        </div>
                        
                        <div className="flex space-x-1 sm:space-x-2">
                          <Link
                            to={`/product/${product.id}`}
                            className="hidden sm:flex flex-1 bg-blue-600 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors text-center text-xs sm:text-sm"
                          >
                            View
                          </Link>
                          {/* Hide contact button on mobile, show on larger screens */}
                          <button
                            onClick={() => handleContactSeller(product.seller, product.name)}
                            className="hidden sm:flex flex-1 bg-green-600 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-green-700 transition-colors text-center text-xs sm:text-sm"
                          >
                            Contact
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Available Services Section */}
              <section>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Available Services</h2>
                  </div>
                  <button
                    onClick={() => setActiveTab('services')}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm sm:text-base touch-target"
                  >
                    View All →
                  </button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {availableServices.map((service, index) => (
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
                        
                        <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-1 sm:line-clamp-2">
                          {service.description}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-3 gap-2">
                          <div className="flex items-center justify-between w-full sm:w-auto">
                            {service.price ? (
                              <span className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
                                ${service.price}
                              </span>
                            ) : (
                              <span className="text-sm sm:text-base font-medium text-green-600 dark:text-green-400">
                                Custom Pricing
                              </span>
                            )}
                            
                            {/* Mobile-only View button */}
                            <Link
                              to={`/service/${service.id}`}
                              className="sm:hidden bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-center text-xs"
                            >
                              View
                            </Link>
                          </div>
                          
                          <div className="flex items-center justify-between gap-2">
                            {service.duration_days && (
                              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <Calendar className="h-3 w-3 mr-1" />
                                Delivers in {service.duration_days} days
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Desktop buttons */}
                        <div className="hidden sm:flex space-x-2">
                          <Link
                            to={`/service/${service.id}`}
                            className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-center text-sm"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleContactSeller(service.seller, service.name)}
                            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center text-sm"
                          >
                            Contact
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            </motion.div>
          ) : activeTab === 'sellers' ? (
            /* Sellers Grid */
            <motion.div
              key="sellers"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-300">
                  {filteredSellers.length} shop{filteredSellers.length !== 1 ? 's' : ''} found
                </p>
              </div>

              {filteredSellers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredSellers.map((seller, index) => (
                    <motion.div
                      key={seller.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
                    >
                      <Link to={`/shop/${seller.id}`}>
                        {seller.cover_image_url && (
                          <div className="aspect-video overflow-hidden">
                            <img
                              src={seller.cover_image_url}
                              alt={seller.business_name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        
                        <div className="p-4 sm:p-6">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                              {seller.business_name}
                            </h3>
                            {seller.is_verified && (
                              <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
                                Verified
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                            {seller.description}
                          </p>
                          
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 mr-1" />
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                {seller.rating.toFixed(1)} ({seller.total_reviews})
                              </span>
                            </div>
                            {seller.location && (
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <MapPin className="h-3 w-3 mr-1" />
                                <span className="truncate max-w-24">{seller.location}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              {seller.view_count} views
                            </div>
                            <span>{seller.total_sales} sales</span>
                          </div>
                        </div>
                      </Link>
                      
                      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                        <button
                          onClick={() => handleContactSeller(seller)}
                          className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center touch-target"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Contact Seller
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No shops found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Try adjusting your search terms or filters
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            /* Items Grid */
            <motion.div
              key="items"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-300">
                  {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
                </p>
              </div>

              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {filteredItems.map((item, index) => (
                    <motion.div
                      key={`${item.type}-${item.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
                    >
                      {item.images.length > 0 && (
                        <div className="aspect-square sm:aspect-video overflow-hidden">
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      
                      <div className="p-3 sm:p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 text-sm sm:text-base">
                            {item.name}
                          </h3>
                          <div className="flex items-center">
                            {item.type === 'product' ? (
                              <Package className="h-4 w-4 text-blue-500" />
                            ) : (
                              <Users className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-1 sm:line-clamp-2">
                          {item.description}
                        </p>
                        
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                          <div className="flex items-center gap-2 justify-between w-full sm:w-auto">
                            {item.price ? (
                              <span className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">
                                ${item.price}
                              </span>
                            ) : (
                              <span className="text-sm sm:text-base font-medium text-blue-600 dark:text-blue-400">
                                Custom Pricing
                              </span>
                            )}
                            {/* Mobile-only View button */}
                            <Link
                              to={`/${item.type}/${item.id}`}
                              className="sm:hidden bg-blue-600 text-white px-2 py-1 rounded-lg hover:bg-blue-700 transition-colors text-center text-xs"
                            >
                              View
                            </Link>
                          </div>
                          {item.type === 'service' && 'duration_days' in item && item.duration_days && (
                            <div className="hidden sm:flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <Calendar className="h-3 w-3 mr-1" />
                              Delivers in {item.duration_days} days
                            </div>
                          )}
                        </div>
                        
                        {/* Seller Info - Simplified on mobile */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mb-2 sm:mb-3">
                          <Link to={`/shop/${item.seller.id}`} className="block hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="max-w-[70%]">
                                <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                                  {item.seller.business_name}
                                </p>
                                {item.seller.location && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center truncate">
                                    <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                    <span className="truncate">{item.seller.location}</span>
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center">
                                <Star className="h-3 w-3 text-yellow-400 mr-1" />
                                <span className="text-xs text-gray-600 dark:text-gray-300">
                                  {item.seller.rating.toFixed(1)}
                                </span>
                              </div>
                            </div>
                          </Link>
                        </div>
                        
                        {/* Stats - Hidden on mobile */}
                        <div className="hidden sm:flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                          <div className="flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            {item.view_count} views
                          </div>
                          {item.type === 'product' && 'stock_quantity' in item && (
                            <span>Stock: {item.stock_quantity}</span>
                          )}
                        </div>
                        
                        {/* Desktop buttons */}
                        <div className="hidden sm:flex space-x-2">
                          <Link
                            to={`/${item.type}/${item.id}`}
                            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center text-sm"
                          >
                            View Details
                          </Link>
                          <button
                            onClick={() => handleContactSeller(item.seller, item.name)}
                            className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-center text-sm flex items-center justify-center"
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Contact
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 dark:text-gray-500 mb-4">
                    <Search className="h-16 w-16 mx-auto mb-4" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No items found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Try adjusting your search terms or filters
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <Footer />
    </div>
  );
};

export default Marketplace;