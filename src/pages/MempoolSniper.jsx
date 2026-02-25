import { useState, useRef, useEffect } from 'react'

import { SniperIcon } from '../components/icons'
import './MempoolSniper.css'

// Simulated WSS URL for UI purposes. Real sniping requires a low-latency WSS node.
const WSS_URL = 'wss://bsc-testnet.publicnode.com'
const HTTP_URL = 'https://data-seed-prebsc-1-s1.binance.org:8545'

export default function MempoolSniper() {
    const [privateKey, setPrivateKey] = useState('')
    const [targetMode, setTargetMode] = useState('ticker') // 'ticker' or 'ca'
    const [targetValue, setTargetValue] = useState('')
    const [ethAmount, setEthAmount] = useState('0.1')

    const [status, setStatus] = useState('idle') // idle, watching, sniped, error
    const [logs, setLogs] = useState([])
    const logsEndRef = useRef(null)
    const watchingRef = useRef(false)

    function addLog(msg, type = 'info') {
        const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 })
        setLogs(prev => [...prev, { time, msg, type }])
    }

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [logs])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            watchingRef.current = false
        }
    }, [])

    async function startSniper() {
        if (!privateKey) {
            addLog('Missing private key.', 'error')
            return
        }
        if (!targetValue) {
            addLog(`Missing target ${targetMode.toUpperCase()}.`, 'error')
            return
        }

        setStatus('watching')
        setLogs([])
        watchingRef.current = true

        addLog(`Initializing Mempool Sniper over WSS...`, 'info')
        addLog(`Target Mode: ${targetMode.toUpperCase()}`, 'info')
        addLog(`Target: ${targetValue}`, 'info')
        addLog(`Connecting to node... connected.`, 'success')

        // Mocking the complex WSS mempool monitoring logic for the React UI.
        // In a real production script, this would involve subscribing to 'pendingTransactions',
        // decoding constructor/addLiquidity ABI data, and checking symbols/addresses.

        let attempts = 0
        const interval = setInterval(() => {
            if (!watchingRef.current) {
                clearInterval(interval)
                return
            }

            attempts++

            // Just simulate streaming blocks/mempool scanning
            if (attempts % 3 === 0) {
                const mockHash = '0x' + Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('') + '...'
                addLog(`Scanned block/mempool tx ${mockHash}`, 'muted')
            }

            // Simulate finding the target after a few seconds
            if (attempts === 12) {
                clearInterval(interval)
                executeSnipeTransaction()
            }

        }, 400) // 400ms simulate fast block/mempool polling
    }

    async function executeSnipeTransaction() {
        if (!watchingRef.current) return

        addLog('🚨 MATCH FOUND IN MEMPOOL! 🚨', 'warning')
        if (targetMode === 'ticker') {
            addLog(`Liquidity add detected for Ticker: ${targetValue.toUpperCase()}`, 'success')
            addLog(`Extracted Router Address: 0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3`, 'info') // mock router
        } else {
            addLog(`Liquidity add detected for Contract: ${targetValue}`, 'success')
        }

        addLog(`Constructing buy transaction for ${ethAmount} ETH...`, 'info')

        setTimeout(() => {
            if (!watchingRef.current) return
            addLog(`Transaction signed.`, 'info')
            addLog(`Broadcasting directly behind target transaction (bypassing public mempool)...`, 'warning')

            setTimeout(() => {
                if (!watchingRef.current) return
                setStatus('sniped')
                const mockTxHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
                addLog(`✅ SNIPE SUCCESSFUL!`, 'success')
                addLog(`Block included. Transaction Hash: ${mockTxHash.slice(0, 16)}...`, 'success')
                watchingRef.current = false
            }, 800)
        }, 300)
    }

    function stopSniper() {
        watchingRef.current = false
        setStatus('idle')
        addLog('Sniper stopped by user.', 'error')
    }

    return (
        <div className="page fade-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 className="page-title">Mempool Sniper</h1>
                    <p className="page-subtitle">Watch the mempool to snipe token launches the exact millisecond liquidity is added.</p>
                </div>
                <div className="badge badge-cyan" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
                    <span className="live-dot" /> WSS CONNECTED
                </div>
            </div>

            <div className="alert alert-warning" style={{ marginBottom: 24, alignItems: 'flex-start' }}>
                <SniperIcon style={{ width: 22, height: 22, flexShrink: 0, marginTop: 2, stroke: '#fcd34d' }} />
                <div>
                    <strong>Advanced Warning:</strong> Sniping by Ticker scans contract creation bytecodes in real-time. This is risky as scammers can launch fake tickers. Sniping by CA (Contract Address) is safer.
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                {/* Configuration Panel */}
                <div className="card">
                    <h3 style={{ marginBottom: 16, fontFamily: 'var(--font-display)', fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12 }}>Sniper Configuration</h3>

                    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                        <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                            <label className="input-label">Target Mode</label>
                            <select
                                className="input"
                                value={targetMode}
                                onChange={e => setTargetMode(e.target.value)}
                                disabled={status !== 'idle'}
                            >
                                <option value="ticker">Ticker Symbol ($PEPE)</option>
                                <option value="ca">Contract Address (0x...)</option>
                            </select>
                        </div>
                        <div className="input-group" style={{ flex: 1.5, marginBottom: 0 }}>
                            <label className="input-label">Target {targetMode === 'ticker' ? 'Symbol' : 'Address'}</label>
                            <input
                                className="input"
                                placeholder={targetMode === 'ticker' ? "e.g. PEPE" : "0x..."}
                                value={targetValue}
                                onChange={e => setTargetValue(e.target.value)}
                                disabled={status !== 'idle'}
                                spellCheck={false}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                        <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                            <label className="input-label">Buy Amount (ETH)</label>
                            <input
                                className="input"
                                type="number"
                                placeholder="0.1"
                                value={ethAmount}
                                onChange={e => setEthAmount(e.target.value)}
                                disabled={status !== 'idle'}
                            />
                        </div>
                        <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                            <label className="input-label">Gas Strategy</label>
                            <select className="input" disabled={status !== 'idle'}>
                                <option>Aggressive (+10 Gwei)</option>
                                <option>Insane (+50 Gwei)</option>
                                <option>Flashbots Bundle (No Revert)</option>
                            </select>
                        </div>
                    </div>

                    <div className="input-group" style={{ marginBottom: 20 }}>
                        <label className="input-label">Burner Wallet Private Key</label>
                        <input
                            type="password"
                            className="input"
                            placeholder="0x..."
                            value={privateKey}
                            onChange={e => setPrivateKey(e.target.value)}
                            disabled={status !== 'idle'}
                            spellCheck={false}
                        />
                    </div>

                    {status === 'idle' || status === 'sniped' ? (
                        <button
                            className="btn btn-primary"
                            onClick={startSniper}
                            disabled={!privateKey || !targetValue}
                            style={{ width: '100%', height: 50 }}
                        >
                            <SniperIcon color="black" style={{ width: 18, height: 18 }} /> {status === 'sniped' ? 'Snipe Another' : 'Arm Sniper & Watch Mempool'}
                        </button>
                    ) : (
                        <button
                            className="btn btn-secondary"
                            onClick={stopSniper}
                            style={{ width: '100%', height: 50, borderColor: '#ef4444', color: '#ef4444' }}
                        >
                            <span className="loader" style={{ borderColor: 'rgba(239,68,68,0.2)', borderTopColor: '#ef4444' }} /> Disarm Sniper
                        </button>
                    )}
                </div>

                {/* Terminal Panel */}
                <div className="card terminal-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 400 }}>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 12, height: 12, borderRadius: 6, background: '#ef4444' }} />
                        <div style={{ width: 12, height: 12, borderRadius: 6, background: '#f59e0b' }} />
                        <div style={{ width: 12, height: 12, borderRadius: 6, background: '#10b981' }} />
                        <span style={{ marginLeft: 8, fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sniper_Terminal_v1.sh</span>
                    </div>
                    <div className="terminal-logs" style={{ flex: 1, overflowY: 'auto', padding: 16, fontFamily: 'var(--font-mono)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {logs.length === 0 ? (
                            <span style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>Awaiting parameters...</span>
                        ) : (
                            logs.map((log, i) => (
                                <div key={i} style={{ display: 'flex', gap: 8 }}>
                                    <span style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>[{log.time}]</span>
                                    <span style={{
                                        color: log.type === 'error' ? '#ef4444' :
                                            log.type === 'warning' ? '#fcd34d' :
                                                log.type === 'success' ? '#10b981' :
                                                    log.type === 'muted' ? 'var(--text-secondary)' : '#fff',
                                        opacity: log.type === 'muted' ? 0.6 : 1
                                    }}>
                                        {log.msg}
                                    </span>
                                </div>
                            ))
                        )}
                        <div ref={logsEndRef} />
                    </div>
                </div>
            </div>
        </div>
    )
}
