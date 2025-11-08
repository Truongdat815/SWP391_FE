import { useState, useCallback } from 'react';

export const useToast = () => {
  const [toast, setToast] = useState({
    show: false,
    type: 'success',
    message: ''
  });

  const showToast = useCallback((type, message, duration = 3000) => {
    setToast({ show: true, type, message });
    
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, duration);
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }));
  }, []);

  const success = useCallback((message, duration) => {
    showToast('success', message, duration);
  }, [showToast]);

  const error = useCallback((message, duration) => {
    showToast('error', message, duration);
  }, [showToast]);

  const warning = useCallback((message, duration) => {
    showToast('warning', message, duration);
  }, [showToast]);

  const info = useCallback((message, duration) => {
    showToast('info', message, duration);
  }, [showToast]);

  return {
    toast,
    showToast,
    hideToast,
    success,
    error,
    warning,
    info
  };
};

