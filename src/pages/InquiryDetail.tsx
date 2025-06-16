import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageSquare, Phone, Mail, Package, Users, Calendar, Send, Check, X } from 'lucide-react';
import { supabase, Inquiry, Seller } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { formatWhatsAppResponse } from '../utils/whatsappNotifications';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const InquiryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');

  useEffect(() => {
    if (user && id) {
      fetchInquiryDetails();
    }
  }, [user, id]);

  const fetchInquiryDetails = async () => {
    try {
      // Get seller profile
      const { data: sellerData, error: sellerError } = await supabase
        .from('sellers')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (sellerError) throw sellerError;
      setSeller(sellerData);

      // Get inquiry details
      const { data: inquiryData, error: inquiryError } = await supabase
        .from('inquiries')
        .select(`
          *,
          product:products(name, price, images),
          service:services(name, price, images)
        `)
        .eq('id', id)
        .eq('seller_id', sellerData.id)
        .single();

      if (inquiryError) throw inquiryError;
      setInquiry(inquiryData);
    } catch (error) {
      console.error('Error fetching inquiry details:', error);
      toast.error('Failed to load inquiry details');
      navigate('/dashboard/inquiries');
    } finally {
      setLoading(false);
    }
  };

  const updateInquiryStatus = async (status: 'new' | 'replied' | 'closed') => {
    if (!inquiry) return;

    try {
      const { error } = await supabase
        .from('inquiries')
        .update({ status })
        .eq('id', inquiry.id);

      if (error) throw error;

      setInquiry({ ...inquiry, status });
      toast.success(`Inquiry marked as ${status}`);
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      toast.error('Failed to update inquiry status');
    }
  };

  const sendResponse = async (method: 'whatsapp' | 'email') => {
    if (!inquiry || !responseMessage.trim()) {
      toast.error('Please enter a response message');
      return;
    }

    setResponding(true);

    try {
      const itemName = inquiry.product?.name || inquiry.service?.name || 'your inquiry';
      const formattedMessage = formatWhatsAppResponse(
        inquiry.customer_name,
        itemName,
        responseMessage
      );

      if (method === 'whatsapp' && inquiry.customer_phone) {
        const whatsappUrl = `https://wa.me/${inquiry.customer_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(formattedMessage)}`;
        window.open(whatsappUrl, '_blank');
      } else if (method === 'email' && inquiry.customer_email) {
        const subject = `Re: Your inquiry about ${itemName}`;
        const emailUrl = `mailto:${inquiry.customer_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(formattedMessage)}`;
        window.open(emailUrl, '_blank');
      }

      // Update inquiry status to replied
      await updateInquiryStatus('replied');
      
      toast.success(`Response sent via ${method}!`);
      setResponseMessage('');
    } catch (error) {
      console.error('Error sending response:', error);
      toast.error('Failed to send response');
    } finally {
      setResponding(false);
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

  if (!inquiry) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Inquiry Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">The inquiry you're looking for doesn't exist.</p>
          <Link to="/dashboard/inquiries" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline">
            Back to Inquiries
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'replied':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard/inquiries"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Inquiries
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Inquiry Details
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Respond to customer inquiry
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Inquiry Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {inquiry.customer_name}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(inquiry.created_at).toLocaleDateString()}
                    </div>
                    {inquiry.product?.name && (
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-1" />
                        Product: {inquiry.product.name}
                      </div>
                    )}
                    {inquiry.service?.name && (
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        Service: {inquiry.service.name}
                      </div>
                    )}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(inquiry.status)}`}>
                  {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                </span>
              </div>

              {/* Item Details */}
              {(inquiry.product || inquiry.service) && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                    {inquiry.product ? 'Product' : 'Service'} Details
                  </h3>
                  <div className="flex items-start space-x-4">
                    {(inquiry.product?.images?.[0] || inquiry.service?.images?.[0]) && (
                      <img
                        src={inquiry.product?.images?.[0] || inquiry.service?.images?.[0]}
                        alt={inquiry.product?.name || inquiry.service?.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {inquiry.product?.name || inquiry.service?.name}
                      </h4>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        ₦{inquiry.product?.price || inquiry.service?.price}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Message */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Customer Message</h3>
                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {inquiry.message}
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Contact Information</h3>
                <div className="space-y-2">
                  {inquiry.customer_email && (
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Mail className="h-4 w-4 mr-2" />
                      {inquiry.customer_email}
                    </div>
                  )}
                  {inquiry.customer_phone && (
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Phone className="h-4 w-4 mr-2" />
                      {inquiry.customer_phone}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Response Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Send Response
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="response" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Response
                  </label>
                  <textarea
                    id="response"
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Type your response to the customer..."
                  />
                </div>

                <div className="flex space-x-3">
                  {inquiry.customer_phone && (
                    <button
                      onClick={() => sendResponse('whatsapp')}
                      disabled={responding || !responseMessage.trim()}
                      className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {responding ? (
                        <LoadingSpinner size="sm" className="mr-2" />
                      ) : (
                        <MessageSquare className="h-4 w-4 mr-2" />
                      )}
                      Send via WhatsApp
                    </button>
                  )}
                  
                  {inquiry.customer_email && (
                    <button
                      onClick={() => sendResponse('email')}
                      disabled={responding || !responseMessage.trim()}
                      className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {responding ? (
                        <LoadingSpinner size="sm" className="mr-2" />
                      ) : (
                        <Mail className="h-4 w-4 mr-2" />
                      )}
                      Send via Email
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => updateInquiryStatus('replied')}
                  disabled={inquiry.status === 'replied'}
                  className="w-full flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark as Replied
                </button>
                
                <button
                  onClick={() => updateInquiryStatus('closed')}
                  disabled={inquiry.status === 'closed'}
                  className="w-full flex items-center justify-center bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <X className="h-4 w-4 mr-2" />
                  Close Inquiry
                </button>
                
                <button
                  onClick={() => updateInquiryStatus('new')}
                  disabled={inquiry.status === 'new'}
                  className="w-full flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Mark as New
                </button>
              </div>
            </div>

            {/* Response Templates */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Responses
              </h3>
              
              <div className="space-y-2">
                {[
                  "Thank you for your interest! I'd be happy to provide more details.",
                  "This item is currently available. Would you like to place an order?",
                  "I can offer a special discount for this item. Let me know if you're interested!",
                  "Thank you for reaching out. I'll get back to you with more information shortly."
                ].map((template, index) => (
                  <button
                    key={index}
                    onClick={() => setResponseMessage(template)}
                    className="w-full text-left p-3 text-sm bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InquiryDetail;