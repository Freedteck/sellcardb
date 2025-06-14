import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Filter, Search, Eye, Package, Users, Calendar, Phone, Mail, ArrowLeft, Send, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, Inquiry, Seller } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import MobileHeader from '../components/MobileHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Inquiries: React.FC = () => {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'replied' | 'closed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSellerAndInquiries();
    }
  }, [user]);

  const fetchSellerAndInquiries = async () => {
    try {
      // Get seller profile
      const { data: sellerData, error: sellerError } = await supabase
        .from('sellers')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (sellerError) throw sellerError;
      setSeller(sellerData);

      // Get inquiries
      const { data: inquiriesData, error: inquiriesError } = await supabase
        .from('inquiries')
        .select(`
          *,
          product:products(name),
          service:services(name)
        `)
        .eq('seller_id', sellerData.id)
        .order('created_at', { ascending: false });

      if (inquiriesError) throw inquiriesError;
      setInquiries(inquiriesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  const updateInquiryStatus = async (inquiryId: string, status: 'new' | 'replied' | 'closed') => {
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({ status })
        .eq('id', inquiryId);

      if (error) throw error;

      setInquiries(inquiries.map(inquiry => 
        inquiry.id === inquiryId ? { ...inquiry, status } : inquiry
      ));
      toast.success(`Inquiry marked as ${status}`);
    } catch (error) {
      console.error('Error updating inquiry:', error);
      toast.error('Failed to update inquiry');
    }
  };

  const sendReply = async (inquiry: Inquiry) => {
    if (!replyMessage.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    setSending(true);

    try {
      const itemName = inquiry.product?.name || inquiry.service?.name || 'your inquiry';
      const message = `Hi ${inquiry.customer_name}! Thank you for your inquiry about ${itemName}. ${replyMessage}`;
      
      if (inquiry.customer_phone) {
        const whatsappUrl = `https://wa.me/${inquiry.customer_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
      } else if (inquiry.customer_email) {
        const emailUrl = `mailto:${inquiry.customer_email}?subject=Re: ${itemName}&body=${encodeURIComponent(message)}`;
        window.open(emailUrl, '_blank');
      }

      // Update inquiry status to replied
      await updateInquiryStatus(inquiry.id, 'replied');
      
      toast.success('Reply sent successfully!');
      setSelectedInquiry(null);
      setReplyMessage('');
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesFilter = filter === 'all' || inquiry.status === filter;
    const matchesSearch = searchTerm === '' || 
      inquiry.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inquiry.product?.name && inquiry.product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inquiry.service?.name && inquiry.service.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

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

  if (loading) {
    return (
      <div className="min-h-screen pb-20">
        <MobileHeader title="Inquiries" showBack />
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <MobileHeader title="Customer Inquiries" showBack />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 py-6"
      >
        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search inquiries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mobile-input w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Mobile-First Scrollable Tabs */}
        <div className="mb-6">
          <div className="flex overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
            <div className="flex space-x-2 min-w-max">
              {[
                { id: 'all', label: 'All', count: inquiries.length },
                { id: 'new', label: 'New', count: inquiries.filter(i => i.status === 'new').length },
                { id: 'replied', label: 'Replied', count: inquiries.filter(i => i.status === 'replied').length },
                { id: 'closed', label: 'Closed', count: inquiries.filter(i => i.status === 'closed').length },
              ].map((filterOption) => (
                <button
                  key={filterOption.id}
                  onClick={() => setFilter(filterOption.id as any)}
                  className={`mobile-button flex items-center space-x-2 px-3 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                    filter === filterOption.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <span className="text-sm">{filterOption.label}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    filter === filterOption.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {filterOption.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          {filteredInquiries.length} inquir{filteredInquiries.length !== 1 ? 'ies' : 'y'} found
        </div>

        {/* Inquiries List */}
        {filteredInquiries.length > 0 ? (
          <div className="space-y-4">
            {filteredInquiries.map((inquiry, index) => (
              <motion.div
                key={inquiry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="mobile-card p-4 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {inquiry.customer_name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
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
                    <span className={`px-3 py-1 rounded-full text-sm font-medium self-start ${getStatusColor(inquiry.status)}`}>
                      {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                    </span>
                  </div>

                  {/* Message */}
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <p className="leading-relaxed text-sm" style={{ color: 'var(--text-primary)' }}>
                      {inquiry.message}
                    </p>
                  </div>

                  {/* Contact Info */}
                  <div className="flex flex-wrap gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                    {inquiry.customer_email && (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {inquiry.customer_email}
                      </div>
                    )}
                    {inquiry.customer_phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        {inquiry.customer_phone}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => setSelectedInquiry(inquiry)}
                      className="mobile-button bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Reply
                    </button>
                    
                    <div className="flex gap-2">
                      <select
                        value={inquiry.status}
                        onChange={(e) => updateInquiryStatus(inquiry.id, e.target.value as any)}
                        className="mobile-input flex-1 px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        <option value="new">New</option>
                        <option value="replied">Replied</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              {searchTerm || filter !== 'all' ? 'No inquiries found' : 'No inquiries yet'}
            </h3>
            <p style={{ color: 'var(--text-muted)' }}>
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter'
                : 'Customer inquiries will appear here when they contact you'
              }
            </p>
          </div>
        )}
      </motion.div>

      {/* Reply Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mobile-card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Reply to {selectedInquiry.customer_name}
              </h3>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors touch-target"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <div className="p-3 rounded-lg mb-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  <strong>Original message:</strong> {selectedInquiry.message}
                </p>
              </div>

              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your reply here..."
                rows={4}
                className="mobile-input w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedInquiry(null)}
                className="mobile-button flex-1 flex-shrink-0 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => sendReply(selectedInquiry)}
                disabled={sending || !replyMessage.trim()}
                className="mobile-button flex-grow-1 flex-shrink-0 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {sending ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Reply
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Inquiries;