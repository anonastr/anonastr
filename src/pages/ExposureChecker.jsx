import { useState } from 'react'
import { ethers } from 'ethers'
import { EyeIcon } from '../components/icons'
import './ExposureChecker.css'

// Known CEX deposit address prefixes/patterns (simplified denylist)
const CEX_ADDRESSES = [
    '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE', // Binance
    '0xD551234Ae421e3BCBA99A0Da6d736074f22192FF', // Binance
    '0x564286362092D8e7936f0549571a803B203aAceD', // Binance
    '0x0681d8Db095565FE8A346fA0277bFfDE9C0edBBF', // Binance
    '0xfE9e8709d3215310075d67E3ed32A380CCf451C8', // Binance
    '0xA910f92ACdAf488fa6eF02174fb86208Ad7722ba', // Kraken
    '0x267be1C1D684F78cb4F6a176C4911b741E4Ffdc0', // Kraken
    '0x0D0707963952f2fBA59dD06f2b425ace40b492Fe', // Gate.io
    '0x1C4b0d6dFc5B5afaf6a34E73da85C08aBD2B7e89', // OKX
].map(a => a.toLowerCase())

const RPC_URL = 'https://data-seed-prebsc-1-s1.binance.org:8545'

function scoreToLabel(score) {
    if (score >= 70) return { label: 'HIGH RISK', color: 'red', emoji: '🔴' }
    if (score >= 40) return { label: 'MEDIUM RISK', color: 'yellow', emoji: '🟡' }
    return { label: 'LOW RISK', color: 'green', emoji: '🟢' }
}

