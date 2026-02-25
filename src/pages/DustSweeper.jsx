import { useState } from 'react'
import { ethers } from 'ethers'
import { SweeperIcon } from '../components/icons'
import './DustSweeper.css'

const RPC_URL = 'https://data-seed-prebsc-1-s1.binance.org:8545'

export default function DustSweeper() {
    const [privateKeys, setPrivateKeys] = useState('')
    const [destination, setDestination] = useState('')
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState([])
    const [error, setError] = useState('')

    async function sweepDust() {
        setError('')
        setResults([])

        const dest = destination.trim()
        if (!ethers.isAddress(dest)) {
            setError('Invalid destination address.')
            return
        }

        const keys = privateKeys.split('\n').map(k => k.trim()).filter(Boolean)
        if (keys.length === 0) {
            setError('Please enter at least one private key.')
            return
        }

        setLoading(true)
        const newResults = []
        const provider = new ethers.JsonRpcProvider(RPC_URL)

        try {
            for (const pk of keys) {
                let wallet
                try {
                    wallet = new ethers.Wallet(pk, provider)
                } catch {
                    newResults.push({ key: pk.slice(0, 10) + '...', status: 'error', message: 'Invalid private key' })
                    continue
                }

                try {
                    const balance = await provider.getBalance(wallet.address)
                    if (balance === 0n) {
                        newResults.push({ address: wallet.address, status: 'skipped', message: '0 balance' })
                        continue
                    }

                    // Estimate gas for a simple transfer
                    const gasLimit = 21000n // Standard ETH transfer
                    const feeData = await provider.getFeeData()
                    const gasPrice = feeData.gasPrice || (await provider.getBlock('latest')).baseFeePerGas

                    const gasCost = gasLimit * gasPrice

                    if (balance <= gasCost) {
                        newResults.push({
                            address: wallet.address,
                            status: 'skipped',
                            message: `Balance too low to cover gas (${ethers.formatEther(balance)} ETH)`
                        })
                        continue
                    }

                    // Subtract gas cost from balance to send the maximum possible
                    const amountToSend = balance - gasCost

                    const tx = await wallet.sendTransaction({
                        to: dest,
                        value: amountToSend,
                        gasLimit: gasLimit,
                        gasPrice: gasPrice
                    })

                    newResults.push({
                        address: wallet.address,
                        status: 'success',
                        message: `Sent ${ethers.formatEther(amountToSend)} ETH`,
                        hash: tx.hash
                    })
                } catch (err) {
                    newResults.push({ address: wallet.address, status: 'error', message: err.message || 'Transaction failed' })
                }
            }
            setResults(newResults)
        } catch {
            setError('An unexpected error occurred during sweeping.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page fade-up">
            <h1 className="page-title">Dust Sweeper</h1>
            <p className="page-subtitle">Got 10 burner wallets with $1 of ETH left in each? Sweep them all to a single cold wallet in one click.</p>

            <div className="alert alert-warning" style={{ marginBottom: 24, alignItems: 'flex-start' }}>
                <SweeperIcon style={{ width: 22, height: 22, flexShrink: 0, marginTop: 2, stroke: '#fcd34d' }} />
                <div>
                    <strong>Secure & Local:</strong> Your private keys never leave your browser. Transactions are signed locally and broadcasted directly to the RPC.
                </div>
            </div>

            <div className="card">
                <div className="input-group">
                    <label className="input-label">Destination Address</label>
                    <input
                        className="input"
                        placeholder="0x... (Where to send the funds)"
                        value={destination}
                        onChange={e => setDestination(e.target.value)}
                        spellCheck={false}
                    />
                </div>

                <div className="input-group">
                    <label className="input-label">Burner Private Keys (One per line)</label>
                    <textarea
                        className="input"
                        placeholder="0xabc123...&#10;0xdef456...&#10;..."
                        value={privateKeys}
                        onChange={e => setPrivateKeys(e.target.value)}
                        spellCheck={false}
                        style={{ minHeight: 120, resize: 'vertical' }}
                    />
                </div>

                {error && <div className="alert alert-warning" style={{ marginBottom: 16 }}>⚠️ {error}</div>}

                <button
                    className="btn btn-primary"
                    onClick={sweepDust}
                    disabled={loading || !destination || !privateKeys}
                    style={{ width: '100%' }}
                >
                    {loading ? <><span className="loader" /> Sweeping Dust...</> : <><SweeperIcon color="black" style={{ width: 18, height: 18 }} /> Sweep All Dust</>}
                </button>
            </div>

            {results.length > 0 && (
                <div className="card fade-up" style={{ marginTop: 24 }}>
                    <h3 style={{ marginBottom: 16, fontFamily: 'var(--font-display)', fontSize: '1rem' }}>🧹 Sweep Results</h3>
                    <div className="results-list" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {results.map((r, i) => (
                            <div key={i} className={`result-item ${r.status}`} style={{
                                padding: '12px',
                                borderRadius: '8px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: r.status === 'success' ? 'rgba(16, 185, 129, 0.1)' :
                                    r.status === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                border: `1px solid ${r.status === 'success' ? 'rgba(16, 185, 129, 0.2)' :
                                    r.status === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        {r.address ? `${r.address.slice(0, 6)}...${r.address.slice(-4)}` : r.key}
                                    </span>
                                    <span style={{
                                        fontSize: '0.9rem',
                                        color: r.status === 'success' ? '#10b981' : r.status === 'error' ? '#ef4444' : 'var(--text-secondary)'
                                    }}>
                                        {r.message}
                                    </span>
                                </div>
                                {r.hash && (
                                    <a
                                        href={`https://testnet.bscscan.com/tx/${r.hash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ fontSize: '0.85rem', color: 'var(--brand)', textDecoration: 'none' }}
                                    >
                                        View Tx ↗
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
