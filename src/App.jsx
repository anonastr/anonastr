import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import ExposureChecker from './pages/ExposureChecker'
import StealthWallet from './pages/StealthWallet'
import PnlCard from './pages/PnlCard'
import AnonTag from './pages/AnonTag'
import DustSweeper from './pages/DustSweeper'
import ApprovalRevoker from './pages/ApprovalRevoker'
import MultiWallet from './pages/MultiWallet'
import MempoolSniper from './pages/MempoolSniper'

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/exposure" element={<ExposureChecker />} />
        <Route path="/stealth" element={<StealthWallet />} />
        <Route path="/pnl" element={<PnlCard />} />
        <Route path="/tag" element={<AnonTag />} />
        <Route path="/sweeper" element={<DustSweeper />} />
        <Route path="/revoke" element={<ApprovalRevoker />} />
        <Route path="/bundle" element={<MultiWallet />} />
        <Route path="/sniper" element={<MempoolSniper />} />
      </Routes>
    </div>
  )
}
