import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { modalBackdrop, modalMotion } from '../../utils/animations';
import { cn } from '../../utils/cn';

const Modal = ({ isOpen, onClose, title, children, size = 'md', className }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    '3xl': 'max-w-7xl',
    fullscreen: 'w-full h-full max-w-full max-h-full m-0 rounded-none',
  };

  const isFullscreen = size === 'fullscreen';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={cn(
            "fixed inset-0 z-50 bg-black bg-opacity-50",
            isFullscreen ? "p-0" : "flex items-center justify-center"
          )}
          onClick={onClose}
          initial={modalBackdrop.initial}
          animate={modalBackdrop.animate}
          exit={modalBackdrop.exit}
          transition={modalBackdrop.transition}
        >
          <motion.div
            className={cn(
              'bg-white shadow-xl',
              isFullscreen ? 'w-full h-full' : 'w-full mx-4 rounded-lg',
              !isFullscreen && sizes[size],
              className
            )}
            onClick={(e) => e.stopPropagation()}
            initial={modalMotion.initial}
            animate={modalMotion.animate}
            exit={modalMotion.exit}
          >
            <div className={cn(
              "flex items-center justify-between border-b border-gray-200",
              isFullscreen ? "p-4" : "p-6"
            )}>
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              <motion.button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={24} />
              </motion.button>
            </div>
            <div className={cn(
              "overflow-y-auto",
              isFullscreen ? "p-4 h-[calc(100vh-73px)]" : "p-6"
            )}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;

