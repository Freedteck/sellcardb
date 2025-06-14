import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import MobileBottomNav from './components/MobileBottomNav';
import DesktopSidebar from './components/DesktopSidebar';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import SetupShop from './pages/SetupShop';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import Services from './pages/Services';
import AddService from './pages/AddService';
import EditService from './pages/EditService';
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <ThemeProvider>
      <AuthProvider>
        <ErrorBoundary>
          <Router>
            <div className="min-h-screen bg-pattern-subtle" style={{ backgroundColor: 'var(--bg-primary)' }}>
              {/* Desktop Sidebar */}
              <DesktopSidebar 
                isCollapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
              
              {/* Main Content */}
              <div className={`transition-all duration-300 ${
                sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
              }`}>
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
                  <Route path="/dashboard/products/edit/:id" element={
                    <ProtectedRoute>
                      <EditProduct />
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
                  <Route path="/dashboard/services/edit/:id" element={
                    <ProtectedRoute>
                      <EditService />
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
              </div>
              
              {/* Mobile Bottom Navigation */}
              <MobileBottomNav />
              
              {/* Toast Notifications */}
              <Toaster 
                position="top-center"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    boxShadow: 'var(--shadow-lg)',
                  },
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