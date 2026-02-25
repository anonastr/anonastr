import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import ExposureChecker from './pages/ExposureChecker'
import StealthWallet from './pages/StealthWallet'
import PnlCard from './pages/PnlCard'
import AnonTag from './pages/AnonTag'

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
      </Routes>
    </div>
  )
}
