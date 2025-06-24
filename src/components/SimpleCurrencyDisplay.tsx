import React from 'react';
import { DollarSign } from 'lucide-react';

interface SimpleCurrencyDisplayProps {
  ethAmount: number;
  className?: string;
  showAllCurrencies?: boolean;
}

// Static exchange rates (fallback when APIs don't work)
const STATIC_RATES = {
  ETH_USD: 2000,  // $2000 per ETH
  USD_KES: 150,   // 150 KES per USD
  USD_NGN: 800,   // 800 NGN per USD
};

const SimpleCurrencyDisplay: React.FC<SimpleCurrencyDisplayProps> = ({
  ethAmount,
  className = '',
  showAllCurrencies = false,
}) => {
  if (ethAmount <= 0) {
    return null;
  }

  const usdAmount = ethAmount * STATIC_RATES.ETH_USD;
  const kesAmount = usdAmount * STATIC_RATES.USD_KES;
  const ngnAmount = usdAmount * STATIC_RATES.USD_NGN;

  const formatCurrency = (amount: number, symbol: string, decimals: number = 2) => {
    return `${symbol}${amount.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  };

  if (!showAllCurrencies) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <DollarSign className="h-4 w-4 text-green-600" />
        <span className="font-medium">
          {formatCurrency(usdAmount, '$')}
        </span>
        <span className="text-xs text-gray-500">
          ({ethAmount.toFixed(3)} ETH)
        </span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="font-medium text-gray-900">
            {formatCurrency(usdAmount, '$')}
          </span>
          <span className="text-xs text-gray-500 uppercase">USD</span>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-200">
        <div className="text-xs font-medium text-gray-700 mb-2">
          Other Currencies (Estimated)
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Kenyan Shilling</span>
            <span className="text-xs text-gray-400 uppercase">(KES)</span>
          </div>
          <span className="font-medium text-gray-900">
            {formatCurrency(kesAmount, 'KSh ', 0)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Nigerian Naira</span>
            <span className="text-xs text-gray-400 uppercase">(NGN)</span>
          </div>
          <span className="font-medium text-gray-900">
            {formatCurrency(ngnAmount, '₦', 0)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Ethereum</span>
            <span className="text-xs text-gray-400 uppercase">(ETH)</span>
          </div>
          <span className="font-medium text-gray-900">
            {formatCurrency(ethAmount, 'Ξ', 4)}
          </span>
        </div>
        
        <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
          * Estimated rates. Actual rates may vary.
        </div>
      </div>
    </div>
  );
};

export default SimpleCurrencyDisplay;
