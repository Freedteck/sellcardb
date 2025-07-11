import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Circle,
  Copy,
  Link as LinkIcon,
  QrCode,
  MessageSquare,
  GalleryVertical as Gallery,
  Download,
  Users,
  TrendingUp,
  X,
  ArrowLeft,
  ArrowRight
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

interface GuideModalProps {
  seller: Seller;
  onClose: () => void;
}

const GuideModal: React.FC<GuideModalProps> = ({ seller, onClose }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [copying, setCopying] = useState<string | null>(null);
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

  const currentStep = steps[stepIndex];

  const copyToClipboard = async (text: string, stepId: string) => {
    setCopying(stepId);
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    } finally {
      setCopying(null);
    }
  };

  const downloadQRCode = () => {
    window.open(`/dashboard/qr-codes`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md p-6 relative overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-lg font-bold mb-4 flex items-center text-blue-700 dark:text-blue-400">
          <TrendingUp className="h-5 w-5 mr-2" /> How to Get More Customers
        </h2>

        <div className="mb-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <currentStep.icon className="h-5 w-5 mr-2 text-blue-600" />
            <h3 className="font-semibold text-sm text-gray-800 dark:text-white">{currentStep.title}</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{currentStep.instruction}</p>
          {currentStep.content && (
            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm text-gray-800 dark:text-white mb-2">
              {currentStep.content}
            </div>
          )}
          {currentStep.actionType === 'copy' && currentStep.content && (
            <button
              onClick={() => copyToClipboard(currentStep.content!, currentStep.id)}
              disabled={copying === currentStep.id}
              className="flex items-center text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
            >
              <Copy className="h-4 w-4 mr-1" />
              {copying === currentStep.id ? 'Copying...' : currentStep.actionLabel}
            </button>
          )}
          {currentStep.actionType === 'download' && (
            <button
              onClick={downloadQRCode}
              className="flex items-center text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded"
            >
              <Download className="h-4 w-4 mr-1" />
              {currentStep.actionLabel}
            </button>
          )}
        </div>

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setStepIndex(Math.max(0, stepIndex - 1))}
            disabled={stepIndex === 0}
            className="flex items-center text-sm text-gray-600 dark:text-gray-300 disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Prev
          </button>

          <button
            onClick={() => setStepIndex(Math.min(steps.length - 1, stepIndex + 1))}
            disabled={stepIndex === steps.length - 1}
            className="flex items-center text-sm text-gray-600 dark:text-gray-300 disabled:opacity-40"
          >
            Next <ArrowRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default GuideModal;
