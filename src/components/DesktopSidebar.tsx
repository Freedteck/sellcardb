import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, Plus, MessageSquare, User, Store, LogOut, Sun, Moon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ConfirmModal from './ConfirmModal';

interface DesktopSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [signOutModal, setSignOutModal] = React.useState(false);
  const [signingOut, setSigningOut] = React.useState(false);

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

  const handleSignOutConfirm = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setSigningOut(false);
      setSignOutModal(false);
    }
  };

  return (
    <>
      <div className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 transition-all duration-300 ${
        isCollapsed ? 'lg:w-16' : 'lg:w-64'
      }`}>
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            {!isCollapsed && (
              <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-3">
                <Store className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  ShopLink
                </span>
              </Link>
            )}
            {isCollapsed && (
              <Link to={user ? "/dashboard" : "/"} className="flex justify-center w-full">
                <Store className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </Link>
            )}
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronLeft className="h-5 w-5 text-gray-500" />
              )}
            </button>
          </div>

          {/* User Info */}
          {user && !isCollapsed && (
            <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
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

          {user && isCollapsed && (
            <div className="px-2 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-center">
              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  item.current
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon
                  className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 ${
                    item.current
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                  }`}
                />
                {!isCollapsed && item.name}
              </Link>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="flex-shrink-0 px-2 py-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`${isCollapsed ? 'justify-center' : ''} w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors`}
              title={isCollapsed ? (theme === 'light' ? 'Dark Mode' : 'Light Mode') : undefined}
            >
              {theme === 'light' ? (
                <Moon className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 text-gray-400`} />
              ) : (
                <Sun className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 text-gray-400`} />
              )}
              {!isCollapsed && (theme === 'light' ? 'Dark Mode' : 'Light Mode')}
            </button>

            {/* Sign Out */}
            {user && (
              <button
                onClick={() => setSignOutModal(true)}
                className={`${isCollapsed ? 'justify-center' : ''} w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors`}
                title={isCollapsed ? 'Sign Out' : undefined}
              >
                <LogOut className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5`} />
                {!isCollapsed && 'Sign Out'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      <ConfirmModal
        isOpen={signOutModal}
        onClose={() => setSignOutModal(false)}
        onConfirm={handleSignOutConfirm}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmText="Sign Out"
        cancelText="Cancel"
        type="warning"
        loading={signingOut}
      />
    </>
  );
};

export default DesktopSidebar;