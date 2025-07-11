import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Copy, Link, QrCode, MessageSquare, GalleryVertical as Gallery, Download, Users, TrendingUp } from 'lucide-react';
import { Seller } from '../lib/supabase';
import toast from 'react-hot-toast';

interface CustomerAcquisitionGuideProps {
  seller: Seller;
}

interface Step {
  id: string;
  title: string;
  instruction: string;
  content?: string;
  icon: React.ComponentType<any>;
  actionType?: 'copy' | 'download' | 'none';
  actionLabel?: string;
}

const CustomerAcquisitionGuide: React.FC<CustomerAcquisitionGuideProps> = ({ seller }) => {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [copying, setCopying] = useState<string | null>(null);

  const shopUrl = `${window.location.origin}/shop/${seller.id}`;

  // Load completed steps from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`completed-steps-${seller.id}`);
    if (saved) {
      setCompletedSteps(new Set(JSON.parse(saved)));
    }
  }, [seller.id]);

  // Save completed steps to localStorage
  const saveCompletedSteps = (steps: Set<string>) => {
    localStorage.setItem(`completed-steps-${seller.id}`, JSON.stringify([...steps]));
  };

  const toggleStepCompletion = (stepId: string) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepId)) {
      newCompleted.delete(stepId);
    } else {
      newCompleted.add(stepId);
    }
    setCompletedSteps(newCompleted);
    saveCompletedSteps(newCompleted);
  };

  const copyToClipboard = async (text: string, stepId: string) => {
    setCopying(stepId);
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy');
    } finally {
      setCopying(false);
    }
  };

  const downloadQRCode = () => {
    // This would trigger the QR code download functionality
    // For now, we'll navigate to the QR codes page
    window.open(`/dashboard/qr-codes`, '_blank');
  };

  const steps: Step[] = [
    {
      id: 'whatsapp-status',
      title: 'Post your ShopLink on WhatsApp Status',
      instruction: 'Post this caption as your WhatsApp status to attract attention to your store.',
      content: 'See everything I sell here. Tap the link to order now.',
      icon: MessageSquare,
      actionType: 'copy',
      actionLabel: 'Copy Caption'
    },
    {
      id: 'instagram-bio',
      title: 'Add your ShopLink to your Instagram Bio',
      instruction: 'Having your link in your bio helps customers trust you and order faster.',
      icon: Link,
      actionType: 'none'
    },
    {
      id: 'qr-code-share',
      title: 'Share Your QR Code with Customers',
      instruction: 'You can print or send your ShopLink QR code to make it easier for people to scan.',
      icon: QrCode,
      actionType: 'download',
      actionLabel: 'Download QR Code'
    },
    {
      id: 'customer-message',
      title: 'Forward Your ShopLink to Existing Customers',
      instruction: 'Use this message to update old customers about your new online shop.',
      content: `Hi! You can now see everything I sell in one place here: ${shopUrl}`,
      icon: Users,
      actionType: 'copy',
      actionLabel: 'Copy Message'
    },
    {
      id: 'replace-pictures',
      title: 'Use Your ShopLink Instead of Sending Multiple Pictures',
      instruction: 'Instead of sending many pictures in chat, send your ShopLink so customers can view everything in one place.',
      icon: Gallery,
      actionType: 'none'
    }
  ];

  const completionPercentage = Math.round((completedSteps.size / steps.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mobile-card p-4 sm:p-6"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold flex items-center" style={{ color: 'var(--text-primary)' }}>
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
            How to Get More Customers
          </h2>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{completionPercentage}%</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Complete</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
          />
        </div>
        
        <p className="text-sm mt-3" style={{ color: 'var(--text-muted)' }}>
          Follow these steps to attract more customers to your shop
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.has(step.id);
          const StepIcon = step.icon;
          
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`border rounded-lg p-4 transition-all ${
                isCompleted 
                  ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-start space-x-3">
                {/* Checkbox */}
                <button
                  onClick={() => toggleStepCompletion(step.id)}
                  className="flex-shrink-0 mt-1 touch-target"
                >
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={`font-semibold text-sm sm:text-base flex items-center ${
                      isCompleted ? 'text-green-800 dark:text-green-200' : ''
                    }`} style={{ color: isCompleted ? undefined : 'var(--text-primary)' }}>
                      <StepIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="line-clamp-2">Step {index + 1}: {step.title}</span>
                    </h3>
                  </div>

                  <p className={`text-sm mb-3 leading-relaxed ${
                    isCompleted ? 'text-green-700 dark:text-green-300' : ''
                  }`} style={{ color: isCompleted ? undefined : 'var(--text-muted)' }}>
                    {step.instruction}
                  </p>

                  {/* Content to copy */}
                  {step.content && (
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mb-3 border border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {step.content}
                      </p>
                    </div>
                  )}

                  {/* Action Button */}
                  {step.actionType !== 'none' && (
                    <div className="flex justify-start">
                      {step.actionType === 'copy' && step.content && (
                        <button
                          onClick={() => copyToClipboard(step.content!, step.id)}
                          disabled={copying === step.id}
                          className="mobile-button flex items-center bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors text-sm"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          {copying === step.id ? 'Copying...' : step.actionLabel}
                        </button>
                      )}
                      
                      {step.actionType === 'download' && (
                        <button
                          onClick={downloadQRCode}
                          className="mobile-button flex items-center bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {step.actionLabel}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Completion Message */}
      {completionPercentage === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 p-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center"
        >
          <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h3 className="font-semibold text-green-800 dark:text-green-200 mb-1">
            Congratulations! 🎉
          </h3>
          <p className="text-sm text-green-700 dark:text-green-300">
            You've completed all steps to grow your customer base. Keep promoting your shop!
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CustomerAcquisitionGuide;