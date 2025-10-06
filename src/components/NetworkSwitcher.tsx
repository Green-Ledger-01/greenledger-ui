import React from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { ChevronDown, Wifi, AlertTriangle } from 'lucide-react';
import { liskSepolia } from '../chains/liskSepolia';
import { u2uMainnet } from '../chains/u2uMainnet';

const NetworkSwitcher: React.FC = () => {
  const { chain } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  const networks = [
    {
      chain: liskSepolia,
      name: 'Lisk Sepolia',
      type: 'Testnet',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      chain: u2uMainnet,
      name: 'U2U Network',
      type: 'Mainnet',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
  ];

  const currentNetwork = networks.find(n => n.chain.id === chain?.id);
  const isUnsupported = !currentNetwork;

  return (
    <div className="relative">
      <div className={`
        flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium cursor-pointer
        ${isUnsupported 
          ? 'bg-red-50 border-red-200 text-red-600' 
          : `${currentNetwork?.bgColor} ${currentNetwork?.borderColor} ${currentNetwork?.color}`
        }
      `}>
        <div className="flex items-center gap-2">
          {isUnsupported ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <Wifi className="h-4 w-4" />
          )}
          <span>
            {isUnsupported ? 'Unsupported Network' : currentNetwork?.name}
          </span>
          {currentNetwork && (
            <span className="text-xs opacity-75">
              {currentNetwork.type}
            </span>
          )}
        </div>
        <ChevronDown className="h-4 w-4" />
      </div>

      {/* Network Options (Simple version - can be enhanced with dropdown) */}
      <div className="mt-2 space-y-1">
        {networks.map((network) => (
          <button
            key={network.chain.id}
            onClick={() => switchChain({ chainId: network.chain.id })}
            disabled={isPending || chain?.id === network.chain.id}
            className={`
              w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm
              ${chain?.id === network.chain.id
                ? `${network.bgColor} ${network.borderColor} ${network.color} border`
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              <span>{network.name}</span>
              <span className="text-xs opacity-75">{network.type}</span>
            </div>
            {chain?.id === network.chain.id && (
              <div className="w-2 h-2 bg-current rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NetworkSwitcher;