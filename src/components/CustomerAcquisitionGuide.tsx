// components/CustomerAcquisitionModal.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, Circle, Copy, QrCode, MessageSquare, Link as LinkIcon,
  Users, GalleryVertical as Gallery, Download, X, ArrowLeft, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Seller } from '../lib/supabase';

interface Step {
  id: string;
  title: string;
  instruction: string;
  content?: string;
  icon: React.ComponentType<any>;
  actionType?: 'copy' | 'download' | 'none';
  actionLabel?: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  seller: Seller;
}

const CustomerAcquisitionModal: React.FC<ModalProps> = ({ isOpen, onClose, seller }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [copying, setCopying] = useState<string | null>(null);
  const stepsPerPage = 2;

  const shopUrl = `${window.location.origin}/shop/${seller.id}`;

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
      icon: LinkIcon,
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

  useEffect(() => {
    const saved = localStorage.getItem(`completed-steps-${seller.id}`);
    if (saved) {
      setCompletedSteps(new Set(JSON.parse(saved)));
    }
  }, [seller.id]);

  const saveCompletedSteps = (steps: Set<string>) => {
    localStorage.setItem(`completed-steps-${seller.id}`, JSON.stringify([...steps]));
  };

  const toggleStepCompletion = (stepId: string) => {
    const updated = new Set(completedSteps);
    if (updated.has(stepId)) updated.delete(stepId);
    else updated.add(stepId);
    setCompletedSteps(updated);
    saveCompletedSteps(updated);
  };

  const copyToClipboard = async (text: string, stepId: string) => {
    setCopying(stepId);
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Failed to copy');
    } finally {
      setCopying(null);
    }
  };

  const downloadQRCode = () => {
    window.open(`/dashboard/qr-codes`, '_blank');
  };

  const pageSteps = steps.slice(currentPage * stepsPerPage, (currentPage + 1) * stepsPerPage);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-xl shadow-lg p-6 relative overflow-y-auto"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              How to Get More Customers
            </h2>

            {pageSteps.map((step, index) => {
              const isCompleted = completedSteps.has(step.id);
              const StepIcon = step.icon;

              return (
                <div key={step.id} className="mb-6 border p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <button onClick={() => toggleStepCompletion(step.id)} className="mt-1">
                      {isCompleted ? <CheckCircle className="text-green-600" /> : <Circle className="text-gray-400" />}
                    </button>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1 flex items-center">
                        <StepIcon className="h-4 w-4 mr-2" />
                        Step {currentPage * stepsPerPage + index + 1}: {step.title}
                      </h3>
                      <p className="text-sm mb-2 text-gray-600 dark:text-gray-300">{step.instruction}</p>
                      {step.content && (
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded mb-2 text-sm">
                          {step.content}
                        </div>
                      )}
                      {step.actionType === 'copy' && step.content && (
                        <button
                          onClick={() => copyToClipboard(step.content!, step.id)}
                          disabled={copying === step.id}
                          className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700"
                        >
                          <Copy className="h-4 w-4 inline mr-1" />
                          {copying === step.id ? 'Copying...' : step.actionLabel}
                        </button>
                      )}
                      {step.actionType === 'download' && (
                        <button
                          onClick={downloadQRCode}
                          className="bg-purple-600 text-white text-sm px-3 py-1 rounded hover:bg-purple-700"
                        >
                          <Download className="h-4 w-4 inline mr-1" />
                          {step.actionLabel}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                disabled={currentPage === 0}
                className="text-sm px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4 inline mr-1" /> Previous
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(steps.length / stepsPerPage) - 1))}
                disabled={(currentPage + 1) * stepsPerPage >= steps.length}
                className="text-sm px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Next <ArrowRight className="h-4 w-4 inline ml-1" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CustomerAcquisitionModal;
