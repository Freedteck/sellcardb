import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageCircle, Share2, Eye, Store, Copy, QrCode as QrCodeIcon, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, Profile } from '../lib/supabase';
import Footer from '../components/Footer';
import ContactMethods from '../components/ContactMethods';
import QRCodeGenerator from '../components/QRCodeGenerator';
import LoadingSpinner from '../components/LoadingSpinner';
import ThemeToggle from '../components/ThemeToggle';
import toast from 'react-hot-toast';
import {Helmet} from "react-helmet-async";

const PublicProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProfile();
      incrementViewCount();
    }
  }, [id]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async () => {
    try {
      await supabase.rpc('increment_view_count', { profile_id: id });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleWhatsAppContact = () => {
    if (!profile) return;
    
    const message = `Hi! I found your business profile on SellCard. I'm interested in your products/services.`;
    const whatsappUrl = `https://wa.me/${profile.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareProfile = () => {
    const profileUrl = window.location.href;
    const shareText = profile ? `Check out ${profile.business_name} on SellCard` : 'Check out this business on SellCard';
    
    if (navigator.share) {
      navigator.share({
        title: shareText,
        url: profileUrl,
      });
    } else {
      navigator.clipboard.writeText(profileUrl);
      toast.success('Profile link copied to clipboard!');
    }
  };

  const getContactMethods = () => {
    if (!profile?.contact_methods) return [];
    
    const methods = [];
    
    // Always include WhatsApp first
    methods.push({
      type: 'whatsapp' as const,
      value: profile.whatsapp_number,
      label: 'WhatsApp'
    });

    // Add other contact methods
    Object.entries(profile.contact_methods).forEach(([key, value]) => {
      if (value && typeof value === 'string' && value.trim()) {
        methods.push({
          type: key as any,
          value: value.trim(),
        });
      }
    });

    return methods;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Store size={64} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Profile Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">The profile you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline">
            Go back to homepage
          </Link>
        </motion.div>
      </div>
    );
  }

  const profileUrl = window.location.href;

  return (
    <div className="min-h-screen">
        <Helmet prioritizeSeoTags>
  <title>{profile.business_name}</title>

  {/* Basic Meta */}
  <meta name="description" content={profile.description} />

  {/* Open Graph Tags */}
  <meta property="og:title" content={profile.business_name} />
  <meta property="og:description" content={profile.description} />
  <meta property="og:image" content={profile.images[0]} />
  <meta property="og:url" content={window.location.href} />
  <meta property="og:type" content="profile" />

  {/* Twitter Tags */}
  <meta name="twitter:title" content={profile.business_name} />
  <meta name="twitter:description" content={profile.description} />
  <meta name="twitter:image" content={profile.images[0]} />
  <meta name="twitter:card" content="summary_large_image" />
</Helmet>
      {/* Header */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2 group">
              <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                <Store className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </motion.div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                SellCard
              </span>
            </Link>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <motion.button
                onClick={() => setShowQR(!showQR)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="Show QR Code"
              >
                <QrCodeIcon size={20} />
              </motion.button>
              <motion.button
                onClick={shareProfile}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Share2 size={20} />
                <span className="hidden sm:inline">Share</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowQR(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-sm w-full"
            >
              <QRCodeGenerator url={profileUrl} businessName={profile.business_name} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8 text-white text-center relative overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute bg-white rounded-full"
                  style={{
                    width: Math.random() * 50 + 20,
                    height: Math.random() * 50 + 20,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.1, 0.3, 0.1],
                  }}
                  transition={{
                    duration: Math.random() * 3 + 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            <div className="relative z-10">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold mb-2"
              >
                {profile.business_name}
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-blue-100 text-lg mb-4"
              >
                {profile.description}
              </motion.p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center space-x-4 text-sm"
              >
                <div className="flex items-center">
                  <Eye size={16} className="mr-1" />
                  <span>{profile.view_count} views</span>
                </div>
                {profile.category && (
                  <div className="bg-blue-400 bg-opacity-50 px-3 py-1 rounded-full">
                    {profile.category}
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* Images Gallery */}
          {profile.images.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Our Products/Services</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {profile.images.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                  >
                    <img
                      src={image}
                      alt={`${profile.business_name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
          >
            <ContactMethods methods={getContactMethods()} businessName={profile.business_name} />
          </motion.div>
        </div>

        {/* Create Your Own */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-center mt-12 p-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-white rounded-full"
                style={{
                  width: Math.random() * 100 + 50,
                  height: Math.random() * 100 + 50,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: Math.random() * 4 + 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-2">Like this profile?</h3>
            <p className="text-blue-100 mb-4">Create your own professional business profile in minutes</p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/create"
                className="inline-flex items-center bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
              >
                <Store size={20} className="mr-2" />
                Create My SellCard
              </Link>
            </motion.div>
          </div>
        </motion.div>
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

      <Footer />
    </div>
  );
};

export default PublicProfile;