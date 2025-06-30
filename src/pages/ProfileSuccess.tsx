import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Copy, Share2, Edit, Eye, QrCode as QrCodeIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, Profile } from '../lib/supabase';
import Header from '../components/Header';
import QRCodeGenerator from '../components/QRCodeGenerator';
import ProfileExport from '../components/ProfileExport';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ProfileSuccess: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProfile();
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
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const copyProfileLink = async () => {
    if (!profile) return;
    
    setCopying(true);
    const profileUrl = `${window.location.origin}/profile/${profile.id}`;
    
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast.success('Profile link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    } finally {
      setCopying(false);
    }
  };

  const shareProfile = () => {
    if (!profile) return;
    
    const profileUrl = `${window.location.origin}/profile/${profile.id}`;
    const shareText = `Check out ${profile.business_name} on ShopLink`;
    
    if (navigator.share) {
      navigator.share({
        title: shareText,
        url: profileUrl,
      });
    } else {
      copyProfileLink();
    }
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
      <div className="min-h-screen">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Profile Not Found</h1>
          <Link to="/create" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
            Create a new profile
          </Link>
        </div>
      </div>
    );
  }

  const profileUrl = `${window.location.origin}/profile/${profile.id}`;
  const editUrl = `${window.location.origin}/edit/${profile.id}/${profile.edit_token}`;

  return (
    <div className="min-h-screen">
      <Header />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-4"
          >
            <CheckCircle size={64} className="text-green-500" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Profile Created Successfully!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Your professional ShopLink is ready to share with the world
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8"
            >
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {profile.business_name}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{profile.description}</p>
                
                {profile.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                    {profile.images.slice(0, 3).map((image, index) => (
                      <motion.img
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        src={image}
                        alt={`${profile.business_name} ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {/* Profile Link */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Profile Link
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={profileUrl}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    <motion.button
                      onClick={copyProfileLink}
                      disabled={copying}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                    >
                      {copying ? <LoadingSpinner size="sm" /> : <Copy size={16} />}
                    </motion.button>
                  </div>
                </div>

                {/* Edit Link */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <label className="block text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                    Edit Link (Save this to update your profile later)
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={editUrl}
                      readOnly
                      className="flex-1 px-3 py-2 border border-yellow-300 dark:border-yellow-600 rounded-l-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    />
                    <motion.button
                      onClick={() => navigator.clipboard.writeText(editUrl)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-orange-600 text-white rounded-r-lg hover:bg-orange-700 transition-colors"
                    >
                      <Copy size={16} />
                    </motion.button>
                  </div>
                  <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                    ⚠️ Keep this link safe! You'll need it to edit your profile.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Export Options */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Export Your Profile</h3>
              <ProfileExport profile={profile} profileUrl={profileUrl} />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* QR Code */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <QRCodeGenerator url={profileUrl} businessName={profile.business_name} />
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="space-y-3"
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to={`/profile/${profile.id}`}
                  className="flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors w-full"
                >
                  <Eye size={20} className="mr-2" />
                  View Profile
                </Link>
              </motion.div>
              
              <motion.button
                onClick={shareProfile}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors w-full"
              >
                <Share2 size={20} className="mr-2" />
                Share Profile
              </motion.button>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to={`/edit/${profile.id}/${profile.edit_token}`}
                  className="flex items-center justify-center bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors w-full"
                >
                  <Edit size={20} className="mr-2" />
                  Edit Profile
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8"
        >
          <Link
            to="/create"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
          >
            Create another profile
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProfileSuccess;