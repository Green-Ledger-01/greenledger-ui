import React, { useState, useEffect } from 'react';
import { DollarSign, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  getAllCurrencyConversions, 
  formatCurrency, 
  SUPPORTED_CURRENCIES,
  type CurrencyCode 
} from '../utils/currency';

interface CurrencyDisplayProps {
  ethAmount: number;
  className?: string;
  showAllCurrencies?: boolean;
  primaryCurrency?: CurrencyCode;
  compact?: boolean;
}

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  ethAmount,
  className = '',
  showAllCurrencies = false,
  primaryCurrency = 'ETH',
  compact = false,
}) => {
  const [conversions, setConversions] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversions = async () => {
      try {
        console.log('CurrencyDisplay: Starting conversion for', ethAmount, 'ETH');
        setIsLoading(true);
        setError(null);
        const result = await getAllCurrencyConversions(ethAmount);
        console.log('CurrencyDisplay: Conversion result:', result);
        setConversions(result);
      } catch (err) {
        setError('Failed to load exchange rates');
        console.error('Currency conversion error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (ethAmount > 0) {
      fetchConversions();
    } else {
      console.log('CurrencyDisplay: ethAmount is 0 or negative, not fetching conversions');
    }
  }, [ethAmount]);

  const handleRefresh = async () => {
    if (ethAmount > 0) {
      setIsLoading(true);
      try {
        const result = await getAllCurrencyConversions(ethAmount);
        setConversions(result);
        setError(null);
      } catch (err) {
        setError('Failed to refresh rates');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (ethAmount <= 0) {
    return null;
  }

  if (isLoading && !conversions) {
    return (
      <div className={`flex items-center gap-2 text-gray-500 ${className}`}>
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading prices...</span>
      </div>
    );
  }

  if (error && !conversions) {
    return (
      <div className={`flex items-center gap-2 text-red-500 ${className}`}>
        <DollarSign className="h-4 w-4" />
        <span className="text-sm">{error}</span>
        <button
          onClick={handleRefresh}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!conversions) {
    return null;
  }

  const primaryConversion = conversions[primaryCurrency];
  const otherCurrencies = Object.keys(conversions).filter(
    (currency) => currency !== primaryCurrency
  ) as CurrencyCode[];

  if (compact) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <DollarSign className="h-3 w-3 text-green-600" />
        <span className="text-sm font-medium">
          {primaryConversion?.formatted || formatCurrency(ethAmount, primaryCurrency)}
        </span>
        {conversions.USD && primaryCurrency !== 'USD' && (
          <span className="text-xs text-gray-500">
            (≈ {conversions.USD.formatted})
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Primary Currency Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="font-medium text-gray-900">
            {primaryConversion?.formatted || formatCurrency(ethAmount, primaryCurrency)}
          </span>
          <span className="text-xs text-gray-500 uppercase">
            {SUPPORTED_CURRENCIES[primaryCurrency].code}
          </span>
        </div>
        
        {showAllCurrencies && otherCurrencies.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Refresh exchange rates"
            >
              <RefreshCw className={`h-3 w-3 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              <span>Other currencies</span>
              {isExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Expanded Currency List */}
      {showAllCurrencies && isExpanded && (
        <div className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-200">
          <div className="text-xs font-medium text-gray-700 mb-2">
            Exchange Rates
          </div>
          {otherCurrencies.map((currency) => {
            const conversion = conversions[currency];
            const currencyInfo = SUPPORTED_CURRENCIES[currency];
            
            return (
              <div key={currency} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">{currencyInfo.name}</span>
                  <span className="text-xs text-gray-400 uppercase">
                    ({currencyInfo.code})
                  </span>
                </div>
                <span className="font-medium text-gray-900">
                  {conversion.formatted}
                </span>
              </div>
            );
          })}
          
          <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
            Rates updated every 5 minutes
          </div>
        </div>
      )}

      {/* Quick Currency Preview (when not expanded) */}
      {showAllCurrencies && !isExpanded && otherCurrencies.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs text-gray-600">
          {otherCurrencies.slice(0, 2).map((currency) => {
            const conversion = conversions[currency];
            return (
              <span key={currency} className="bg-gray-100 px-2 py-1 rounded">
                {conversion.formatted} {SUPPORTED_CURRENCIES[currency].code}
              </span>
            );
          })}
          {otherCurrencies.length > 2 && (
            <span className="text-gray-400">
              +{otherCurrencies.length - 2} more
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default CurrencyDisplay;
