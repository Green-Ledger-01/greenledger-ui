import React from 'react';
import { RefreshCw } from 'lucide-react';
import { usePullToRefresh } from '../hooks/useMobile';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  disabled?: boolean;
}

/**
 * Pull-to-refresh component for mobile interfaces
 */
const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  disabled = false,
}) => {
  const { isPulling, pullDistance } = usePullToRefresh(disabled ? () => {} : onRefresh);

  return (
    <div className="relative">
      {/* Pull indicator */}
      <div 
        className={`
          fixed top-0 left-0 right-0 z-50 bg-green-50 border-b border-green-200
          flex items-center justify-center transition-all duration-300 ease-out
          ${isPulling ? 'opacity-100' : 'opacity-0'}
        `}
        style={{
          height: `${Math.min(pullDistance, 60)}px`,
          transform: `translateY(${isPulling ? 0 : -60}px)`,
        }}
      >
        <div className="flex items-center gap-2 text-green-600">
          <RefreshCw 
            className={`h-5 w-5 ${isPulling ? 'animate-spin' : ''}`} 
          />
          <span className="text-sm font-medium">
            {pullDistance > 50 ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div 
        className="transition-transform duration-300 ease-out"
        style={{
          transform: `translateY(${Math.min(pullDistance * 0.5, 30)}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;