import { useState } from 'react'
import { ethers } from 'ethers'
import { ShieldIcon } from '../components/icons'
import './ApprovalRevoker.css'

const RPC_URL = 'https://data-seed-prebsc-1-s1.binance.org:8545'

// Minimal ERC20 ABI for allowance/approve
const ERC20_ABI = [
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)"
]

// Common token addresses on BSC Testnet (for demo)
const KNOWN_TOKENS = {
    '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd': 'USDT',
    '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee': 'BUSD',
}

export default function ApprovalRevoker() {
    const [privateKey, setPrivateKey] = useState('')
    const [loading, setLoading] = useState(false)
    const [approvals, setApprovals] = useState([])
    const [error, setError] = useState('')
    const [scanned, setScanned] = useState(false)
    const [revokingId, setRevokingId] = useState(null)

    async function scanApprovals() {
        setError('')
        setApprovals([])
        setScanned(false)

        let wallet
        try {
            const provider = new ethers.JsonRpcProvider(RPC_URL)
            wallet = new ethers.Wallet(privateKey.trim(), provider)
        } catch {
            setError('Invalid private key.')
            return
        }

        setLoading(true)
        try {
            // In a real production app, we would query an Indexer API (like moralis, covalent, or an explorer)
            // to find all Approval event logs for this owner address up to the current block.
            // Since we are limited to an RPC here with no native log indexer easily available without 
            // timing out the response, we will simulate the finding by checking hardcoded common tokens.
            // When migrating to Aster L1, swap this out for the Aster Block Explorer API Endpoint.

            const foundApprovals = []

            for (const [tokenAddr, symbol] of Object.entries(KNOWN_TOKENS)) {
                const contract = new ethers.Contract(tokenAddr, ERC20_ABI, wallet.provider)

                // We're checking a hardcoded common spender (like PancakeSwap / Uniswap router)
                // In production with an Explorer API, it would give us every unique spender directly.
                const commonSpender = '0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3' // PancakeSwap Testnet Router

                try {
                    const allowance = await contract.allowance(wallet.address, commonSpender)

                    if (allowance > 0n) {
                        foundApprovals.push({
                            id: `${tokenAddr}-${commonSpender}`,
                            tokenAddress: tokenAddr,
                            tokenSymbol: symbol,
                            spender: commonSpender,
                            amount: allowance > ethers.parseUnits('1000000', 18) ? 'Infinite' : ethers.formatUnits(allowance, 18),
                            rawAmount: allowance,
                            contract: new ethers.Contract(tokenAddr, ERC20_ABI, wallet)
                        })
                    }
                } catch {
                    // Ignore tokens that error out (might not exist on this specific network)
                }
            }

            // MOCK DATA for Demo purposes since testnet RPC won't easily yield actual historical logs
            if (foundApprovals.length === 0) {
                foundApprovals.push({
                    id: 'mock-1',
                    tokenAddress: '0x123...abc',
                    tokenSymbol: 'SHIB',
                    spender: '0xUniswapRouter...',
                    amount: 'Infinite',
                    rawAmount: 0n,
                    isMock: true
                })
                foundApprovals.push({
                    id: 'mock-2',
                    tokenAddress: '0x456...def',
                    tokenSymbol: 'PEPE',
                    spender: '0xSketchyDapp...',
                    amount: 'Infinite',
                    rawAmount: 0n,
                    isMock: true
                })
            }

            setApprovals(foundApprovals)
            setScanned(true)
        } catch {
            setError('Failed to scan approvals. Node might be rate-limiting.')
        } finally {
            setLoading(false)
        }
    }

    async function revokeApproval(approval) {
        if (approval.isMock) {
            // Simulate revoking for the mock data
            setRevokingId(approval.id)
            setTimeout(() => {
                setApprovals(prev => prev.filter(a => a.id !== approval.id))
                setRevokingId(null)
            }, 1500)
            return
        }

        setRevokingId(approval.id)
        try {
            // Explicity approve(spender, 0)
            const tx = await approval.contract.approve(approval.spender, 0n)
            await tx.wait()

            // Remove from list
            setApprovals(prev => prev.filter(a => a.id !== approval.id))
        } catch (e) {
            alert(`Failed to revoke: ${e.message}`)
        } finally {
            setRevokingId(null)
        }
    }

    return (
        <div className="page fade-up">
            <h1 className="page-title">Token Approval Revoker</h1>
            <p className="page-subtitle">Scan your wallet for unlimited token approvals given to sketchy smart contracts and revoke them instantly.</p>

            <div className="alert alert-warning" style={{ marginBottom: 24, alignItems: 'flex-start' }}>
                <ShieldIcon style={{ width: 22, height: 22, flexShrink: 0, marginTop: 2, stroke: '#fcd34d' }} />
                <div>
                    <strong>Stay Safu:</strong> If a dapp gets hacked, your wallet is safe as long as they don't have "Infinite Approval" to spend your tokens. Scan to find your risks.
                </div>
            </div>

            <div className="card">
                <div className="input-group">
                    <label className="input-label">Wallet Private Key</label>
                    <input
                        type="password"
                        className="input"
                        placeholder="Paste private key to scan..."
                        value={privateKey}
                        onChange={e => setPrivateKey(e.target.value)}
                        spellCheck={false}
                    />
                </div>

                {error && <div className="alert alert-warning" style={{ marginBottom: 16 }}>⚠️ {error}</div>}

                <button
                    className="btn btn-primary"
                    onClick={scanApprovals}
                    disabled={loading || !privateKey}
                    style={{ width: '100%', height: 50 }}
                >
                    {loading ? <><span className="loader" /> Scanning Blockchain...</> : <><ShieldIcon color="black" style={{ width: 18, height: 18 }} /> Scan Approvals</>}
                </button>
            </div>

            {scanned && (
                <div className="card fade-up" style={{ marginTop: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>
                            Active Allowances ({approvals.length})
                        </h3>
                        {approvals.length > 0 && (
                            <button className="btn btn-ghost" style={{ color: '#ef4444' }}>
                                Revoke All (x{approvals.length})
                            </button>
                        )}
                    </div>

                    {approvals.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                            <ShieldIcon color="#10b981" style={{ width: 48, height: 48, marginBottom: 16, opacity: 0.8 }} />
                            <p>Your wallet is perfectly clean.</p>
                            <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>No active token approvals found.</p>
                        </div>
                    ) : (
                        <div className="approvals-list" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {approvals.map(app => (
                                <div key={app.id} className="approval-item card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{app.tokenSymbol}</span>
                                            <span className="badge badge-cyan" style={{ fontSize: '0.75rem' }}>{app.amount} Allowance</span>
                                            {app.isMock && <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>MOCK DATA</span>}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                                            Spender: {app.spender}
                                        </div>
                                    </div>

                                    <button
                                        className="btn btn-secondary"
                                        style={{ border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', minWidth: 100 }}
                                        onClick={() => revokeApproval(app)}
                                        disabled={revokingId === app.id}
                                    >
                                        {revokingId === app.id ? <span className="loader" style={{ width: 14, height: 14, borderColor: 'rgba(239, 68, 68, 0.2)', borderTopColor: '#ef4444' }} /> : 'Revoke'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
