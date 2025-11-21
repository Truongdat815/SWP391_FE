import { Package, Search, Inbox, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';

const EmptyState = ({ 
  icon = 'package', 
  title = 'Không có dữ liệu', 
  message = 'Hiện tại không có dữ liệu để hiển thị.',
  actionLabel,
  onAction,
  className = ''
}) => {
  const getIcon = () => {
    const iconProps = { size: 64, className: 'text-gray-300' };
    switch (icon) {
      case 'package':
        return <Package {...iconProps} />;
      case 'search':
        return <Search {...iconProps} />;
      case 'inbox':
        return <Inbox {...iconProps} />;
      case 'alert':
        return <AlertCircle {...iconProps} />;
      default:
        return <Package {...iconProps} />;
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="mb-4">{getIcon()}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 text-center max-w-md mb-6">{message}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;

