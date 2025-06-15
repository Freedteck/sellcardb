import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Star,
  MapPin,
  MessageCircle,
  Phone,
  Mail,
  Globe,
  Instagram,
  Eye,
  Store,
  Package,
  Users,
  Calendar,
  TrendingUp,
  Award,
  Share2,
} from "lucide-react";
import { supabase, Seller, Product, Service } from "../lib/supabase";
import MobileHeader from "../components/MobileHeader";
import ReviewForm from "../components/ReviewForm";
import ReviewsList from "../components/ReviewsList";
import RatingStars from "../components/RatingStars";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

const ShopDetail: React.FC = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "products" | "services" | "reviews" | "about"
  >("products");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (sellerId) {
      fetchShopData();
      incrementViewCount();
    }
    console.log(refreshKey)
  }, [sellerId, refreshKey]);

  const fetchShopData = async () => {
    try {
      const [sellerResult, productsResult, servicesResult] = await Promise.all([
        supabase
          .from("sellers")
          .select("*")
          .eq("id", sellerId)
          .eq("is_active", true)
          .single(),
        supabase
          .from("products")
          .select("*")
          .eq("seller_id", sellerId)
          .eq("is_available", true)
          .order("created_at", { ascending: false }),
        supabase
          .from("services")
          .select("*")
          .eq("seller_id", sellerId)
          .eq("is_available", true)
          .order("created_at", { ascending: false }),
      ]);

      if (sellerResult.error) throw sellerResult.error;

      setSeller(sellerResult.data);
      setProducts(productsResult.data || []);
      setServices(servicesResult.data || []);
    } catch (error) {
      console.error("Error fetching shop data:", error);
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async () => {
    try {
      await supabase.rpc("increment_seller_views", { seller_uuid: sellerId });
    } catch (error) {
      console.error("Error incrementing view count:", error);
    }
  };

  const handleContactSeller = (method: "whatsapp" | "phone" | "email") => {
    if (!seller) return;

    const message = `Hi! I found your shop on SellCard. I'm interested in your products/services.`;

    switch (method) {
      case "whatsapp":
        const whatsappUrl = `https://wa.me/${seller.whatsapp_number.replace(
          /[^0-9]/g,
          ""
        )}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
        break;
      case "phone":
        if (seller.phone_number) {
          window.open(`tel:${seller.phone_number}`, "_blank");
        }
        break;
      case "email":
        if (seller.email) {
          window.open(
            `mailto:${
              seller.email
            }?subject=Inquiry about your shop&body=${encodeURIComponent(
              message
            )}`,
            "_blank"
          );
        }
        break;
    }
  };

  const shareShop = () => {
    const shopUrl = window.location.href;
    const shareText = seller
      ? `Check out ${seller.business_name} on SellCard`
      : "Check out this shop on SellCard";

    if (navigator.share) {
      navigator.share({
        title: shareText,
        url: shopUrl,
      });
    } else {
      navigator.clipboard.writeText(shopUrl);
      toast.success("Shop link copied to clipboard!");
    }
  };

  const handleReviewSubmitted = () => {
    // Refresh seller data to update rating
    fetchShopData();
    setRefreshKey((prev) => prev + 1)
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-20">
        <MobileHeader title="Shop" showBack />
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen pb-20">
        <MobileHeader title="Shop Not Found" showBack />
        <div className="px-4 py-16 text-center">
          <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Shop Not Found
          </h1>
          <p className="mb-4" style={{ color: "var(--text-muted)" }}>
            The shop you're looking for doesn't exist or is no longer active.
          </p>
          <Link
            to="/marketplace"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
          >
            Browse other shops
          </Link>
        </div>
      </div>
    );
  }

  const totalItems = products.length + services.length;
  const memberSince = new Date(seller.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="min-h-screen pb-20">
      <MobileHeader
        title={seller.business_name}
        showBack
        rightAction={
          <button
            onClick={shareShop}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-target"
          >
            <Share2 size={20} className="text-gray-700 dark:text-gray-300" />
          </button>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 py-6"
      >
        {/* Shop Banner */}
        <div className="mobile-card overflow-hidden mb-6">
          {/* Cover Image */}
          {seller.cover_image_url && (
            <div className="h-48 overflow-hidden relative">
              <img
                src={seller.cover_image_url}
                alt={seller.business_name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            </div>
          )}

          {/* Shop Info */}
          <div className="p-4">
            <div className="flex flex-col space-y-4">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h1
                      className="text-xl font-bold mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {seller.business_name}
                    </h1>
                    <div
                      className="flex flex-col space-y-1 text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {seller.location && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {seller.location}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Member since {memberSince}
                      </div>
                    </div>
                  </div>
                  {seller.is_verified && (
                    <div className="flex items-center bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                      <Award className="h-3 w-3 mr-1" />
                      <span className="text-xs font-medium">Verified</span>
                    </div>
                  )}
                </div>

                <p
                  className="mb-4 leading-relaxed text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  {seller.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 align-center">
                  {/* Rating Box */}
                  <div
                    className="text-center p-2 sm:p-2 rounded-lg"
                    style={{ backgroundColor: "var(--bg-tertiary)" }}
                  >
                    <div className="flex items-center mb-1">
                      <RatingStars
                        rating={seller.rating}
                        size="xs sm:sm" 
                        className="mr-1 sm:mr-2"
                      />
                      <span
                        className="text-base sm:text-lg font-bold" // Smaller text on mobile
                        style={{ color: "var(--text-primary)" }}
                      >
                        {seller.rating.toFixed(1)}
                      </span>
                    </div>
                    <p
                      className="text-2xs sm:text-xs" // Extra small on mobile
                      style={{ color: "var(--text-muted)" }}
                    >
                      {seller.total_reviews} review
                      {seller.total_reviews <=1 < 640 ? "" : "s"}
                    </p>
                  </div>

                  {/* Items Box */}
                  {/* <div
                    className="text-center p-2 sm:p-3 rounded-lg"
                    style={{ backgroundColor: "var(--bg-tertiary)" }}
                  >
                    <div className="flex items-center justify-center mb-1">
                      <Package className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 mr-1" />
                      <span
                        className="text-base sm:text-lg font-bold" // Smaller text on mobile
                        style={{ color: "var(--text-primary)" }}
                      >
                        {totalItems}
                      </span>
                    </div>
                    <p
                      className="text-2xs sm:text-xs" // Extra small on mobile
                      style={{ color: "var(--text-muted)" }}
                    >
                      {window.innerWidth < 640 ? "Items" : "Total items"}
                    </p>
                  </div> */}
                </div>
              </div>

              {/* Contact Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => handleContactSeller("whatsapp")}
                  className="mobile-button w-full bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center font-medium"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Contact via WhatsApp
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="mobile-button bg-yellow-600 text-white px-4 py-2 rounded-xl hover:bg-yellow-700 transition-colors flex items-center justify-center"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Rate Shop
                  </button>

                  {seller.phone_number && (
                    <button
                      onClick={() => handleContactSeller("phone")}
                      className="mobile-button bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </button>
                  )}

                  {seller.email && (
                    <button
                      onClick={() => handleContactSeller("email")}
                      className="mobile-button bg-gray-600 text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition-colors flex items-center justify-center"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </button>
                  )}
                </div>

                {/* Social Links */}
                {(seller.website || seller.instagram) && (
                  <div className="flex justify-center space-x-4 pt-2">
                    {seller.website && (
                      <a
                        href={
                          seller.website.startsWith("http")
                            ? seller.website
                            : `https://${seller.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors touch-target"
                      >
                        <Globe className="h-4 w-4 mr-1" />
                        Website
                      </a>
                    )}

                    {seller.instagram && (
                      <a
                        href={`https://instagram.com/${seller.instagram.replace(
                          "@",
                          ""
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors touch-target"
                      >
                        <Instagram className="h-4 w-4 mr-1" />
                        Instagram
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-First Tabs */}
        <div className="mb-6">
          <div className="flex overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
            <div className="flex space-x-2 min-w-max">
              {[
                {
                  id: "products",
                  label: `Products (${products.length})`,
                  icon: Package,
                },
                {
                  id: "services",
                  label: `Services (${services.length})`,
                  icon: Users,
                },
                {
                  id: "reviews",
                  label: `Reviews (${seller.total_reviews})`,
                  icon: Star,
                },
                { id: "about", label: "About", icon: Store },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`mobile-button flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <tab.icon size={16} />
                  <span className="text-sm">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "products" && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {products.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="mobile-card overflow-hidden hover:shadow-lg transition-all"
                    >
                      {product.images.length > 0 && (
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      <div className="p-3">
                        <h3
                          className="font-semibold mb-1 line-clamp-1 text-sm"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {product.name}
                        </h3>

                        <p
                          className="text-xs mb-2 line-clamp-2"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {product.description}
                        </p>

                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            ${product.price}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Stock: {product.stock_quantity}
                          </span>
                        </div>

                        <Link
                          to={`/product/${product.id}`}
                          className="mobile-button block w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center text-sm"
                        >
                          View Details
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3
                    className="text-lg font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    No products available
                  </h3>
                  <p style={{ color: "var(--text-muted)" }}>
                    This shop hasn't added any products yet.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "services" && (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {services.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {services.map((service, index) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="mobile-card overflow-hidden hover:shadow-lg transition-all"
                    >
                      {service.images.length > 0 && (
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={service.images[0]}
                            alt={service.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      <div className="p-3">
                        <h3
                          className="font-semibold mb-1 line-clamp-1 text-sm"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {service.name}
                        </h3>

                        <p
                          className="text-xs mb-2 line-clamp-2"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {service.description}
                        </p>

                        <div className="flex items-center justify-between mb-3">
                          {service.price ? (
                            <span className="text-lg font-bold text-green-600 dark:text-green-400">
                              ${service.price}
                            </span>
                          ) : (
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">
                              Custom Pricing
                            </span>
                          )}
                          {service.duration_days && (
                            <div
                              className="flex items-center text-xs"
                              style={{ color: "var(--text-muted)" }}
                            >
                              <Calendar className="h-3 w-3 mr-1" />
                              {service.duration_days} days
                            </div>
                          )}
                        </div>

                        <Link
                          to={`/service/${service.id}`}
                          className="mobile-button block w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-center text-sm"
                        >
                          View Details
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3
                    className="text-lg font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    No services available
                  </h3>
                  <p style={{ color: "var(--text-muted)" }}>
                    This shop hasn't added any services yet.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "reviews" && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mobile-card p-4"
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  className="text-xl font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Customer Reviews
                </h2>
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="mobile-button bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Star size={16} className="mr-2" />
                  Write Review
                </button>
              </div>

              {/* Rating Summary */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center space-x-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {seller.rating.toFixed(1)}
                    </div>
                    <RatingStars
                      rating={seller.rating}
                      size="md"
                      className="justify-center mb-1"
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Based on {seller.total_reviews} review
                      {seller.total_reviews !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>

              <ReviewsList sellerId={seller.id} refreshKey={refreshKey} showAll />
            </motion.div>
          )}

          {activeTab === "about" && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mobile-card p-4"
            >
              <h2
                className="text-xl font-bold mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                About {seller.business_name}
              </h2>

              <div className="space-y-4">
                <div>
                  <h3
                    className="text-lg font-semibold mb-3"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Business Description
                  </h3>
                  <p
                    className="leading-relaxed"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {seller.description}
                  </p>
                </div>

                <div className="grid gap-4">
                  <div>
                    <h3
                      className="text-lg font-semibold mb-3"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Contact Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <MessageCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span
                          className="text-sm"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {seller.whatsapp_number}
                        </span>
                      </div>
                      {seller.phone_number && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                          <span
                            className="text-sm"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {seller.phone_number}
                          </span>
                        </div>
                      )}
                      {seller.email && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
                          <span
                            className="text-sm break-all"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {seller.email}
                          </span>
                        </div>
                      )}
                      {seller.location && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                          <span
                            className="text-sm"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {seller.location}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3
                      className="text-lg font-semibold mb-3"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Shop Statistics
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span
                          className="text-sm"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Member since:
                        </span>
                        <span
                          className="font-medium text-sm"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {memberSince}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span
                          className="text-sm"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Total products:
                        </span>
                        <span
                          className="font-medium text-sm"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {products.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span
                          className="text-sm"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Total services:
                        </span>
                        <span
                          className="font-medium text-sm"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {services.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span
                          className="text-sm"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Total sales:
                        </span>
                        <span
                          className="font-medium text-sm"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {seller.total_sales}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span
                          className="text-sm"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Profile views:
                        </span>
                        <span
                          className="font-medium text-sm"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {seller.view_count}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Review Form Modal */}
      <ReviewForm
        sellerId={seller.id}
        sellerName={seller.business_name}
        isOpen={showReviewForm}
        onClose={() => setShowReviewForm(false)}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
};

export default ShopDetail;