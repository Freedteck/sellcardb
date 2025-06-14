import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, MapPin, MessageCircle, Phone, Mail, Globe, Instagram, Eye, Package, Share2 } from 'lucide-react';
import { supabase, Product, Seller } from '../lib/supabase';
import { sendWhatsAppNotification } from '../utils/whatsappNotifications';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product & { seller: Seller } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    message: '',
  });

  useEffect(() => {
    if (id) {
      fetchProduct();
      incrementViewCount();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          seller:sellers(*)
        `)
        .eq('id', id)
        .eq('is_available', true)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async () => {
    try {
      await supabase.rpc('increment_product_views', { product_uuid: id });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleContactSeller = (method: 'whatsapp' | 'phone' | 'email') => {
    if (!product) return;

    const message = `Hi! I'm interested in your product "${product.name}". Can you provide more details?`;
    
    switch (method) {
      case 'whatsapp':
        const whatsappUrl = `https://wa.me/${product.seller.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        break;
      case 'phone':
        if (product.seller.phone_number) {
          window.open(`tel:${product.seller.phone_number}`, '_blank');
        }
        break;
      case 'email':
        if (product.seller.email) {
          window.open(`mailto:${product.seller.email}?subject=Inquiry about ${product.name}&body=${encodeURIComponent(message)}`, '_blank');
        }
        break;
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inquiryForm.customerName || !inquiryForm.message) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('inquiries')
        .insert([
          {
            seller_id: product?.seller.id,
            product_id: product?.id,
            customer_name: inquiryForm.customerName,
            customer_email: inquiryForm.customerEmail || null,
            customer_phone: inquiryForm.customerPhone || null,
            message: inquiryForm.message,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Send WhatsApp notification to seller
      if (product) {
        sendWhatsAppNotification({
          sellerWhatsApp: product.seller.whatsapp_number,
          customerName: inquiryForm.customerName,
          customerPhone: inquiryForm.customerPhone,
          customerEmail: inquiryForm.customerEmail,
          itemName: product.name,
          itemType: 'product',
          message: inquiryForm.message,
          inquiryId: data.id
        });
      }

      toast.success('Inquiry sent successfully!');
      setShowInquiryForm(false);
      setInquiryForm({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        message: '',
      });
    } catch (error) {
      console.error('Error sending inquiry:', error);
      toast.error('Failed to send inquiry');
    }
  };

  const shareProduct = () => {
    const productUrl = window.location.href;
    const shareText = product ? `Check out ${product.name} on SellCard` : 'Check out this product on SellCard';
    
    if (navigator.share) {
      navigator.share({
        title: shareText,
        url: productUrl,
      });
    } else {
      navigator.clipboard.writeText(productUrl);
      toast.success('Product link copied to clipboard!');
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

  if (!product) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Product Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">The product you're looking for doesn't exist or is no longer available.</p>
          <Link to="/marketplace" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline">
            Browse other products
          </Link>
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
        <div className="mb-6">
          <Link
            to="/marketplace"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Marketplace
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
              <img
                src={product.images[0] || '/placeholder-product.jpg'}
                alt={product.name}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setSelectedImage(product.images[0])}
              />
            </div>
            
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1, 5).map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 cursor-pointer hover:opacity-75 transition-opacity"
                    onClick={() => setSelectedImage(image)}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {product.name}
                </h1>
                <button
                  onClick={shareProduct}
                  className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Share product"
                >
                  <Share2 size={20} />
                </button>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                  {product.category}
                </span>
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {product.view_count} views
                </div>
                <span>Stock: {product.stock_quantity}</span>
              </div>
              
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                ${product.price}
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Seller Info */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Sold by {product.seller.business_name}
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 mr-2" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {product.seller.rating.toFixed(1)}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">
                      ({product.seller.total_reviews} reviews)
                    </span>
                  </div>
                  {product.seller.is_verified && (
                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
                      Verified
                    </span>
                  )}
                </div>
                
                {product.seller.location && (
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <MapPin className="h-4 w-4 mr-2" />
                    {product.seller.location}
                  </div>
                )}
                
                <p className="text-gray-600 dark:text-gray-300">
                  {product.seller.description}
                </p>
              </div>
            </div>

            {/* Contact Actions */}
            <div className="space-y-3">
              <button
                onClick={() => handleContactSeller('whatsapp')}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center font-medium"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Contact via WhatsApp
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                {product.seller.phone_number && (
                  <button
                    onClick={() => handleContactSeller('phone')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </button>
                )}
                
                {product.seller.email && (
                  <button
                    onClick={() => handleContactSeller('email')}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </button>
                )}
              </div>
              
              <button
                onClick={() => setShowInquiryForm(true)}
                className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Send Inquiry
              </button>
            </div>

            {/* Additional Seller Links */}
            {(product.seller.website || product.seller.instagram) && (
              <div className="flex space-x-3">
                {product.seller.website && (
                  <a
                    href={product.seller.website.startsWith('http') ? product.seller.website : `https://${product.seller.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    <Globe className="h-4 w-4 mr-1" />
                    Website
                  </a>
                )}
                
                {product.seller.instagram && (
                  <a
                    href={`https://instagram.com/${product.seller.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors"
                  >
                    <Instagram className="h-4 w-4 mr-1" />
                    Instagram
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={selectedImage}
              alt="Product"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inquiry Modal */}
      <AnimatePresence>
        {showInquiryForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowInquiryForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Send Inquiry
              </h3>
              
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={inquiryForm.customerName}
                    onChange={(e) => setInquiryForm(prev => ({ ...prev, customerName: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={inquiryForm.customerEmail}
                    onChange={(e) => setInquiryForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={inquiryForm.customerPhone}
                    onChange={(e) => setInquiryForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Message *
                  </label>
                  <textarea
                    value={inquiryForm.message}
                    onChange={(e) => setInquiryForm(prev => ({ ...prev, message: e.target.value }))}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    placeholder="Enter your inquiry message"
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowInquiryForm(false)}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Send Inquiry
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default ProductDetail;