export default function ExposureChecker() {
    const [address, setAddress] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')

    async function connectWallet() {
        if (!window.ethereum) { setError('No wallet detected. Install MetaMask.'); return }
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
            setAddress(accounts[0])
        } catch {
            setError('Wallet connection rejected.')
        }
    }

    async function checkExposure() {
        setError('')
        setResult(null)
        const addr = address.trim()
        if (!ethers.isAddress(addr)) { setError('Invalid Ethereum address.'); return }

        setLoading(true)
        try {
            const provider = new ethers.JsonRpcProvider(RPC_URL)
            const [txCount, balance] = await Promise.all([
                provider.getTransactionCount(addr),
                provider.getBalance(addr),
            ])

            // ENS check (mainnet only, will fail gracefully on testnet)
            let hasENS = false
            try {
                const mainnetProvider = new ethers.JsonRpcProvider('https://eth.llamarpc.com')
                const name = await mainnetProvider.lookupAddress(addr)
                hasENS = !!name
            } catch { /* ignore */ }

            // Risk factors
            const risks = []
            let score = 0

            if (hasENS) {
                risks.push({ text: 'Has ENS name — wallet is linked to a public identity', severity: 'high' })
                score += 30
            }

            if (txCount > 500) {
                risks.push({ text: `High activity: ${txCount} transactions — wallet has a long history`, severity: 'high' })
                score += 25
            } else if (txCount > 100) {
                risks.push({ text: `Moderate activity: ${txCount} transactions`, severity: 'medium' })
                score += 15
            } else if (txCount > 10) {
                risks.push({ text: `Some activity: ${txCount} transactions`, severity: 'low' })
                score += 5
            }

            if (txCount === 0) {
                risks.push({ text: 'Fresh wallet — no transaction history', severity: 'good' })
            }

            const balEth = parseFloat(ethers.formatEther(balance))
            if (balEth > 10) {
                risks.push({ text: `Large balance: ${balEth.toFixed(4)} ETH — high-value target`, severity: 'medium' })
                score += 10
            }

            // Deterministic CEX check based on address hash
            const addrLower = addr.toLowerCase()
            const hasCEXLink = CEX_ADDRESSES.some(cex => cex === addrLower)
            if (hasCEXLink) {
                risks.push({ text: 'Address matches known CEX deposit address — fully doxed', severity: 'high' })
                score += 35
            }

            // Wallet age proxy
            if (txCount < 5) {
                risks.push({ text: 'New wallet — minimal on-chain footprint', severity: 'good' })
            }

            score = Math.min(100, score)

            if (risks.length === 0) {
                risks.push({ text: 'No obvious privacy risks detected', severity: 'good' })
            }

            setResult({
                address: addr,
                txCount,
                balance: balEth.toFixed(4),
                hasENS,
                score,
                risks,
            })
        } catch (e) {
            setError('Failed to fetch on-chain data. Check your connection.')
        } finally {
            setLoading(false)
        }
    }

    const risk = result ? scoreToLabel(result.score) : null

    return (
        <div className="page fade-up">
            <h1 className="page-title">Wallet Exposure Checker</h1>
            <p className="page-subtitle">Find out how exposed your wallet is to surveillance, copycats, and de-anonymization.</p>

            <div className="card">
                <div className="input-group">
                    <label className="input-label">Wallet Address</label>
                    <div className="input-row">
                        <input
                            className="input"
                            placeholder="0x..."
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            spellCheck={false}
                        />
                        <button className="btn btn-ghost" onClick={connectWallet}>Connect Wallet</button>
                    </div>
                </div>

                {error && <div className="alert alert-warning" style={{ marginBottom: 16 }}>⚠️ {error}</div>}

                <button
                    className="btn btn-primary"
                    onClick={checkExposure}
                    disabled={loading || !address}
                    style={{ width: '100%' }}
                >
                    {loading ? <><span className="loader" /> Analyzing...</> : <><EyeIcon color="black" style={{ width: 18, height: 18 }} /> Analyze Exposure</>}
                </button>
            </div>

            {result && (
                <div className="result-section fade-up">
                    {/* Score gauge */}
                    <div className={`score-card score-${risk.color}`}>
                        <div className="score-gauge">
                            <svg viewBox="0 0 120 70" className="gauge-svg">
                                <path d="M 10 65 A 55 55 0 0 1 110 65" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" strokeLinecap="round" />
                                <path
                                    d="M 10 65 A 55 55 0 0 1 110 65"
                                    fill="none"
                                    stroke={risk.color === 'red' ? '#ef4444' : risk.color === 'yellow' ? '#f59e0b' : '#10b981'}
                                    strokeWidth="10"
                                    strokeLinecap="round"
                                    strokeDasharray={`${(result.score / 100) * 172} 172`}
                                    className="gauge-progress"
                                />
                                <text x="60" y="58" textAnchor="middle" fill="white" fontSize="20" fontWeight="800" fontFamily="Space Grotesk">{result.score}</text>
                            </svg>
                            <div className="gauge-label">Risk Score / 100</div>
                        </div>
                        <div className="score-info">
                            <div className={`risk-badge badge-${risk.color}`}>{risk.emoji} {risk.label}</div>
                            <div className="score-stats">
                                <div className="stat-box"><div className="stat-value">{result.txCount}</div><div className="stat-label">Transactions</div></div>
                                <div className="stat-box"><div className="stat-value">{result.balance}</div><div className="stat-label">ASTER Balance</div></div>
                                <div className="stat-box"><div className="stat-value">{result.hasENS ? 'Yes' : 'No'}</div><div className="stat-label">Has ENS</div></div>
                            </div>
                        </div>
                    </div>

                    {/* Risk breakdown */}
                    <div className="card" style={{ marginTop: 16 }}>
                        <h3 style={{ marginBottom: 16, fontFamily: 'var(--font-display)', fontSize: '1rem' }}>📋 Risk Breakdown</h3>
                        <div className="risks-list">
                            {result.risks.map((r, i) => (
                                <div key={i} className={`risk-item risk-${r.severity}`}>
                                    <span className="risk-dot" />
                                    <span>{r.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="alert alert-info" style={{ marginTop: 16 }}>
                        💡 <strong>Tips:</strong> Use a stealth wallet for new interactions, avoid ENS on trading wallets, and never deposit directly from a CEX to your main wallet.
                    </div>
                </div>
            )}
        </div>
    )
}
