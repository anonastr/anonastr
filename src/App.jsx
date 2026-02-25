import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import ExposureChecker from './pages/ExposureChecker'
import StealthWallet from './pages/StealthWallet'
import PnlCard from './pages/PnlCard'
import DustSweeper from './pages/DustSweeper'
import ApprovalRevoker from './pages/ApprovalRevoker'
import MultiWallet from './pages/MultiWallet'
import MempoolSniper from './pages/MempoolSniper'
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react'

// Web3Modal Setup
const projectId = 'b56e18d47c72ab683b108174691ce231' // Public fallback

const mainnet = {
  chainId: 1,
  name: 'Aster',
  currency: 'ASTER',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'https://cloudflare-eth.com'
}

const metadata = {
  name: 'Anonastr',
  description: 'Privacy Hub for Degens',
  url: 'https://anonastr.xyz',
  icons: ['https://anonastr.xyz/logo.png']
}

createWeb3Modal({
  ethersConfig: defaultConfig({
    metadata,
    defaultChainId: 1,
    enableEIP6963: true,
    enableInjected: true,
    enableCoinbase: true,
  }),
  chains: [mainnet],
  projectId,
  enableAnalytics: false,
  featuredWalletIds: [
    '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709', // OKX Wallet
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    '38f5d18bd8522c244bdd70cb4a68e0e718865155811c043f052fb9f1c51de662', // Bitget
    '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369'  // Rainbow
  ],
  themeVariables: {
    '--w3m-accent': '#E8C49A',
    '--w3m-color-mix': '#0D0B07',
    '--w3m-color-mix-strength': 40
  }
})

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/exposure" element={<ExposureChecker />} />
        <Route path="/stealth" element={<StealthWallet />} />
        <Route path="/pnl" element={<PnlCard />} />
        <Route path="/sweeper" element={<DustSweeper />} />
        <Route path="/revoke" element={<ApprovalRevoker />} />
        <Route path="/bundle" element={<MultiWallet />} />
        <Route path="/sniper" element={<MempoolSniper />} />
      </Routes>
    </div>
  )
}
