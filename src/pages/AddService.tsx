import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, DollarSign, Tag, FileText, Calendar, ArrowLeft, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Seller } from '../lib/supabase';
import Header from '../components/Header';
import ImageUpload from '../components/ImageUpload';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AddService: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    images: [] as string[],
    durationDays: '',
    location: '',
  });

  const categories = [
    'Consulting',
    'Design & Creative',
    'Digital Marketing',
    'Writing & Translation',
    'Video & Animation',
    'Music & Audio',
    'Programming & Tech',
    'Business',
    'Lifestyle',
    'Health & Fitness',
    'Education & Training',
    'Home Services',
    'Beauty & Wellness',
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
      
      // Pre-fill location from seller profile
      setFormData(prev => ({
        ...prev,
        location: data.location || ''
      }));
    } catch (error) {
      console.error('Error fetching seller:', error);
      navigate('/dashboard');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({
      ...prev,
      images
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.images.length === 0) {
      toast.error('Please upload at least one service image');
      return;
    }

    if (!seller) {
      toast.error('Seller profile not found');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('services')
        .insert([
          {
            seller_id: seller.id,
            name: formData.name,
            description: formData.description,
            price: formData.price ? parseFloat(formData.price) : null,
            category: formData.category,
            images: formData.images,
            duration_days: parseInt(formData.durationDays) || null,
            location: formData.location || seller.location || null,
            is_available: true,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast.success('Service added successfully!');
      navigate('/dashboard/services');
    } catch (error) {
      console.error('Error adding service:', error);
      toast.error('Failed to add service. Please try again.');
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
          <button
            onClick={() => navigate('/dashboard/services')}
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Services
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Add New Service</h1>
          <p className="text-gray-600 dark:text-gray-300">Add a new service to your offerings</p>
        </div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 space-y-6"
        >
          {/* Service Name */}
          <div>
            <label htmlFor="name" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Users size={16} className="mr-2" />
              Service Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter service name"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FileText size={16} className="mr-2" />
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Describe your service in detail"
            />
          </div>

          {/* Price, Duration, and Location */}
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="price" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign size={16} className="mr-2" />
                Price (Optional)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0.00 (Leave empty for custom pricing)"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Leave empty if pricing varies or is negotiable
              </p>
            </div>

            <div>
              <label htmlFor="durationDays" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar size={16} className="mr-2" />
                Duration (days)
              </label>
              <input
                type="number"
                id="durationDays"
                name="durationDays"
                value={formData.durationDays}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="7"
              />
            </div>

            <div>
              <label htmlFor="location" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin size={16} className="mr-2" />
                Location
              </label>
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select location</option>
                {nigerianCities.map(city => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {seller?.location ? `Default: ${seller.location}` : 'Will use your shop location if not specified'}
              </p>
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Tag size={16} className="mr-2" />
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Service Images *
            </label>
            <ImageUpload
              images={formData.images}
              onImagesChange={handleImagesChange}
              maxImages={5}
            />
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Adding Service...
                </>
              ) : (
                'Add Service'
              )}
            </motion.button>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default AddService;