import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Store, Share2, Smartphone, Zap, Search, QrCode, BarChart3, Shield, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import MobileHeader from '../components/MobileHeader';
import FloatingActionButton from '../components/FloatingActionButton';

const LandingPage: React.FC = () => {
  const { user } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen pb-20">
      <MobileHeader title="SellCard" transparent />
      
      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white overflow-hidden"
      >
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-white/5 rounded-full"
              style={{
                width: Math.random() * 100 + 50,
                height: Math.random() * 100 + 50,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative px-4 py-16 sm:py-20 lg:py-24">
          <div className="text-center">
            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight"
            >
              Build Your Online <br />
              <span className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Marketplace
              </span>{' '}
              in Minutes
            </motion.h1>
            
            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl mb-8 text-blue-100 px-4 max-w-2xl mx-auto"
            >
              Create your professional shop and connect with customers
            </motion.p>
            
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center px-4"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to={user ? "/dashboard" : "/signup"}
                  className="mobile-button inline-flex items-center bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                >
                  {user ? 'Go to Dashboard' : 'Start Selling Now'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/marketplace"
                  className="mobile-button inline-flex items-center border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Browse Marketplace
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="py-12 sm:py-16 lg:py-20"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants} className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Everything You Need to Sell Online
            </h2>
            <p className="text-lg lg:text-xl" style={{ color: 'var(--text-muted)' }}>
              Professional tools for modern entrepreneurs
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Store,
                title: "Professional Shop",
                description: "Create a beautiful online shop with your products, services, and business information",
                color: "from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20",
                iconColor: "bg-blue-600"
              },
              {
                icon: Users,
                title: "Customer Management",
                description: "Track inquiries, manage customer relationships, and build your reputation with reviews",
                color: "from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20",
                iconColor: "bg-green-600"
              },
              {
                icon: BarChart3,
                title: "Business Analytics",
                description: "Monitor your shop performance, track views, and understand your customer behavior",
                color: "from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20",
                iconColor: "bg-purple-600"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="mobile-card text-center p-6 hover:shadow-lg transition-all duration-300"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className={`${feature.iconColor} text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}
                >
                  <feature.icon size={24} />
                </motion.div>
                <h3 className="text-lg lg:text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base" style={{ color: 'var(--text-muted)' }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Advanced Features Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="py-12 sm:py-16 lg:py-20"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants} className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Advanced Features
            </h2>
            <p className="text-lg lg:text-xl" style={{ color: 'var(--text-muted)' }}>
              Professional tools to grow your business
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Shield,
                title: "Secure & Reliable",
                description: "Your data is protected with enterprise-grade security and reliable hosting"
              },
              {
                icon: Smartphone,
                title: "Mobile Optimized",
                description: "Perfect experience on all devices with responsive design and fast loading"
              },
              {
                icon: QrCode,
                title: "Easy Sharing",
                description: "Share your shop with QR codes, social media links, and direct messaging"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="mobile-card p-6 hover:shadow-xl transition-all"
              >
                <feature.icon className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
                <h3 className="text-lg lg:text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base" style={{ color: 'var(--text-muted)' }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="py-12 sm:py-16 lg:py-20"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants} className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              How It Works
            </h2>
            <p className="text-lg lg:text-xl" style={{ color: 'var(--text-muted)' }}>
              Three simple steps to your online business
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "1",
                title: "Create Account",
                description: "Sign up and set up your seller profile with business details and contact information"
              },
              {
                step: "2",
                title: "Add Products & Services",
                description: "Upload your products and services with photos, descriptions, and pricing"
              },
              {
                step: "3",
                title: "Start Selling",
                description: "Share your shop link and start receiving inquiries from interested customers"
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold shadow-lg"
                >
                  {step.step}
                </motion.div>
                <h3 className="text-lg lg:text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  {step.title}
                </h3>
                <p className="text-sm sm:text-base" style={{ color: 'var(--text-muted)' }}>
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.h2
            variants={itemVariants}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6"
          >
            Ready to Start Your Online Business?
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-lg lg:text-xl mb-8 text-blue-100"
          >
            Join thousands of entrepreneurs who've built successful online businesses with SellCard
          </motion.p>
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to={user ? "/dashboard" : "/signup"}
              className="mobile-button inline-flex items-center bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors shadow-xl hover:shadow-2xl"
            >
              {user ? 'Go to Dashboard' : 'Start Selling Today'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Floating Action Button */}
      <FloatingActionButton />
    </div>
  );
};

export default LandingPage;