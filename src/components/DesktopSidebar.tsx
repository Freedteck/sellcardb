import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, Plus, MessageSquare, User, Store, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const DesktopSidebar: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navigation = [
    {
      name: 'Home',
      href: user ? '/dashboard' : '/',
      icon: Home,
      current: location.pathname === '/' || location.pathname === '/dashboard'
    },
    {
      name: 'Browse',
      href: '/marketplace',
      icon: Search,
      current: location.pathname.startsWith('/marketplace')
    },
    {
      name: 'Add Product',
      href: user ? '/dashboard/products/new' : '/signup',
      icon: Plus,
      current: location.pathname.includes('/products/new')
    },
    {
      name: 'Messages',
      href: user ? '/dashboard/inquiries' : '/login',
      icon: MessageSquare,
      current: location.pathname.includes('/inquiries')
    },
    {
      name: 'Profile',
      href: user ? '/dashboard/settings' : '/login',
      icon: User,
      current: location.pathname.includes('/settings')
    }
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
      <div className="flex flex-col flex-grow bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-6 py-4">
          <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-3">
            <Store className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              SellCard
            </span>
          </Link>
        </div>

        {/* User Info */}
        {user && (
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.email?.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                item.current
                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 ${
                  item.current
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                }`}
              />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            {theme === 'light' ? (
              <Moon className="mr-3 h-5 w-5 text-gray-400" />
            ) : (
              <Sun className="mr-3 h-5 w-5 text-gray-400" />
            )}
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>

          {/* Sign Out */}
          {user && (
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesktopSidebar;