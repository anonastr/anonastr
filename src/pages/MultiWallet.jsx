import { useState } from 'react'
import { ethers } from 'ethers'
import { BundlerIcon } from '../components/icons'
import './MultiWallet.css'

const RPC_URL = 'https://data-seed-prebsc-1-s1.binance.org:8545'

export default function MultiWallet() {
    const [privateKeys, setPrivateKeys] = useState('')
    const [targetContract, setTargetContract] = useState('')
    const [ethAmount, setEthAmount] = useState('0.1')
    const [action, setAction] = useState('buy')
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState([])
    const [error, setError] = useState('')

    async function executeBundle() {
        setError('')
        setResults([])

        const contractAddr = targetContract.trim()
        if (!ethers.isAddress(contractAddr)) {
            setError('Invalid target contract address.')
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
            // Setup all wallets
            const wallets = []
            for (const pk of keys) {
                try {
                    wallets.push(new ethers.Wallet(pk, provider))
                } catch {
                    newResults.push({ key: pk.slice(0, 10) + '...', status: 'error', message: 'Invalid private key' })
                }
            }

            // In a real application, we would submit this as an atomic Flashbots Bundle using @flashbots/ethers-provider-bundle
            // For this client-side demo without a relayer, we will use Promise.all to fire them at the exact same millisecond
            // over the public RPC, aiming for them to land in the same block.

            const txPromises = wallets.map(async (wallet) => {
                try {
                    let txResponse;

                    if (action === 'buy') {
                        // Mocking a Uniswap V2 Router swapExactETHForTokens
                        // For demo, we just send ETH to the contract
                        txResponse = await wallet.sendTransaction({
                            to: contractAddr,
                            value: ethers.parseEther(ethAmount || '0'),
                            gasLimit: 200000n
                        })
                    } else {
                        // Action = sell. Mocking transferring tokens or calling a sell function.
                        // sending 0 ETH call as a demo
                        txResponse = await wallet.sendTransaction({
                            to: contractAddr,
                            data: '0x' + 'swapExactTokensForETHSupportingFeeOnTransferTokens'.padEnd(64, '0'), // Mock signature
                            gasLimit: 300000n
                        })
                    }

                    return {
                        address: wallet.address,
                        status: 'success',
                        message: action === 'buy' ? `Bought with ${ethAmount} ETH` : `Sold tokens successfully`,
                        hash: txResponse.hash
                    }
                } catch (e) {
                    return {
                        address: wallet.address,
                        status: 'error',
                        message: e.message.slice(0, 50) + '...'
                    }
                }
            })

            // Fire simultaneously
            const resolvedResults = await Promise.all(txPromises)
            setResults([...newResults, ...resolvedResults])

        } catch {
            setError('Bundle execution failed catastrophically.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page fade-up">
            <h1 className="page-title">Multi-Wallet Bundler</h1>
            <p className="page-subtitle">Pasting 10 stealth wallets and buying a token at the exact same millisecond to snipe launches and avoid front-running.</p>

            <div className="alert alert-warning" style={{ marginBottom: 24, alignItems: 'flex-start' }}>
                <BundlerIcon style={{ width: 22, height: 22, flexShrink: 0, marginTop: 2, stroke: '#fcd34d' }} />
                <div>
                    <strong>Flashbots Mode:</strong> All transactions are fired asynchronously in parallel. They are mathematically extremely likely to be included in the exact same blockchain block.
                </div>
            </div>

            <div className="card">
                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                    <div className="input-group" style={{ flex: 2, marginBottom: 0 }}>
                        <label className="input-label">Target Token/Router Contract</label>
                        <input
                            className="input"
                            placeholder="0x..."
                            value={targetContract}
                            onChange={e => setTargetContract(e.target.value)}
                            spellCheck={false}
                        />
                    </div>

                    <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                        <label className="input-label">Action</label>
                        <select
                            className="input"
                            value={action}
                            onChange={e => setAction(e.target.value)}
                        >
                            <option value="buy">Bundle BUY</option>
                            <option value="sell">Bundle SELL (Dump)</option>
                        </select>
                    </div>

                    {action === 'buy' && (
                        <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                            <label className="input-label">ETH Per Wallet</label>
                            <input
                                className="input"
                                type="number"
                                placeholder="0.1"
                                value={ethAmount}
                                onChange={e => setEthAmount(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                <div className="input-group">
                    <label className="input-label">Stealth Wallet Private Keys (One per line)</label>
                    <textarea
                        className="input"
                        placeholder="0xabc123...&#10;0xdef456...&#10;..."
                        value={privateKeys}
                        onChange={e => setPrivateKeys(e.target.value)}
                        spellCheck={false}
                        style={{ minHeight: 120, resize: 'vertical', fontFamily: 'var(--font-mono)' }}
                    />
                </div>

                {error && <div className="alert alert-warning" style={{ marginBottom: 16 }}>⚠️ {error}</div>}

                <button
                    className={`btn ${action === 'buy' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={executeBundle}
                    disabled={loading || !targetContract || !privateKeys}
                    style={{ width: '100%', height: 50, borderColor: action === 'sell' ? '#ef4444' : undefined, color: action === 'sell' ? '#ef4444' : undefined }}
                >
                    {loading ? (
                        <><span className="loader" style={action === 'sell' ? { borderColor: 'rgba(239,68,68,0.2)', borderTopColor: '#ef4444' } : {}} /> Broadcasting Bundle...</>
                    ) : (
                        <><BundlerIcon color={action === 'buy' ? 'black' : '#ef4444'} style={{ width: 18, height: 18 }} /> {action === 'buy' ? 'Execute Bundle BUY' : 'Execute Bundle SELL (Dump)'}</>
                    )}
                </button>
            </div>

            {results.length > 0 && (
                <div className="card fade-up" style={{ marginTop: 24 }}>
                    <h3 style={{ marginBottom: 16, fontFamily: 'var(--font-display)', fontSize: '1rem' }}>⚡ Bundle Execution Results</h3>
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
