import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, MessageCircle, Phone, Mail, Globe, Instagram, MapPin, Star, Eye, Share2, Download } from 'lucide-react';
import { supabase, Seller, Product, Service } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';

const BusinessCardView: React.FC = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const qrCanvasRef = React.useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (sellerId) {
      fetchSellerData();
      incrementViewCount();
    }
  }, [sellerId]);

  useEffect(() => {
    if (seller && qrCanvasRef.current) {
      generateQRCode();
    }
  }, [seller]);

  const fetchSellerData = async () => {
    try {
      // Get seller profile
      const { data: sellerData, error: sellerError } = await supabase
        .from('sellers')
        .select('*')
        .eq('id', sellerId)
        .eq('is_active', true)
        .single();

      if (sellerError) throw sellerError;
      setSeller(sellerData);

      // Get featured products and services
      const [productsResult, servicesResult] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .eq('seller_id', sellerId)
          .eq('is_available', true)
          .order('view_count', { ascending: false })
          .limit(2),
        supabase
          .from('services')
          .select('*')
          .eq('seller_id', sellerId)
          .eq('is_available', true)
          .order('view_count', { ascending: false })
          .limit(2)
      ]);

      setProducts(productsResult.data || []);
      setServices(servicesResult.data || []);
    } catch (error) {
      console.error('Error fetching seller data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    if (!qrCanvasRef.current || !seller) return;
    
    try {
      const shopUrl = `${window.location.origin}/shop/${seller.id}`;
      
      await QRCode.toCanvas(qrCanvasRef.current, shopUrl, {
        width: 180,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      });
      
      const dataUrl = qrCanvasRef.current.toDataURL('image/png');
      setQrCodeUrl(dataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const incrementViewCount = async () => {
    try {
      await supabase.rpc('increment_seller_views', { seller_uuid: sellerId });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleContact = (method: 'whatsapp' | 'phone' | 'email' | 'shop') => {
    if (!seller) return;

    const message = `Hi! I found your business card and I'm interested in your products/services.`;
    
    switch (method) {
      case 'whatsapp':
        const whatsappUrl = `https://wa.me/${seller.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        break;
      case 'phone':
        if (seller.phone_number) {
          window.open(`tel:${seller.phone_number}`, '_blank');
        }
        break;
      case 'email':
        if (seller.email) {
          window.open(`mailto:${seller.email}?subject=Business Inquiry&body=${encodeURIComponent(message)}`, '_blank');
        }
        break;
      case 'shop':
        window.open(`/shop/${seller.id}`, '_blank');
        break;
    }
  };

  const saveContact = () => {
    if (!seller) return;

    const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${seller.business_name}
ORG:${seller.business_name}
TEL:${seller.whatsapp_number}
${seller.phone_number ? `TEL;TYPE=WORK:${seller.phone_number}` : ''}
${seller.email ? `EMAIL:${seller.email}` : ''}
${seller.website ? `URL:${seller.website}` : ''}
${seller.location ? `ADR:;;${seller.location};;;` : ''}
NOTE:${seller.description}
END:VCARD`;

    const blob = new Blob([vCard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${seller.business_name.replace(/[^a-zA-Z0-9]/g, '-')}.vcf`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Contact saved to your device!');
  };

  const shareCard = () => {
    const cardUrl = window.location.href;
    const shareText = seller ? `Check out ${seller.business_name}'s business card` : 'Check out this business card';
    
    if (navigator.share) {
      navigator.share({
        title: shareText,
        url: cardUrl,
      });
    } else {
      navigator.clipboard.writeText(cardUrl);
      toast.success('Business card link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Business Card Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300">The business card you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const shopUrl = `${window.location.origin}/shop/${seller.id}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto px-4 py-8"
      >
        {/* Business Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden mb-6">
          {/* Header with Cover */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
            {seller.cover_image_url ? (
              <>
                <img
                  src={seller.cover_image_url}
                  alt={seller.business_name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
              </>
            ) : (
              <div className="absolute inset-0 bg-black bg-opacity-10"></div>
            )}
            
            {/* Share button */}
            <button
              onClick={shareCard}
              className="absolute top-3 right-3 p-2 bg-white bg-opacity-90 text-gray-700 rounded-full hover:bg-opacity-100 transition-colors shadow-md touch-target"
            >
              <Share2 size={18} />
            </button>
          </div>
          
          {/* Business Info */}
          <div className="p-6 -mt-8 relative">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg mb-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {seller.business_name}
                  </h1>
                  {seller.is_verified && (
                    <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
                      <Star className="h-4 w-4 mr-1" />
                      Verified Business
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 leading-relaxed">
                {seller.description}
              </p>
              
              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-400" />
                  <span>{seller.rating.toFixed(1)} ({seller.total_reviews})</span>
                </div>
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  <span>{seller.view_count} views</span>
                </div>
                {seller.location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{seller.location}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Featured Items */}
            {(products.length > 0 || services.length > 0) && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Featured Items
                </h3>
                <div className="space-y-2">
                  {[...products, ...services].slice(0, 2).map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        {item.images?.[0] && (
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className="w-10 h-10 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                            {item.name}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {'category' in item ? item.category : ''}
                          </p>
                        </div>
                      </div>
                      {item.price && (
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          ₦{item.price}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Contact Actions */}
            <div className="space-y-3">
              <button
                onClick={() => handleContact('whatsapp')}
                className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center font-medium touch-target"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Contact via WhatsApp
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleContact('shop')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center touch-target"
                >
                  <Store className="h-4 w-4 mr-2" />
                  Visit Shop
                </button>
                
                <button
                  onClick={saveContact}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center touch-target"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Save Contact
                </button>
              </div>
              
              {/* Additional Contact Methods */}
              <div className="flex justify-center space-x-4 pt-2">
                {seller.phone_number && (
                  <button
                    onClick={() => handleContact('phone')}
                    className="p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors touch-target"
                  >
                    <Phone size={20} />
                  </button>
                )}
                
                {seller.email && (
                  <button
                    onClick={() => handleContact('email')}
                    className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors touch-target"
                  >
                    <Mail size={20} />
                  </button>
                )}
                
                {seller.website && (
                  <a
                    href={seller.website.startsWith('http') ? seller.website : `https://${seller.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-indigo-100  dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-900/40 transition-colors touch-target"
                  >
                    <Globe size={20} />
                  </a>
                )}
                
                {seller.instagram && (
                  <a
                    href={`https://instagram.com/${seller.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 rounded-full hover:bg-pink-200 dark:hover:bg-pink-900/40 transition-colors touch-target"
                  >
                    <Instagram size={20} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* QR Code */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Scan to Connect
          </h3>
          <div className="flex justify-center mb-4">
            <div className="bg-white p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <canvas 
                ref={qrCanvasRef}
                className="w-36 h-36"
              />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Scan to visit {seller.business_name}'s shop
          </p>
        </div>
        
        {/* Powered by ShopLink */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <Store className="h-4 w-4 mr-1" />
            <span className="text-sm">Powered by ShopLink</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default BusinessCardView;