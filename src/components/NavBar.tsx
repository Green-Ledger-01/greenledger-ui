import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  
  const handleConnect = () => {
    connect({ connector: injected() });
  };

  return (
    <nav className="bg-green-800 text-white p-4 fixed w-full z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">🌿 GreenLedger</Link>
        
        <button onClick={toggleMenu} className="md:hidden">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        <div className={`md:flex items-center ${isOpen ? 'block absolute top-16 left-0 right-0 bg-green-800 p-4' : 'hidden'} md:static`}>
          <NavLink 
            to="/dashboard" 
            className={({isActive}) => 
              `px-4 py-2 hover:bg-green-700 rounded ${isActive ? 'bg-green-700' : ''}`
            }
          >
            Dashboard
          </NavLink>
          
          <NavLink 
            to="/tokenization" 
            className={({isActive}) => 
              `px-4 py-2 hover:bg-green-700 rounded ${isActive ? 'bg-green-700' : ''}`
            }
          >
            Tokenization
          </NavLink>
          
          <NavLink 
            to="/transfer-ownership" 
            className={({isActive}) => 
              `px-4 py-2 hover:bg-green-700 rounded ${isActive ? 'bg-green-700' : ''}`
            }
          >
            Transfer
          </NavLink>
          
          <NavLink 
            to="/supply-chain-explorer" 
            className={({isActive}) => 
              `px-4 py-2 hover:bg-green-700 rounded ${isActive ? 'bg-green-700' : ''}`
            }
          >
            Explorer
          </NavLink>
          
          {isConnected ? (
            <div className="md:ml-4 flex md:flex-row flex-col items-center">
              <span className="md:ml-4 px-2 py-1 bg-green-900 rounded text-sm">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <button 
                onClick={() => disconnect()} 
                className="md:ml-2 mt-2 md:mt-0 px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              onClick={handleConnect} 
              className="md:ml-4 mt-2 md:mt-0 px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
