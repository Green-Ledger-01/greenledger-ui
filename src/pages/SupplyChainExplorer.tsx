import React from 'react';

function SupplyChainExplorer() {
  return (
    <div className="p-5 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Supply Chain Explorer</h2>
      <input type="text" placeholder="Search for produce" className="w-full p-3 mb-4 border rounded" />
      <div className="border p-4 rounded bg-white">
        <p>Farmer Distributor Retailer</p>
        <p>Retailer: (Details)</p>
        <p>Metadata: (Details)</p>
        <p>Transaction Logs: (Details)</p>
      </div>
    </div>
  );
}
export default SupplyChainExplorer;
