import { useState, useCallback } from 'react';

export const useConfirm = () => {
  const [confirm, setConfirm] = useState({
    show: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => {},
    onCancel: () => {}
  });

  const showConfirm = useCallback(({
    title = 'Xác nhận',
    message,
    type = 'warning',
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    onConfirm,
    onCancel
  }) => {
    return new Promise((resolve) => {
      setConfirm({
        show: true,
        title,
        message,
        type,
        confirmText,
        cancelText,
        onConfirm: () => {
          setConfirm(prev => ({ ...prev, show: false }));
          if (onConfirm) onConfirm();
          resolve(true);
        },
        onCancel: () => {
          setConfirm(prev => ({ ...prev, show: false }));
          if (onCancel) onCancel();
          resolve(false);
        }
      });
    });
  }, []);

  const hideConfirm = useCallback(() => {
    setConfirm(prev => ({ ...prev, show: false }));
  }, []);

  return {
    confirm,
    showConfirm,
    hideConfirm
  };
};

