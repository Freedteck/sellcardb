import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Store } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <Store size={64} className="mx-auto text-gray-400 mb-4" />
          <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home size={20} className="mr-2" />
            Go Home
          </Link>
          
          <div className="text-center">
            <Link
              to="/create"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Create a new profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;