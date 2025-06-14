import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Edit, Trash2, Eye, Search, Calendar, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, Service, Seller } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Services: React.FC = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    serviceId: string;
    serviceName: string;
  }>({
    isOpen: false,
    serviceId: '',
    serviceName: ''
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSellerAndServices();
    }
  }, [user]);

  const fetchSellerAndServices = async () => {
    try {
      // Get seller profile
      const { data: sellerData, error: sellerError } = await supabase
        .from('sellers')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (sellerError) throw sellerError;
      setSeller(sellerData);

      // Get services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('seller_id', sellerData.id)
        .order('created_at', { ascending: false });

      if (servicesError) throw servicesError;
      setServices(servicesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (serviceId: string, serviceName: string) => {
    setDeleteModal({
      isOpen: true,
      serviceId,
      serviceName
    });
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', deleteModal.serviceId);

      if (error) throw error;

      setServices(services.filter(s => s.id !== deleteModal.serviceId));
      toast.success('Service deleted successfully');
      setDeleteModal({ isOpen: false, serviceId: '', serviceName: '' });
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    } finally {
      setDeleting(false);
    }
  };

  const toggleAvailability = async (serviceId: string, isAvailable: boolean) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_available: !isAvailable })
        .eq('id', serviceId);

      if (error) throw error;

      setServices(services.map(s => 
        s.id === serviceId ? { ...s, is_available: !isAvailable } : s
      ));
      toast.success(`Service ${!isAvailable ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Failed to update service');
    }
  };

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.location && service.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              My Services
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your service offerings
            </p>
          </div>
          <Link
            to="/dashboard/services/new"
            className="inline-flex items-center bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl mt-4 sm:mt-0"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Service
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
              >
                {service.images.length > 0 && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={service.images[0]}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                      {service.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      service.is_available
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {service.is_available ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                    {service.description}
                  </p>
                  
                  {/* Location */}
                  {service.location && (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      {service.location}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mb-4">
                    {service.price ? (
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ${service.price}
                      </span>
                    ) : (
                      <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                        Custom Pricing
                      </span>
                    )}
                    {service.duration_days && (
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="h-4 w-4 mr-1" />
                        {service.duration_days} days
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span>{service.category}</span>
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {service.view_count}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link
                      to={`/dashboard/services/edit/${service.id}`}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center text-sm"
                    >
                      <Edit className="h-4 w-4 inline mr-1" />
                      Edit
                    </Link>
                    <button
                      onClick={() => toggleAvailability(service.id, service.is_available)}
                      className={`flex-1 px-3 py-2 rounded-lg transition-colors text-center text-sm ${
                        service.is_available
                          ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {service.is_available ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleDeleteClick(service.id, service.name)}
                      className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'No services found' : 'No services yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Start offering your services'
              }
            </p>
            {!searchTerm && (
              <Link
                to="/dashboard/services/new"
                className="inline-flex items-center bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Service
              </Link>
            )}
          </div>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, serviceId: '', serviceName: '' })}
        onConfirm={handleDeleteConfirm}
        title="Delete Service"
        message={`Are you sure you want to delete "${deleteModal.serviceName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleting}
      />
    </div>
  );
};

export default Services;