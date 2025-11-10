import React from 'react';
import ViewContracts from './ViewContracts';
import Toast from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';

function ContractManagement() {
  const { toast, hideToast } = useToast();
  const { confirm } = useConfirm();

  return (
    <div>
      {/* Toast Notifications */}
      <Toast 
        show={toast.show} 
        type={toast.type} 
        message={toast.message} 
        onClose={hideToast}
      />
      
      {/* Confirm Dialog */}
      <ConfirmDialog
        show={confirm.show}
        title={confirm.title}
        message={confirm.message}
        type={confirm.type}
        confirmText={confirm.confirmText}
        cancelText={confirm.cancelText}
        onConfirm={confirm.onConfirm}
        onCancel={confirm.onCancel}
      />

      {/* Chỉ hiển thị ViewContracts - Quản lý hợp đồng đã tạo */}
      <ViewContracts />
    </div>
  );
}

export default ContractManagement;