import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, MessageSquare, Tag, Upload, Instagram, Globe, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import ImageUpload from '../components/ImageUpload';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const CreateProfile: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    whatsappNumber: '',
    category: '',
    images: [] as string[],
    contactMethods: {
      instagram: '',
      tiktok: '',
      phone: '',
      email: '',
      website: ''
    }
  });

  const categories = [
    'Fashion',
    'Electronics',
    'Food & Beverages',
    'Beauty & Personal Care',
    'Home & Garden',
    'Services',
    'Other'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactMethodChange = (method: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contactMethods: {
        ...prev.contactMethods,
        [method]: value
      }
    }));
  };

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({
      ...prev,
      images
    }));
  };

  const getProgress = () => {
    let progress = 0;
    if (formData.businessName) progress += 25;
    if (formData.description) progress += 25;
    if (formData.whatsappNumber) progress += 25;
    if (formData.images.length > 0) progress += 25;
    return progress;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.businessName || !formData.description || !formData.whatsappNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setLoading(true);

    try {
      const editToken = Math.random().toString(36).substring(2, 15);
      
      // Filter out empty contact methods
      const contactMethods = Object.entries(formData.contactMethods)
        .filter(([_, value]) => value.trim() !== '')
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
      
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            business_name: formData.businessName,
            description: formData.description,
            whatsapp_number: formData.whatsappNumber,
            category: formData.category || 'Other',
            images: formData.images,
            contact_methods: contactMethods,
            edit_token: editToken,
            view_count: 0
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast.success('Profile created successfully!');
      navigate(`/success/${data.id}`);
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error('Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 transition-colors">
            <ArrowLeft size={20} className="mr-2" />
            Back to Home
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Your Profile</h1>
          <p className="text-gray-600 dark:text-gray-300">Fill in your business details to create a professional profile</p>
          
          {/* Progress Bar */}
          <div className="mt-6 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              initial={{ width: 0 }}
              animate={{ width: `${getProgress()}%` }}
            ></motion.div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{getProgress()}% Complete</p>
        </div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 space-y-6"
        >
          {/* Business Name */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <label htmlFor="businessName" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User size={16} className="mr-2" />
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
              placeholder="Enter your business name"
            />
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <label htmlFor="description" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MessageSquare size={16} className="mr-2" />
              Business Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={3}
              maxLength={150}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Describe your business in a few words"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {formData.description.length}/150 characters
            </p>
          </motion.div>

          {/* WhatsApp Number */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <label htmlFor="whatsappNumber" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MessageSquare size={16} className="mr-2" />
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
              placeholder="+1234567890"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Include country code (e.g., +1234567890)
            </p>
          </motion.div>

          {/* Category */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <label htmlFor="category" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Tag size={16} className="mr-2" />
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </motion.div>

          {/* Additional Contact Methods */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Additional Contact Methods</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Instagram size={16} className="mr-2" />
                  Instagram
                </label>
                <input
                  type="text"
                  value={formData.contactMethods.instagram}
                  onChange={(e) => handleContactMethodChange('instagram', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="@username"
                />
              </div>
              
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="w-4 h-4 mr-2 font-bold text-xs flex items-center justify-center">TT</div>
                  TikTok
                </label>
                <input
                  type="text"
                  value={formData.contactMethods.tiktok}
                  onChange={(e) => handleContactMethodChange('tiktok', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="@username"
                />
              </div>
              
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Phone size={16} className="mr-2" />
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.contactMethods.phone}
                  onChange={(e) => handleContactMethodChange('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="+1234567890"
                />
              </div>
              
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Mail size={16} className="mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  value={formData.contactMethods.email}
                  onChange={(e) => handleContactMethodChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="contact@business.com"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Globe size={16} className="mr-2" />
                  Website
                </label>
                <input
                  type="url"
                  value={formData.contactMethods.website}
                  onChange={(e) => handleContactMethodChange('website', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://www.business.com"
                />
              </div>
            </div>
          </motion.div>

          {/* Images */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              <Upload size={16} className="mr-2" />
              Product/Service Images *
            </label>
            <ImageUpload
              images={formData.images}
              onImagesChange={handleImagesChange}
              maxImages={5}
            />
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="pt-6"
          >
            <motion.button
              type="submit"
              disabled={loading || getProgress() < 100}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating Profile...
                </>
              ) : (
                'Generate My Profile'
              )}
            </motion.button>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default CreateProfile;