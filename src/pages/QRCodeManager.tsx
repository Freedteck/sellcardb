import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Download, Eye, Copy, Share2, ArrowLeft, Package, Users, Store, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, Seller, Product, Service } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import QRCodeGenerator from '../components/QRCodeGenerator';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

interface QRCodeItem {
  id: string;
  name: string;
  type: 'shop' | 'product' | 'service' | 'card';
  url: string;
  description: string;
  scans?: number;
}

const QRCodeManager: React.FC = () => {
  const { user } = useAuth();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState<QRCodeItem | null>(null);
  const [qrItems, setQRItems] = useState<QRCodeItem[]>([]);

  useEffect(() => {
    if (user) {
      fetchSellerData();
    }
  }, [user]);

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

      // Get products and services
      const [productsResult, servicesResult] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .eq('seller_id', sellerData.id)
          .eq('is_available', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('services')
          .select('*')
          .eq('seller_id', sellerData.id)
          .eq('is_available', true)
          .order('created_at', { ascending: false })
      ]);

      setProducts(productsResult.data || []);
      setServices(servicesResult.data || []);

      // Generate QR code items
      const items: QRCodeItem[] = [
        {
          id: 'shop',
          name: 'Shop Page',
          type: 'shop',
          url: `${window.location.origin}/shop/${sellerData.id}`,
          description: 'Main shop page with all products and services',
          scans: sellerData.view_count
        },
        {
          id: 'card',
          name: 'Business Card',
          type: 'card',
          url: `${window.location.origin}/card/${sellerData.id}`,
          description: 'Mobile-optimized digital business card',
          scans: Math.floor(sellerData.view_count * 0.3)
        },
        ...productsResult.data?.map(product => ({
          id: product.id,
          name: product.name,
          type: 'product' as const,
          url: `${window.location.origin}/product/${product.id}`,
          description: `Product: ${product.description.substring(0, 50)}...`,
          scans: product.view_count
        })) || [],
        ...servicesResult.data?.map(service => ({
          id: service.id,
          name: service.name,
          type: 'service' as const,
          url: `${window.location.origin}/service/${service.id}`,
          description: `Service: ${service.description.substring(0, 50)}...`,
          scans: service.view_count
        })) || []
      ];

      setQRItems(items);
      setSelectedQR(items[0]); // Select shop QR by default
    } catch (error) {
      console.error('Error fetching seller data:', error);
      toast.error('Failed to load QR code data');
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = async (item: QRCodeItem) => {
    try {
      // Create a temporary canvas to generate QR code
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      canvas.width = 400;
      canvas.height = 500;

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add title
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(item.name, canvas.width / 2, 40);

      // Add description
      ctx.font = '16px Arial';
      ctx.fillStyle = '#6b7280';
      const words = item.description.split(' ');
      let line = '';
      let y = 70;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > 350 && n > 0) {
          ctx.fillText(line, canvas.width / 2, y);
          line = words[n] + ' ';
          y += 25;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, canvas.width / 2, y);

      // Add URL at bottom
      ctx.font = '12px Arial';
      ctx.fillStyle = '#9ca3af';
      ctx.fillText(item.url, canvas.width / 2, canvas.height - 20);

      // Download the canvas as image
      const link = document.createElement('a');
      link.download = `${seller?.business_name}-${item.name}-QR.png`;
      link.href = canvas.toDataURL();
      link.click();

      toast.success('QR code downloaded!');
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast.error('Failed to download QR code');
    }
  };

  const copyQRUrl = (item: QRCodeItem) => {
    navigator.clipboard.writeText(item.url);
    toast.success('URL copied to clipboard!');
  };

  const shareQR = (item: QRCodeItem) => {
    if (navigator.share) {
      navigator.share({
        title: `${seller?.business_name} - ${item.name}`,
        url: item.url,
      });
    } else {
      copyQRUrl(item);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'shop':
        return Store;
      case 'product':
        return Package;
      case 'service':
        return Users;
      case 'card':
        return CreditCard;
      default:
        return QrCode;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'shop':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
      case 'product':
        return 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400';
      case 'service':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400';
      case 'card':
        return 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400';
    }
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
          <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Shop Found</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Please set up your shop first to generate QR codes.</p>
          <Link to="/setup-shop" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline">
            Set up your shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Dashboard
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            QR Code Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Generate and manage QR codes for your shop, products, and services
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* QR Code List */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Available QR Codes
              </h3>
              
              <div className="space-y-3">
                {qrItems.map((item) => {
                  const Icon = getTypeIcon(item.type);
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedQR(item)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedQR?.id === item.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${getTypeColor(item.type)}`}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate">
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                            {item.description}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                              {item.type}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {item.scans} scans
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* QR Code Preview and Actions */}
          <div className="lg:col-span-2">
            {selectedQR && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {selectedQR.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      {selectedQR.description}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(selectedQR.type)}`}>
                    {selectedQR.type.charAt(0).toUpperCase() + selectedQR.type.slice(1)}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* QR Code */}
                  <div className="flex flex-col items-center">
                    <div className="bg-white p-6 rounded-xl shadow-lg mb-4">
                      <QRCodeGenerator url={selectedQR.url} businessName={seller.business_name} />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                      Scan to visit: {selectedQR.name}
                    </p>
                  </div>

                  {/* Actions and Info */}
                  <div className="space-y-6">
                    {/* Stats */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Statistics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Total Scans:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{selectedQR.scans}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Type:</span>
                          <span className="font-medium text-gray-900 dark:text-white capitalize">{selectedQR.type}</span>
                        </div>
                      </div>
                    </div>

                    {/* URL */}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Target URL</h4>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={selectedQR.url}
                          readOnly
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        />
                        <button
                          onClick={() => copyQRUrl(selectedQR)}
                          className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title="Copy URL"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <button
                        onClick={() => downloadQR(selectedQR)}
                        className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download QR Code
                      </button>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => shareQR(selectedQR)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </button>
                        
                        <a
                          href={selectedQR.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Usage Tips */}
                <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Usage Tips</h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                    <li>• Print QR codes on business cards, flyers, or posters</li>
                    <li>• Add QR codes to your social media profiles</li>
                    <li>• Use different QR codes to track which marketing channels work best</li>
                    <li>• Place QR codes in your physical store or at events</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default QRCodeManager;