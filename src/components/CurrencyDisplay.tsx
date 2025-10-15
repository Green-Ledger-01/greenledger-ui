import React from 'react';
import { DollarSign } from 'lucide-react';

interface CurrencyDisplayProps {
  amount: number;
  currency: 'ETH' | 'USD' | 'KES' | 'NGN' | 'ZAR';
  className?: string;
  showAllCurrencies?: boolean;
  compact?: boolean;
}

// Exchange rates for currency conversion (realistic current rates)
const EXCHANGE_RATES = {
  ETH_USD: 2400,  // $2400 per ETH (current approximate)
  USD_KES: 129,   // 129 KES per USD (current rate)
  USD_NGN: 1550,  // 1550 NGN per USD (current rate)
  ETH_KES: 309600, // Direct ETH to KES (2400 * 129)
  ETH_NGN: 3720000, 
  ETH_ZAR: 44400,  // Direct ETH to ZAR (2400 * 18.5)
  USD_ZAR: 18.5,   // 18.5 ZAR per USD (current rate)
};

// Currency symbols and formatting
const CURRENCY_CONFIG = {
  ETH: { symbol: 'Ξ', name: 'Ethereum', decimals: 4 },
  USD: { symbol: '$', name: 'US Dollar', decimals: 2 },
  KES: { symbol: 'KSh', name: 'Kenyan Shilling', decimals: 0 },
  NGN: { symbol: '₦', name: 'Nigerian Naira', decimals: 0 },
  ZAR: { symbol: 'R', name: 'South African Rand', decimals: 2},
};

// Convert between currencies
const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  if (fromCurrency === toCurrency) return amount;

  // Convert to USD first if not already
  let usdAmount = amount;
  if (fromCurrency === 'ETH') {
    usdAmount = amount * EXCHANGE_RATES.ETH_USD;
  } else if (fromCurrency === 'KES') {
    usdAmount = amount / EXCHANGE_RATES.USD_KES;
  } else if (fromCurrency === 'NGN') {
    usdAmount = amount / EXCHANGE_RATES.USD_NGN;
  } else if (fromCurrency === 'ZAR') {
    usdAmount = amount / (EXCHANGE_RATES.USD_ZAR);
  }

  // Convert from USD to target currency
  switch (toCurrency) {
    case 'ETH': return usdAmount / EXCHANGE_RATES.ETH_USD;
    case 'USD': return usdAmount;
    case 'KES': return usdAmount * EXCHANGE_RATES.USD_KES;
    case 'NGN': return usdAmount * EXCHANGE_RATES.USD_NGN;
    case 'ZAR': return usdAmount * (EXCHANGE_RATES.USD_ZAR);
    default: return usdAmount;
  }
};

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  currency,
  className = '',
  showAllCurrencies = false,
  compact = false,
}) => {
  if (amount <= 0) {
    return null;
  }

  const formatCurrency = (value: number, currencyCode: string) => {
    const config = CURRENCY_CONFIG[currencyCode as keyof typeof CURRENCY_CONFIG];
    return `${config.symbol}${value.toLocaleString('en-US', {
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    })}`;
  };

  const primaryConfig = CURRENCY_CONFIG[currency];
  const primaryFormatted = formatCurrency(amount, currency);

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <DollarSign className="h-4 w-4 text-green-600" />
        <span className="font-medium">{primaryFormatted}</span>
        {currency !== 'USD' && (
          <span className="text-xs text-gray-500">
            (≈ {formatCurrency(convertCurrency(amount, currency, 'USD'), 'USD')})
          </span>
        )}
      </div>
    );
  }

  if (!showAllCurrencies) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <DollarSign className="h-4 w-4 text-green-600" />
        <span className="font-medium text-gray-900">{primaryFormatted}</span>
        <span className="text-xs text-gray-500 uppercase">{currency}</span>
      </div>
    );
  }

  // Show all currencies
  const currencies = ['ETH', 'USD', 'KES', 'NGN'] as const;
  const conversions = currencies.map(curr => ({
    code: curr,
    name: CURRENCY_CONFIG[curr].name,
    value: convertCurrency(amount, currency, curr),
    formatted: formatCurrency(convertCurrency(amount, currency, curr), curr),
    isPrimary: curr === currency,
  }));

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="font-medium text-gray-900">{primaryFormatted}</span>
          <span className="text-xs text-gray-500 uppercase">{currency}</span>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-200">
        <div className="text-xs font-medium text-gray-700 mb-2">
          Other Currencies
        </div>

        {conversions
          .filter(conv => !conv.isPrimary)
          .map(conv => (
            <div key={conv.code} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">{conv.name}</span>
                <span className="text-xs text-gray-400 uppercase">({conv.code})</span>
              </div>
              <span className="font-medium text-gray-900">{conv.formatted}</span>
            </div>
          ))}

        <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
          * Estimated rates. Actual rates may vary.
        </div>
      </div>
    </div>
  );
};

export default CurrencyDisplay;
export { convertCurrency, CURRENCY_CONFIG, EXCHANGE_RATES };
