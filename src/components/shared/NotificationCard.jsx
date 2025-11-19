import { AlertTriangle, Info, HelpCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import Card from '../ui/Card';

const NotificationCard = ({ type = 'info', title, message, className }) => {
  const types = {
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-800',
      textColor: 'text-yellow-700',
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-800',
      textColor: 'text-blue-700',
    },
    support: {
      icon: HelpCircle,
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      iconColor: 'text-orange-600',
      titleColor: 'text-orange-800',
      textColor: 'text-orange-700',
    },
  };

  const config = types[type];
  const Icon = config.icon;

  return (
    <Card
      className={cn(
        config.bgColor,
        config.borderColor,
        'border-l-4',
        className
      )}
    >
      <div className="flex items-start">
        <Icon size={20} className={cn(config.iconColor, 'mt-0.5 mr-3')} />
        <div className="flex-1">
          <h4 className={cn('font-semibold mb-1', config.titleColor)}>{title}</h4>
          <p className={cn('text-sm', config.textColor)}>{message}</p>
        </div>
      </div>
    </Card>
  );
};

export default NotificationCard;

