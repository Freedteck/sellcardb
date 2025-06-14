import React from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchProfiles from '../components/SearchProfiles';

const BrowseProfiles: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Discover Local Businesses
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Browse and connect with amazing businesses in your area
          </p>
        </div>

        <SearchProfiles />
      </motion.div>

      <Footer />
    </div>
  );
};

export default BrowseProfiles;