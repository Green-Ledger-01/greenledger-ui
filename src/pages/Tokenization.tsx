import React from 'react';

function Tokenization() {
  const handleMint = () => {
    alert('Token minted! (Placeholder)');
  };

  return (
    <div className="p-5 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Tokenization Form</h2>
      <input placeholder="Produce Name" className="w-full p-3 mb-3 border rounded" />
      <input placeholder="Description" className="w-full p-3 mb-3 border rounded" />
      <input placeholder="Harvest Date" type="date" className="w-full p-3 mb-3 border rounded" />
      <select className="w-full p-3 mb-3 border rounded">
        <option>Location</option>
        <option>Farm A</option>
        <option>Farm B</option>
      </select>
      <input placeholder="Quantity" type="number" className="w-full p-3 mb-3 border rounded" />
      <button onClick={handleMint} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Mint Token</button>
    </div>
  );
}
export default Tokenization;
