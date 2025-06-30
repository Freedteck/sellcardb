import React from 'react';
import { Link } from 'react-router-dom';
import { Store } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Store className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold">ShopLink</span>
          </div>
          <p className="text-gray-400 text-center md:text-right">
            © 2025 ShopLink. Built for small business owners.
          </p>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
          <Link to="/create" className="text-blue-400 hover:text-blue-300 transition-colors">
            Create your own ShopLink
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;