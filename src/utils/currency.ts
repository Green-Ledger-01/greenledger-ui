/**
 * Currency Conversion Utilities
 * Handles conversion between ETH and various fiat currencies
 */

// Currency configuration
export const SUPPORTED_CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar', code: 'USD' },
  KES: { symbol: 'KSh', name: 'Kenyan Shilling', code: 'KES' },
  NGN: { symbol: '₦', name: 'Nigerian Naira', code: 'NGN' },
  ETH: { symbol: 'Ξ', name: 'Ethereum', code: 'ETH' },
} as const;

export type CurrencyCode = keyof typeof SUPPORTED_CURRENCIES;

// Exchange rate cache
interface ExchangeRateCache {
  rates: Record<string, number>;
  lastUpdated: number;
  ethPriceUSD: number;
}

let exchangeRateCache: ExchangeRateCache = {
  rates: {},
  lastUpdated: 0,
  ethPriceUSD: 0,
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const FALLBACK_RATES = {
  // Fallback rates in case API fails (approximate values)
  ETH_USD: 2000, // $2000 per ETH
  USD_KES: 150,  // 150 KES per USD
  USD_NGN: 800,  // 800 NGN per USD
};

/**
 * Fetch current exchange rates from a free API
 */
async function fetchExchangeRates(): Promise<void> {
  try {
    // Fetch ETH price in USD from CoinGecko (free API, no key required)
    const ethResponse = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
    );
    
    if (!ethResponse.ok) {
      throw new Error('Failed to fetch ETH price');
    }
    
    const ethData = await ethResponse.json();
    const ethPriceUSD = ethData.ethereum?.usd || FALLBACK_RATES.ETH_USD;

    // Fetch fiat exchange rates from exchangerate-api (free tier)
    let fiatRates = {};
    try {
      const fiatResponse = await fetch(
        'https://api.exchangerate-api.com/v4/latest/USD'
      );

      if (fiatResponse.ok) {
        const fiatData = await fiatResponse.json();
        fiatRates = fiatData.rates || {};
        console.log('Fiat rates fetched successfully:', fiatRates);
      } else {
        console.warn('Fiat rates API returned error:', fiatResponse.status);
      }
    } catch (fiatError) {
      console.warn('Failed to fetch fiat rates, using fallbacks:', fiatError);
    }

    // Update cache
    exchangeRateCache = {
      rates: {
        ETH_USD: ethPriceUSD,
        USD_KES: fiatRates.KES || FALLBACK_RATES.USD_KES,
        USD_NGN: fiatRates.NGN || FALLBACK_RATES.USD_NGN,
        USD_USD: 1, // Base rate
      },
      lastUpdated: Date.now(),
      ethPriceUSD,
    };

    console.log('Exchange rates updated successfully:', {
      ethPriceUSD,
      rates: exchangeRateCache.rates,
      fiatRatesReceived: Object.keys(fiatRates).length
    });
  } catch (error) {
    console.warn('Failed to fetch exchange rates, using fallback rates:', error);
    
    // Use fallback rates if API fails
    if (exchangeRateCache.lastUpdated === 0) {
      exchangeRateCache = {
        rates: {
          ETH_USD: FALLBACK_RATES.ETH_USD,
          USD_KES: FALLBACK_RATES.USD_KES,
          USD_NGN: FALLBACK_RATES.USD_NGN,
          USD_USD: 1,
        },
        lastUpdated: Date.now(),
        ethPriceUSD: FALLBACK_RATES.ETH_USD,
      };
    }
  }
}

/**
 * Get current exchange rates, fetching if cache is stale
 */
async function getExchangeRates(): Promise<ExchangeRateCache> {
  const now = Date.now();
  const cacheAge = now - exchangeRateCache.lastUpdated;
  
  if (cacheAge > CACHE_DURATION || exchangeRateCache.lastUpdated === 0) {
    await fetchExchangeRates();
  }
  
  return exchangeRateCache;
}

/**
 * Convert ETH amount to specified currency
 */
export async function convertETHToFiat(
  ethAmount: number,
  targetCurrency: CurrencyCode
): Promise<number> {
  if (targetCurrency === 'ETH') {
    return ethAmount;
  }

  const rates = await getExchangeRates();
  
  // Convert ETH to USD first
  const usdAmount = ethAmount * rates.ethPriceUSD;
  
  // Then convert USD to target currency
  switch (targetCurrency) {
    case 'USD':
      return usdAmount;
    case 'KES':
      return usdAmount * rates.rates.USD_KES;
    case 'NGN':
      return usdAmount * rates.rates.USD_NGN;
    default:
      return usdAmount;
  }
}

/**
 * Format currency amount with proper symbol and decimals
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode,
  options: {
    showSymbol?: boolean;
    decimals?: number;
    compact?: boolean;
  } = {}
): string {
  const {
    showSymbol = true,
    decimals = currency === 'ETH' ? 4 : 2,
    compact = false,
  } = options;

  const currencyInfo = SUPPORTED_CURRENCIES[currency];
  
  // Format number with appropriate decimals
  let formattedAmount: string;
  
  if (compact && amount >= 1000000) {
    formattedAmount = (amount / 1000000).toFixed(1) + 'M';
  } else if (compact && amount >= 1000) {
    formattedAmount = (amount / 1000).toFixed(1) + 'K';
  } else {
    formattedAmount = amount.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  if (showSymbol) {
    return `${currencyInfo.symbol}${formattedAmount}`;
  }
  
  return formattedAmount;
}

/**
 * Get all currency conversions for an ETH amount
 */
export async function getAllCurrencyConversions(ethAmount: number): Promise<{
  [K in CurrencyCode]: {
    amount: number;
    formatted: string;
    symbol: string;
  }
}> {
  const conversions = {} as any;
  
  for (const currency of Object.keys(SUPPORTED_CURRENCIES) as CurrencyCode[]) {
    const amount = await convertETHToFiat(ethAmount, currency);
    const currencyInfo = SUPPORTED_CURRENCIES[currency];
    
    conversions[currency] = {
      amount,
      formatted: formatCurrency(amount, currency),
      symbol: currencyInfo.symbol,
    };
  }
  
  return conversions;
}

/**
 * Initialize exchange rates on app start
 */
export function initializeCurrencyRates(): void {
  // Fetch rates immediately
  fetchExchangeRates();
  
  // Set up periodic updates every 5 minutes
  setInterval(fetchExchangeRates, CACHE_DURATION);
}

/**
 * Get cached exchange rates without fetching
 */
export function getCachedRates(): ExchangeRateCache {
  return exchangeRateCache;
}
