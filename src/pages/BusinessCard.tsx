import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Download, Share2, Eye, Copy, QrCode, ArrowLeft, Palette, Layout, Smartphone, Monitor, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, Seller, Product, Service } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

const BusinessCard: React.FC = () => {
  const { user } = useAuth();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<'executive' | 'modern' | 'minimal' | 'elegant'>('executive');
  const [selectedColor, setSelectedColor] = useState<'blue' | 'green' | 'purple' | 'gold' | 'black'>('blue');
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop' | 'print'>('mobile');
  const [downloading, setDownloading] = useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const qrCanvasRef = React.useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (user) {
      fetchSellerData();
    }
  }, [user]);

  useEffect(() => {
    if (seller && qrCanvasRef.current) {
      generateQRCode();
    }
  }, [seller, selectedTemplate, selectedColor, previewMode]);

  const fetchSellerData = async () => {
    try {
      // Get seller profile
      const { data: sellerData, error: sellerError } = await supabase
        .from('sellers')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (sellerError) throw sellerError;
      setSeller(sellerData);

      // Get featured products and services
      const [productsResult, servicesResult] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .eq('seller_id', sellerData.id)
          .eq('is_available', true)
          .order('view_count', { ascending: false })
          .limit(2),
        supabase
          .from('services')
          .select('*')
          .eq('seller_id', sellerData.id)
          .eq('is_available', true)
          .order('view_count', { ascending: false })
          .limit(2)
      ]);

      setProducts(productsResult.data || []);
      setServices(servicesResult.data || []);
    } catch (error) {
      console.error('Error fetching seller data:', error);
      toast.error('Failed to load business card data');
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = useCallback(async () => {
    if (!qrCanvasRef.current || !seller) return;
    
    try {
      const QRCode = await import('qrcode');
      const shopUrl = `${window.location.origin}/shop/${seller.id}`;
      
      await QRCode.toCanvas(qrCanvasRef.current, shopUrl, {
        width: 300,
        margin: 1,
        color: {
          dark: selectedTemplate === 'minimal' ? '#1f2937' : '#000000',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }, [seller, selectedTemplate]);

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          primary: '#1e40af',
          secondary: '#3b82f6',
          accent: '#dbeafe',
          text: '#1e40af'
        };
      case 'green':
        return {
          primary: '#166534',
          secondary: '#22c55e',
          accent: '#dcfce7',
          text: '#166534'
        };
      case 'purple':
        return {
          primary: '#7c3aed',
          secondary: '#a855f7',
          accent: '#ede9fe',
          text: '#7c3aed'
        };
      case 'gold':
        return {
          primary: '#d97706',
          secondary: '#f59e0b',
          accent: '#fef3c7',
          text: '#d97706'
        };
      case 'black':
        return {
          primary: '#000000',
          secondary: '#374151',
          accent: '#f3f4f6',
          text: '#000000'
        };
      default:
        return {
          primary: '#1e40af',
          secondary: '#3b82f6',
          accent: '#dbeafe',
          text: '#1e40af'
        };
    }
  };

  const downloadCard = async (format: 'png' | 'pdf') => {
    if (!cardRef.current || !seller) return;
    
    setDownloading(true);
    
    try {
      // Standard business card dimensions (3.5" x 2" = 1050px x 600px at 300 DPI)
      const cardWidth = 1050;
      const cardHeight = 600;
      
      // Create a clone for rendering
      const cardClone = cardRef.current.cloneNode(true) as HTMLElement;
      cardClone.style.width = `${cardWidth}px`;
      cardClone.style.height = `${cardHeight}px`;
      cardClone.style.position = 'fixed';
      cardClone.style.top = '-9999px';
      cardClone.style.left = '-9999px';
      cardClone.style.zIndex = '-1';
      cardClone.style.transform = 'scale(1)';
      
      document.body.appendChild(cardClone);
      
      // Update QR code in clone
      const qrCanvas = cardClone.querySelector('canvas');
      if (qrCanvas && qrCanvasRef.current) {
        const qrContext = qrCanvas.getContext('2d');
        if (qrContext) {
          qrCanvas.width = 200;
          qrCanvas.height = 200;
          qrContext.drawImage(qrCanvasRef.current, 0, 0, 200, 200);
        }
      }
      
      // Capture with high quality
      const canvas = await html2canvas(cardClone, {
        backgroundColor: '#ffffff',
        scale: 3,
        useCORS: true,
        allowTaint: true,
        width: cardWidth,
        height: cardHeight,
        logging: false
      });
      
      document.body.removeChild(cardClone);
      
      if (format === 'png') {
        const link = document.createElement('a');
        link.download = `${seller.business_name.replace(/[^a-zA-Z0-9]/g, '-')}-business-card.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
        toast.success('Business card downloaded as PNG!');
      } else {
        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdf = new jsPDF('landscape', 'mm', [88.9, 50.8]);
        pdf.addImage(imgData, 'PNG', 0, 0, 88.9, 50.8);
        pdf.save(`${seller.business_name.replace(/[^a-zA-Z0-9]/g, '-')}-business-card.pdf`);
        toast.success('Business card downloaded as PDF!');
      }
    } catch (error) {
      console.error('Error downloading card:', error);
      toast.error('Failed to download business card');
    } finally {
      setDownloading(false);
    }
  };

  const shareCard = () => {
    if (!seller) return;
    
    const cardUrl = `${window.location.origin}/card/${seller.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${seller.business_name} - Business Card`,
        url: cardUrl,
      });
    } else {
      navigator.clipboard.writeText(cardUrl);
      toast.success('Business card link copied to clipboard!');
    }
  };

  const copyCardLink = () => {
    if (!seller) return;
    
    const cardUrl = `${window.location.origin}/card/${seller.id}`;
    navigator.clipboard.writeText(cardUrl);
    toast.success('Business card link copied!');
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Shop Found</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Please set up your shop first to create a business card.</p>
          <Link to="/setup-shop" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline">
            Set up your shop
          </Link>
        </div>
      </div>
    );
  }

  const colors = getColorClasses(selectedColor);
  const shopUrl = `${window.location.origin}/shop/${seller.id}`;
  const cardUrl = `${window.location.origin}/card/${seller.id}`;

  const getPreviewSize = () => {
    switch (previewMode) {
      case 'mobile':
        return 'w-full max-w-sm';
      case 'desktop':
        return 'w-full max-w-lg';
      case 'print':
        return 'w-full max-w-2xl';
      default:
        return 'w-full max-w-sm';
    }
  };

  const renderBusinessCard = () => {
    const featuredItems = [...products.slice(0, 1), ...services.slice(0, 1)];

    switch (selectedTemplate) {
      case 'executive':
        return (
          <div
            ref={cardRef}
            className="w-full bg-white shadow-2xl overflow-hidden relative"
            style={{ 
              aspectRatio: '1.75/1',
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
            }}
          >
            {/* Left Section - Business Info */}
            <div className="absolute inset-0 flex">
              <div className="w-2/3 p-8 flex flex-col justify-between text-white">
                <div>
                  <h1 className="text-3xl font-bold mb-2 tracking-wide">
                    {seller.business_name}
                  </h1>
                  <p className="text-lg opacity-90 mb-4 leading-relaxed">
                    {seller.description}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm opacity-90">
                    <span className="w-4 text-center mr-3">📱</span>
                    <span>{seller.whatsapp_number}</span>
                  </div>
                  {seller.email && (
                    <div className="flex items-center text-sm opacity-90">
                      <span className="w-4 text-center mr-3">✉️</span>
                      <span>{seller.email}</span>
                    </div>
                  )}
                  {seller.location && (
                    <div className="flex items-center text-sm opacity-90">
                      <span className="w-4 text-center mr-3">📍</span>
                      <span>{seller.location}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right Section - QR Code */}
              <div className="w-1/3 bg-white bg-opacity-95 flex flex-col items-center justify-center p-6">
                <div className="bg-white p-3 rounded-lg shadow-lg mb-3">
                  <canvas 
                    ref={qrCanvasRef}
                    width={300}
                    height={300}
                    className="w-24 h-24"
                  />
                </div>
                <p className="text-xs text-gray-600 text-center font-medium">
                  Scan to Visit Shop
                </p>
                <div className="mt-4 text-center">
                  <div className="text-xs text-gray-500 mb-1">Powered by</div>
                  <div className="text-sm font-bold" style={{ color: colors.primary }}>
                    SellCard
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'modern':
        return (
          <div
            ref={cardRef}
            className="w-full bg-white shadow-2xl overflow-hidden relative border"
            style={{ aspectRatio: '1.75/1' }}
          >
            {/* Header Strip */}
            <div 
              className="h-16 w-full"
              style={{ backgroundColor: colors.primary }}
            ></div>
            
            <div className="p-8 -mt-8 relative">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {seller.business_name}
                  </h1>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    {seller.description}
                  </p>
                  
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="w-4 text-center mr-3" style={{ color: colors.primary }}>📱</span>
                      <span>{seller.whatsapp_number}</span>
                    </div>
                    {seller.email && (
                      <div className="flex items-center text-sm text-gray-700">
                        <span className="w-4 text-center mr-3" style={{ color: colors.primary }}>✉️</span>
                        <span>{seller.email}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="ml-6 text-center">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <canvas 
                      ref={qrCanvasRef}
                      width={300}
                      height={300}
                      className="w-20 h-20"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Scan to Visit</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'minimal':
        return (
          <div
            ref={cardRef}
            className="w-full bg-white shadow-2xl overflow-hidden relative border border-gray-200"
            style={{ aspectRatio: '1.75/1' }}
          >
            <div className="p-8 h-full flex">
              <div className="flex-1 flex flex-col justify-center">
                <h1 className="text-2xl font-light text-gray-900 mb-3 tracking-wide">
                  {seller.business_name}
                </h1>
                <p className="text-gray-600 mb-6 text-sm">
                  {seller.description}
                </p>
                
                <div className="space-y-2">
                  <div className="text-sm text-gray-700">
                    {seller.whatsapp_number}
                  </div>
                  {seller.email && (
                    <div className="text-sm text-gray-700">
                      {seller.email}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center ml-8">
                <div className="border border-gray-200 p-3 rounded">
                  <canvas 
                    ref={qrCanvasRef}
                    width={300}
                    height={300}
                    className="w-20 h-20"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Visit Shop
                </p>
              </div>
            </div>
          </div>
        );

      case 'elegant':
        return (
          <div
            ref={cardRef}
            className="w-full bg-white shadow-2xl overflow-hidden relative"
            style={{ aspectRatio: '1.75/1' }}
          >
            {/* Decorative border */}
            <div 
              className="absolute inset-2 border-2 rounded"
              style={{ borderColor: colors.primary }}
            ></div>
            
            <div className="p-8 h-full flex items-center relative z-10">
              <div className="flex-1">
                <div className="text-center mb-6">
                  <h1 
                    className="text-2xl font-serif font-bold mb-2"
                    style={{ color: colors.primary }}
                  >
                    {seller.business_name}
                  </h1>
                  <div 
                    className="w-16 h-0.5 mx-auto mb-3"
                    style={{ backgroundColor: colors.secondary }}
                  ></div>
                  <p className="text-gray-600 text-sm italic">
                    {seller.description}
                  </p>
                </div>
                
                <div className="text-center space-y-1">
                  <div className="text-sm text-gray-700">
                    {seller.whatsapp_number}
                  </div>
                  {seller.email && (
                    <div className="text-sm text-gray-700">
                      {seller.email}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="ml-8 text-center">
                <div 
                  className="p-3 rounded border-2"
                  style={{ borderColor: colors.primary }}
                >
                  <canvas 
                    ref={qrCanvasRef}
                    width={300}
                    height={300}
                    className="w-20 h-20"
                  />
                </div>
                <p 
                  className="text-xs mt-2 font-medium"
                  style={{ color: colors.primary }}
                >
                  Scan to Visit
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8"
      >
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 transition-colors touch-target"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Dashboard
          </Link>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Premium Business Card
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Create your professional digital business card
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Customization Panel */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            {/* Template Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center">
                <Layout className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Template
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {[
                  { id: 'executive', name: 'Executive' },
                  { id: 'modern', name: 'Modern' },
                  { id: 'minimal', name: 'Minimal' },
                  { id: 'elegant', name: 'Elegant' }
                ].map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id as any)}
                    className={`p-2 sm:p-3 rounded-lg border-2 transition-all text-xs sm:text-sm touch-target ${
                      selectedTemplate === template.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <span className="font-medium text-gray-900 dark:text-white">
                      {template.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center">
                <Palette className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Color Theme
              </h3>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {[
                  { id: 'blue', color: 'bg-blue-600' },
                  { id: 'green', color: 'bg-green-600' },
                  { id: 'purple', color: 'bg-purple-600' },
                  { id: 'gold', color: 'bg-yellow-600' },
                  { id: 'black', color: 'bg-gray-900' }
                ].map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color.id as any)}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${color.color} border-4 transition-all touch-target ${
                      selectedColor === color.id
                        ? 'border-gray-900 dark:border-white scale-110'
                        : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Preview Mode */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Preview Size
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'mobile', label: 'Small', icon: Smartphone },
                  { id: 'desktop', label: 'Medium', icon: Monitor },
                  { id: 'print', label: 'Large', icon: Printer }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setPreviewMode(mode.id as any)}
                    className={`flex flex-col items-center p-2 sm:p-3 rounded-lg transition-all text-xs sm:text-sm touch-target ${
                      previewMode === mode.id
                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <mode.icon size={16} className="mb-1" />
                    <span>{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Download & Share
              </h3>
              <div className="space-y-2 sm:space-y-3">
                <button
                  onClick={() => downloadCard('png')}
                  disabled={downloading}
                  className="w-full flex items-center justify-center bg-blue-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors text-sm sm:text-base touch-target"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {downloading ? 'Processing...' : 'Download PNG'}
                </button>
                
                <button
                  onClick={() => downloadCard('pdf')}
                  disabled={downloading}
                  className="w-full flex items-center justify-center bg-red-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors text-sm sm:text-base touch-target"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {downloading ? 'Processing...' : 'Download PDF'}
                </button>
                
                <button
                  onClick={shareCard}
                  className="w-full flex items-center justify-center bg-green-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base touch-target"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Card
                </button>
                
                <Link
                  to={cardUrl}
                  target="_blank"
                  className="w-full flex items-center justify-center bg-purple-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base touch-target"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Card
                </Link>
              </div>
            </div>
          </div>

          {/* Business Card Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Business Card Preview
              </h3>
              
              {/* Business Card */}
              <div className="flex justify-center overflow-x-auto pb-4">
                <div className={`${getPreviewSize()} flex-shrink-0`}>
                  {renderBusinessCard()}
                </div>
              </div>
              
              <div className="mt-4 sm:mt-6 text-center">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Your card will look exactly like this when downloaded or shared
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Action Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-40">
          <div className="flex space-x-2">
            <button
              onClick={() => downloadCard('png')}
              disabled={downloading}
              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center justify-center text-sm touch-target"
            >
              <Download className="h-4 w-4 mr-1" />
              {downloading ? '...' : 'PNG'}
            </button>
            <button
              onClick={() => downloadCard('pdf')}
              disabled={downloading}
              className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors flex items-center justify-center text-sm touch-target"
            >
              <Download className="h-4 w-4 mr-1" />
              {downloading ? '...' : 'PDF'}
            </button>
            <button
              onClick={shareCard}
              className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center text-sm touch-target"
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </button>
          </div>
        </div>

        {/* Add bottom padding to account for mobile action bar */}
        <div className="lg:hidden h-20"></div>
      </motion.div>
    </div>
  );
};

export default BusinessCard;