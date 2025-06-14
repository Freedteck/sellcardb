import React, { useState, useRef } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { Trash2 } from 'lucide-react';

interface SwipeToDeleteProps {
  onDelete: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

const SwipeToDelete: React.FC<SwipeToDeleteProps> = ({
  onDelete,
  children,
  disabled = false
}) => {
  const [dragX, setDragX] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const constraintsRef = useRef(null);

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (disabled) return;

    const threshold = -100;
    if (info.offset.x < threshold) {
      setIsDeleting(true);
      setTimeout(() => {
        onDelete();
      }, 200);
    } else {
      setDragX(0);
    }
  };

  if (disabled) {
    return <>{children}</>;
  }

  return (
    <div className="relative overflow-hidden" ref={constraintsRef}>
      {/* Delete background */}
      <div className="absolute inset-0 bg-red-500 flex items-center justify-end pr-6">
        <Trash2 size={20} className="text-white" />
      </div>

      {/* Draggable content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -120, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={{ x: isDeleting ? -300 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative bg-white dark:bg-gray-800 z-10"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default SwipeToDelete;