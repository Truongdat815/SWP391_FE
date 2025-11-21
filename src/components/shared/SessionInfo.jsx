import { useState, useEffect } from 'react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { getTokenExpirationInfo } from '../../utils/roleUtils';

const SessionInfo = () => {
  const { isAuthenticated, role } = useAppSelector((state) => state.auth);
  const [timeLeft, setTimeLeft] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !role) {
      setTimeLeft(null);
      setSessionInfo(null);
      return;
    }

    const updateSessionInfo = () => {
      const tokenInfo = getTokenExpirationInfo(role);
      if (tokenInfo) {
        setSessionInfo(tokenInfo);
        if (!tokenInfo.isExpired) {
          setTimeLeft(tokenInfo.timeUntilExpiry);
        } else {
          setTimeLeft(0);
        }
      }
    };

    // Update immediately
    updateSessionInfo();

    // Update every minute
    const interval = setInterval(updateSessionInfo, 60000);

    return () => clearInterval(interval);
  }, [isAuthenticated, role]);

  if (!isAuthenticated || !sessionInfo) {
    return null;
  }

  const formatTimeLeft = (ms) => {
    if (ms <= 0) return 'Đã hết hạn';
    
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} ngày`;
    }
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    
    return `${minutes}m`;
  };

  const getStatusColor = () => {
    if (sessionInfo.isExpired) return 'text-red-600';
    if (timeLeft < 60 * 60 * 1000) return 'text-orange-600'; // Less than 1 hour
    return 'text-green-600';
  };

  return (
    <div className="text-xs text-gray-500 px-3 py-1 border-t">
      <div className="flex items-center justify-between">
        <span>Phiên đăng nhập:</span>
        <span className={getStatusColor()}>
          {formatTimeLeft(timeLeft)}
        </span>
      </div>
      {sessionInfo.rememberMe && (
        <div className="text-xs text-gray-400 mt-1">
          Ghi nhớ đăng nhập
        </div>
      )}
    </div>
  );
};

export default SessionInfo;
