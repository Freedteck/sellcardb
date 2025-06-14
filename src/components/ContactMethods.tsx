import React from 'react';
import { Instagram, MessageCircle, Phone, Mail, Globe, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface ContactMethod {
  type: 'whatsapp' | 'instagram' | 'tiktok' | 'phone' | 'email' | 'website';
  value: string;
  label?: string;
}

interface ContactMethodsProps {
  methods: ContactMethod[];
  businessName: string;
}

const ContactMethods: React.FC<ContactMethodsProps> = ({ methods, businessName }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'whatsapp':
        return <MessageCircle className="h-5 w-5" />;
      case 'instagram':
        return <Instagram className="h-5 w-5" />;
      case 'tiktok':
        return <div className="h-5 w-5 font-bold text-xs flex items-center justify-center">TT</div>;
      case 'phone':
        return <Phone className="h-5 w-5" />;
      case 'email':
        return <Mail className="h-5 w-5" />;
      case 'website':
        return <Globe className="h-5 w-5" />;
      default:
        return <ExternalLink className="h-5 w-5" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'whatsapp':
        return 'bg-green-600 hover:bg-green-700';
      case 'instagram':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600';
      case 'tiktok':
        return 'bg-black hover:bg-gray-800';
      case 'phone':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'email':
        return 'bg-gray-600 hover:bg-gray-700';
      case 'website':
        return 'bg-indigo-600 hover:bg-indigo-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  const handleContact = (method: ContactMethod) => {
    let url = '';
    
    switch (method.type) {
      case 'whatsapp':
        const message = `Hi! I found your business profile on SellCard. I'm interested in your products/services.`;
        url = `https://wa.me/${method.value.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
        break;
      case 'instagram':
        url = `https://instagram.com/${method.value.replace('@', '')}`;
        break;
      case 'tiktok':
        url = `https://tiktok.com/@${method.value.replace('@', '')}`;
        break;
      case 'phone':
        url = `tel:${method.value}`;
        break;
      case 'email':
        url = `mailto:${method.value}?subject=Inquiry about ${businessName}`;
        break;
      case 'website':
        url = method.value.startsWith('http') ? method.value : `https://${method.value}`;
        break;
    }

    if (url) {
      window.open(url, '_blank');
    }
  };

  if (methods.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Get in Touch
      </h3>
      <div className="grid gap-3">
        {methods.map((method, index) => (
          <motion.button
            key={index}
            onClick={() => handleContact(method)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center justify-center space-x-3 px-4 py-3 rounded-lg text-white font-medium transition-all ${getColor(method.type)}`}
          >
            {getIcon(method.type)}
            <span>
              {method.label || method.type.charAt(0).toUpperCase() + method.type.slice(1)}
            </span>
            <ExternalLink className="h-4 w-4 opacity-70" />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default ContactMethods;