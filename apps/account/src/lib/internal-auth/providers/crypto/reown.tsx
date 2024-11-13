'use client'

import { ReactNode } from 'react'
import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { mainnet, arbitrum } from '@reown/appkit/networks'
import { Eip1193Provider } from 'ethers'

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = '83d72544c914ac57288cf5cff143c370'

// 3. Create a metadata object
const metadata = {
  name: 'Eartho',
  description: '',
  url: 'https://eartho.io',
  icons: ['']
}

// 3. Create the AppKit instance
createAppKit({
  adapters: [new EthersAdapter()],
  metadata,
  networks: [mainnet, arbitrum],
  projectId,
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  }
})

interface Web3ModalProps {
  children: ReactNode;
}

export function Web3Modal({ children }: Web3ModalProps) {
  return <>{children}</>;
}

// Helper function to check if an object is an Eip1193Provider
export function isEip1193Provider(provider: any): provider is Eip1193Provider { 
  return typeof provider?.request === 'function';
}
