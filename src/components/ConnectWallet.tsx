import React from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'

function truncateAddress(address: string): string {
  return address.slice(0, 6) + '...' + address.slice(-4)
}

export default function ConnectWallet() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  return (
    <div style={{
      border: '1px solid #00C853',
      borderRadius: 12,
      padding: 20,
      maxWidth: 400,
      backgroundColor: '#121212',
      color: '#fff'
    }}>
      <ConnectButton />
      {isConnected && (
        <div style={{ marginTop: 20 }}>
          <p><strong>Wallet Connected:</strong> {truncateAddress(address!)}</p>
          <button
            onClick={() => navigator.clipboard.writeText(address!)}
            style={{
              marginTop: 8,
              padding: '6px 12px',
              backgroundColor: '#00C853',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer'
            }}
          >
            Copy Address
          </button>
          <button
            onClick={() => disconnect()}
            style={{
              marginLeft: 10,
              padding: '6px 12px',
              backgroundColor: '#ff5252',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer'
            }}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  )
}