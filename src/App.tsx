import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import SetupShop from './pages/SetupShop';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import Services from './pages/Services';
import AddService from './pages/AddService';
import Marketplace from './pages/Marketplace';
import ProductDetail from './pages/ProductDetail';
import ServiceDetail from './pages/ServiceDetail';
import ShopDetail from './pages/ShopDetail';
import Inquiries from './pages/Inquiries';
import InquiryDetail from './pages/InquiryDetail';
import ShopSettings from './pages/ShopSettings';
import BusinessCard from './pages/BusinessCard';
import BusinessCardView from './pages/BusinessCardView';
import QRCodeManager from './pages/QRCodeManager';
import QRLanding from './pages/QRLanding';
import CreateProfile from './pages/CreateProfile';
import ProfileSuccess from './pages/ProfileSuccess';
import PublicProfile from './pages/PublicProfile';
import EditProfile from './pages/EditProfile';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ErrorBoundary>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 transition-colors duration-300">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/browse" element={<Marketplace />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/service/:id" element={<ServiceDetail />} />
                <Route path="/shop/:sellerId" element={<ShopDetail />} />
                <Route path="/profile/:id" element={<PublicProfile />} />
                <Route path="/card/:sellerId" element={<BusinessCardView />} />
                <Route path="/qr/:type/:id" element={<QRLanding />} />
                
                {/* Protected routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/setup-shop" element={
                  <ProtectedRoute>
                    <SetupShop />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/products" element={
                  <ProtectedRoute>
                    <Products />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/products/new" element={
                  <ProtectedRoute>
                    <AddProduct />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/services" element={
                  <ProtectedRoute>
                    <Services />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/services/new" element={
                  <ProtectedRoute>
                    <AddService />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/inquiries" element={
                  <ProtectedRoute>
                    <Inquiries />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/inquiries/:id" element={
                  <ProtectedRoute>
                    <InquiryDetail />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/settings" element={
                  <ProtectedRoute>
                    <ShopSettings />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/business-card" element={
                  <ProtectedRoute>
                    <BusinessCard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/qr-codes" element={
                  <ProtectedRoute>
                    <QRCodeManager />
                  </ProtectedRoute>
                } />
                <Route path="/create" element={
                  <ProtectedRoute>
                    <CreateProfile />
                  </ProtectedRoute>
                } />
                <Route path="/success/:id" element={
                  <ProtectedRoute>
                    <ProfileSuccess />
                  </ProtectedRoute>
                } />
                <Route path="/edit/:id/:token" element={
                  <ProtectedRoute>
                    <EditProfile />
                  </ProtectedRoute>
                } />
                
                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster 
                position="top-center"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: 'var(--toast-bg)',
                    color: 'var(--toast-color)',
                    border: '1px solid var(--toast-border)',
                  },
                  className: 'dark:bg-gray-800 dark:text-white dark:border-gray-700',
                }}
              />
            </div>
          </Router>
        </ErrorBoundary>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;