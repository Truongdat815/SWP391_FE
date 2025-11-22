import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../utils/cn';
import Card from '../ui/Card';

const MetricCard = ({ title, value, change, changeType = 'positive', icon: Icon, className }) => {
  const isGradient = className?.includes('gradient');
  return (
    <Card className={cn('hover:shadow-md transition-shadow', className, isGradient && 'border-0')}>
      <div className="flex items-center justify-between p-4">
        <div className="flex-1">
          <p className={cn(
            'text-sm font-medium mb-2',
            isGradient ? 'text-white/90' : 'text-gray-600'
          )}>{title}</p>
          <p className={cn(
            'text-3xl font-bold',
            isGradient ? 'text-white' : 'text-gray-900'
          )}>{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {changeType === 'positive' ? (
                <TrendingUp size={16} className={cn('mr-1', isGradient ? 'text-white' : 'text-green-600')} />
              ) : (
                <TrendingDown size={16} className={cn('mr-1', isGradient ? 'text-white' : 'text-red-600')} />
              )}
              <span
                className={cn(
                  'text-sm font-medium',
                  isGradient ? 'text-white' : (changeType === 'positive' ? 'text-green-600' : 'text-red-600')
                )}
              >
                {change}
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn(
            'p-4 rounded-xl flex-shrink-0',
            isGradient ? 'bg-white/20' : 'bg-blue-50'
          )}>
            <Icon size={28} className={isGradient ? 'text-white' : 'text-blue-600'} />
          </div>
        )}
      </div>
    </Card>
  );
};

export default MetricCard;

