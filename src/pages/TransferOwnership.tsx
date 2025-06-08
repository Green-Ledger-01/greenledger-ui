import React from 'react';

function TransferOwnership() {
  const handleTransfer = () => {
    alert('Ownership transferred! (Placeholder)');
  };

  return (
    <div className="p-5 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Transfer Ownership</h2>
      <select className="w-full p-3 mb-3 border rounded">
        <option>Select produce token</option>
        <option>Token 1</option>
        <option>Token 2</option>
      </select>
      <input placeholder="Wallet Address" className="w-full p-3 mb-3 border rounded" />
      <button onClick={handleTransfer} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">Confirm Transaction</button>
    </div>
  );
}
export default TransferOwnership;
