import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Store, User, Lock, Bell, BarChart3, Upload, Save, ArrowLeft, Eye, Download, Calendar, MapPin, Phone, Mail, Globe, Instagram, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, Seller } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';
import ImageUpload from '../components/ImageUpload';
import LoadingSpinner from '../components/LoadingSpinner';
import ThemeToggle from '../components/ThemeToggle';
import toast from 'react-hot-toast';

const ShopSettings: React.FC = () => {
  const { user, signOut } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'shop' | 'account' | 'stats'>('shop');
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    whatsappNumber: '',
    phoneNumber: '',
    email: '',
    website: '',
    instagram: '',
    tiktok: '',
    location: '',
    coverImages: [] as string[],
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      fetchSeller();
    }
  }, [user]);

  const fetchSeller = async () => {
    try {
      const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      
      setSeller(data);
      setFormData({
        businessName: data.business_name,
        description: data.description,
        whatsappNumber: data.whatsapp_number,
        phoneNumber: data.phone_number || '',
        email: data.email || '',
        website: data.website || '',
        instagram: data.instagram || '',
        tiktok: data.tiktok || '',
        location: data.location || '',
        coverImages: data.cover_image_url ? [data.cover_image_url] : [],
      });
    } catch (error) {
      console.error('Error fetching seller:', error);
      toast.error('Failed to load shop settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({
      ...prev,
      coverImages: images
    }));
  };

  const handleShopInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.businessName || !formData.description || !formData.whatsappNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('sellers')
        .update({
          business_name: formData.businessName,
          description: formData.description,
          whatsapp_number: formData.whatsappNumber,
          phone_number: formData.phoneNumber || null,
          email: formData.email || null,
          website: formData.website || null,
          instagram: formData.instagram || null,
          tiktok: formData.tiktok || null,
          location: formData.location || null,
          cover_image_url: formData.coverImages[0] || null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast.success('Shop information updated successfully!');
      fetchSeller(); // Refresh data
    } catch (error) {
      console.error('Error updating shop info:', error);
      toast.error('Failed to update shop information');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast.success('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      try {
        await signOut();
        navigate('/');
      } catch (error) {
        console.error('Error signing out:', error);
        toast.error('Failed to sign out');
      }
    }
  };

  const exportData = async (format: 'csv' | 'json') => {
    try {
      const [productsResult, servicesResult] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .eq('seller_id', seller?.id),
        supabase
          .from('services')
          .select('*')
          .eq('seller_id', seller?.id)
      ]);

      const data = {
        shop: seller,
        products: productsResult.data || [],
        services: servicesResult.data || [],
        exported_at: new Date().toISOString()
      };

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${seller?.business_name}-data.json`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        // Simple CSV export for products
        const csvContent = [
          'Name,Description,Price,Category,Stock,Available',
          ...data.products.map(p => 
            `"${p.name}","${p.description}",${p.price},"${p.category}",${p.stock_quantity},${p.is_available}`
          )
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${seller?.business_name}-products.csv`;
        link.click();
        URL.revokeObjectURL(url);
      }

      toast.success(`Data exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-20">
        <Header />
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'shop', label: 'Shop Info', icon: Store },
    { id: 'account', label: 'Account', icon: User },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen pb-20">
      <Header />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Dashboard
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Shop Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your shop information and account settings
          </p>
        </div>

        {/* Mobile Tabs */}
        <div className="mb-6">
          <div className="flex overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
            <div className="flex space-x-2 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`mobile-button flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <tab.icon size={16} />
                  <span className="text-sm">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'shop' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Shop Information
            </h2>

            <form onSubmit={handleShopInfoSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="businessName" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Store size={16} className="mr-2" />
                    Business Name *
                  </label>
                  <input
                    type="text"
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <MapPin size={16} className="mr-2" />
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="City, State/Country"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Business Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Contact Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="whatsappNumber" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Phone size={16} className="mr-2" />
                    WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    id="whatsappNumber"
                    name="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Phone size={16} className="mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Mail size={16} className="mr-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="website" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Globe size={16} className="mr-2" />
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="instagram" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Instagram size={16} className="mr-2" />
                    Instagram
                  </label>
                  <input
                    type="text"
                    id="instagram"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="@username"
                  />
                </div>

                <div>
                  <label htmlFor="tiktok" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <div className="w-4 h-4 mr-2 font-bold text-xs flex items-center justify-center">TT</div>
                    TikTok
                  </label>
                  <input
                    type="text"
                    id="tiktok"
                    name="tiktok"
                    value={formData.tiktok}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="@username"
                  />
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Shop Cover Image
                </label>
                <ImageUpload
                  images={formData.coverImages}
                  onImagesChange={handleImagesChange}
                  maxImages={1}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {saving ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={20} className="mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {activeTab === 'account' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Profile Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Account Settings
              </h2>
              
              <div className="space-y-6">
                {/* Theme Toggle */}
                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Theme</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Choose your preferred theme</p>
                  </div>
                  <ThemeToggle />
                </div>

                {/* Profile Info */}
                <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">Email:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{user?.email}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">Account created:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {seller && new Date(seller.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">Verification status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    seller?.is_verified 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {seller?.is_verified ? 'Verified' : 'Pending'}
                  </span>
                </div>

                {/* Sign Out Button */}
                <div className="pt-6">
                  <button
                    onClick={handleSignOut}
                    className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center"
                  >
                    <LogOut size={20} className="mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Change Password
              </h2>

              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label htmlFor="currentPassword" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Lock size={16} className="mr-2" />
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {saving ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock size={20} className="mr-2" />
                      Update Password
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {activeTab === 'stats' && seller && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Shop Statistics
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {seller.rating.toFixed(1)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Average Rating</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {seller.total_reviews} reviews
                  </p>
                </div>

                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {seller.total_sales}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total Sales</p>
                </div>

                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                    {seller.view_count}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Profile Views</p>
                </div>

                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                    {new Date(seller.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Member Since</p>
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Export & Backup
              </h2>

              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  Export your shop data for backup or analysis purposes.
                </p>

                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => exportData('json')}
                    className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download size={20} className="mr-2" />
                    Export as JSON
                  </button>

                  <button
                    onClick={() => exportData('csv')}
                    className="flex items-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download size={20} className="mr-2" />
                    Export Products as CSV
                  </button>

                  <Link
                    to={`/shop/${seller.id}`}
                    className="flex items-center bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Eye size={20} className="mr-2" />
                    View Public Shop
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ShopSettings;