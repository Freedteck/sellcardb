import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, Edit, Trash2, Eye, Search, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, Product, Seller } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Products: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchSellerAndProducts();
    }
  }, [user]);

  const fetchSellerAndProducts = async () => {
    try {
      // Get seller profile
      const { data: sellerData, error: sellerError } = await supabase
        .from('sellers')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (sellerError) throw sellerError;
      setSeller(sellerData);

      // Get products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', sellerData.id)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setProducts(products.filter(p => p.id !== productId));
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const toggleAvailability = async (productId: string, isAvailable: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_available: !isAvailable })
        .eq('id', productId);

      if (error) throw error;

      setProducts(products.map(p => 
        p.id === productId ? { ...p, is_available: !isAvailable } : p
      ));
      toast.success(`Product ${!isAvailable ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.location && product.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

  return (
    <div className="min-h-screen">
      <Header />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              My Products
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your product catalog
            </p>
          </div>
          <Link
            to="/dashboard/products/new"
            className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl mt-4 sm:mt-0"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Product
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
              >
                {product.images.length > 0 && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                      {product.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.is_available
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {product.is_available ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  
                  {/* Location */}
                  {product.location && (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      {product.location}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      ${product.price}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Stock: {product.stock_quantity}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span>{product.category}</span>
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {product.view_count}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link
                      to={`/dashboard/products/edit/${product.id}`}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center text-sm"
                    >
                      <Edit className="h-4 w-4 inline mr-1" />
                      Edit
                    </Link>
                    <button
                      onClick={() => toggleAvailability(product.id, product.is_available)}
                      className={`flex-1 px-3 py-2 rounded-lg transition-colors text-center text-sm ${
                        product.is_available
                          ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {product.is_available ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'No products found' : 'No products yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Start building your product catalog'
              }
            </p>
            {!searchTerm && (
              <Link
                to="/dashboard/products/new"
                className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Product
              </Link>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Products;