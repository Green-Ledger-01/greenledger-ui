import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAccount, useConnect, useDisconnect, Connector } from 'wagmi';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const connectors: Connector[] = []; // Define or fetch connectors here
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Supply Chain DApp</Link>
        <button onClick={toggleMenu} className="md:hidden">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className={`md:flex ${isOpen ? 'block' : 'hidden'}`}>
          <NavLink to="/dashboard" className="px-4 py-2 hover:bg-gray-700 rounded">Dashboard</NavLink>
          {isConnected ? (
            <>
              <span className="ml-4">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
              <button onClick={() => disconnect()} className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded">Disconnect</button>
            </>
          ) : (
            <button onClick={() => connect({ connector: connectors[0] })} className="ml-4 px-4 py-2 bg-green-600 hover:bg-green-700 rounded">Connect</button>
          )}
        </div>
      </div>
    </nav>
  );
};
export default Navbar;