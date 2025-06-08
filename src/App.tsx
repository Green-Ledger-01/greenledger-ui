import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ConnectButton } from '@rainbow-me/rainbowkit'


export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-green-200 p-8 flex flex-col items-center justify-center">
      <h1 className="text-5xl font-extrabold text-green-800 mb-8 animate-fade-in-down drop-shadow-lg">
        🌿 GreenLedger DApp
      </h1>

      <div className="transform transition-transform duration-300 hover:scale-105 hover:rotate-1 animate-fade-in-up">
        <ConnectButton />
      </div>
    </div>
  );
}
