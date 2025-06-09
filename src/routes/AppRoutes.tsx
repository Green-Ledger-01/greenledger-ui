import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Tokenization from '../pages/Tokenization';
import TransferOwnership from '../pages/TransferOwnership';
import SupplyChainExplorer from '../pages/SupplyChainExplorer';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tokenization" element={<Tokenization />} />
        <Route path="/transfer-ownership" element={<TransferOwnership />} />
        <Route path="/supply-chain-explorer" element={<SupplyChainExplorer />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;