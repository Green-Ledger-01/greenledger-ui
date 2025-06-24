import React, { useState, useEffect } from 'react';
import CurrencyDisplay from './CurrencyDisplay';
import { getAllCurrencyConversions, formatCurrency, SUPPORTED_CURRENCIES } from '../utils/currency';

const CurrencyTestComponent: React.FC = () => {
  const [testAmount, setTestAmount] = useState(0.01);
  const [conversions, setConversions] = useState<any>(null);

  useEffect(() => {
    const testConversion = async () => {
      try {
        console.log('Testing currency conversion for:', testAmount, 'ETH');
        const result = await getAllCurrencyConversions(testAmount);
        console.log('Conversion result:', result);
        setConversions(result);
      } catch (error) {
        console.error('Currency conversion test failed:', error);
      }
    };

    if (testAmount > 0) {
      testConversion();
    }
  }, [testAmount]);

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Currency Conversion Test</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Test Amount (ETH):
        </label>
        <input
          type="number"
          value={testAmount}
          onChange={(e) => setTestAmount(parseFloat(e.target.value) || 0)}
          step="0.001"
          min="0"
          className="border border-gray-300 rounded px-3 py-2 w-32"
        />
      </div>

      {conversions && (
        <div className="mb-4">
          <h4 className="font-medium mb-2">Raw Conversion Data:</h4>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(conversions, null, 2)}
          </pre>
        </div>
      )}

      <div className="mb-4">
        <h4 className="font-medium mb-2">CurrencyDisplay Component:</h4>
        <CurrencyDisplay
          ethAmount={testAmount}
          showAllCurrencies={true}
          primaryCurrency="USD"
        />
      </div>

      <div className="mb-4">
        <h4 className="font-medium mb-2">Compact Display:</h4>
        <CurrencyDisplay
          ethAmount={testAmount}
          compact={true}
          primaryCurrency="USD"
        />
      </div>

      <div className="mb-4">
        <h4 className="font-medium mb-2">Manual Currency Formatting Test:</h4>
        <div className="space-y-1 text-sm">
          {Object.keys(SUPPORTED_CURRENCIES).map((currency) => (
            <div key={currency} className="flex justify-between">
              <span>{currency}:</span>
              <span>{formatCurrency(testAmount * 2000, currency as any)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-medium mb-2">Simple Price Display (No API):</h4>
        <div className="p-3 bg-green-50 border border-green-200 rounded">
          <div className="text-lg font-bold">{testAmount} ETH</div>
          <div className="text-sm text-gray-600">≈ $2,000 USD (estimated)</div>
          <div className="text-sm text-gray-600">≈ KSh 300,000 KES (estimated)</div>
          <div className="text-sm text-gray-600">≈ ₦1,600,000 NGN (estimated)</div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyTestComponent;
