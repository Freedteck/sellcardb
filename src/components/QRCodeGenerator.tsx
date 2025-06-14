import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface QRCodeGeneratorProps {
  url: string;
  businessName: string;
  size?: number;
  className?: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  url, 
  businessName, 
  size = 200,
  className = ""
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    generateQR();
  }, [url, size]);

  const generateQR = async () => {
    if (!canvasRef.current) return;

    try {
      await QRCode.toCanvas(canvasRef.current, url, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      });

      const dataUrl = canvasRef.current.toDataURL('image/png', 1.0);
      setQrDataUrl(dataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    }
  };

  const downloadQR = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.download = `${businessName.replace(/[^a-zA-Z0-9]/g, '-')}-qr-code.png`;
    link.href = qrDataUrl;
    link.click();
    toast.success('QR code downloaded!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg ${className}`}
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <QrCode className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          QR Code
        </h3>
        <button
          onClick={downloadQR}
          className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors touch-target"
          title="Download QR Code"
        >
          <Download size={18} />
        </button>
      </div>
      
      <div className="flex justify-center mb-3 sm:mb-4">
        <div className="bg-white p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <canvas 
            ref={canvasRef} 
            className="block max-w-full h-auto"
            width={size}
            height={size}
          />
        </div>
      </div>
      
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 text-center">
        Scan to visit profile
      </p>
    </motion.div>
  );
};

export default QRCodeGenerator;