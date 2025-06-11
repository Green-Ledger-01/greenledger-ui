import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from '../components/NavBar';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Tokenization from '../pages/Tokenization';
import TransferOwnership from '../pages/TransferOwnership';
import SupplyChainExplorer from '../pages/SupplyChainExplorer';

const AppRoutes = () => {
  return (
    <Router>
      <Navbar />
      <div className="container mx-auto p-4 pt-20">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tokenization" element={<Tokenization />} />
          <Route path="/transfer-ownership" element={<TransferOwnership />} />
          <Route path="/supply-chain-explorer" element={<SupplyChainExplorer />} />
        </Routes>
      </div>
    </Router>
  );
}

export default AppRoutes;
