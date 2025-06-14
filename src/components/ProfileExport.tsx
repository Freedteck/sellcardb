import React, { useRef } from 'react';
import { Download, FileImage, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Profile } from '../lib/supabase';

interface ProfileExportProps {
  profile: Profile;
  profileUrl: string;
}

const ProfileExport: React.FC<ProfileExportProps> = ({ profile, profileUrl }) => {
  const exportRef = useRef<HTMLDivElement>(null);

  const exportAsImage = async () => {
    if (!exportRef.current) return;

    try {
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true
      });

      const link = document.createElement('a');
      link.download = `${profile.business_name}-profile.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast.success('Profile exported as image!');
    } catch (error) {
      console.error('Error exporting image:', error);
      toast.error('Failed to export image');
    }
  };

  const exportAsPDF = async () => {
    if (!exportRef.current) return;

    try {
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${profile.business_name}-profile.pdf`);
      toast.success('Profile exported as PDF!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    }
  };

  return (
    <div>
      <div className="flex space-x-2 mb-4">
        <motion.button
          onClick={exportAsImage}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <FileImage size={16} className="mr-2" />
          Export as Image
        </motion.button>
        
        <motion.button
          onClick={exportAsPDF}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <FileText size={16} className="mr-2" />
          Export as PDF
        </motion.button>
      </div>

      {/* Hidden export template */}
      <div ref={exportRef} className="hidden">
        <div className="bg-white p-8 max-w-md mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{profile.business_name}</h1>
            <p className="text-gray-600">{profile.description}</p>
            {profile.category && (
              <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mt-2">
                {profile.category}
              </span>
            )}
          </div>

          {profile.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-6">
              {profile.images.slice(0, 4).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${profile.business_name} ${index + 1}`}
                  className="w-full h-24 object-cover rounded"
                />
              ))}
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Contact us on WhatsApp:</p>
            <p className="font-semibold text-gray-900">{profile.whatsapp_number}</p>
            <p className="text-xs text-gray-500 mt-4">Visit: {profileUrl}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileExport;