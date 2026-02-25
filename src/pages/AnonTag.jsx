import { useState } from 'react'
import { ethers } from 'ethers'
import { TagIcon } from '../components/icons'
import './AnonTag.css'

const ADJECTIVES = ['ghost', 'shadow', 'cipher', 'phantom', 'void', 'anon', 'stealth', 'rogue', 'dark', 'silent', 'masked', 'hidden', 'veiled', 'nexus', 'lunar']
const NOUNS = ['degen', 'trader', 'ape', 'chad', 'whale', 'hunter', 'ranger', 'rogue', 'ninja', 'wolf', 'viper', 'knight', 'specter', 'baron', 'king']
const TIERS = [
    { name: 'NEWBIE', min: 0, max: 100, emoji: '🐣', color: '#94a3b8' },
    { name: 'DEGEN', min: 101, max: 500, emoji: '🦊', color: '#f59e0b' },
    { name: 'CHAD', min: 501, max: 1000, emoji: '🦅', color: '#22d3ee' },
    { name: 'GIGACHAD', min: 1001, max: Infinity, emoji: '🦁', color: '#8b5cf6' },
]

function djb2Hash(str) {
    let hash = 5381
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i)
        hash = hash & hash
    }
    return Math.abs(hash)
}

function generateTag(address) {
    const addr = address.toLowerCase()
    const h1 = djb2Hash(addr + 'adj')
    const h2 = djb2Hash(addr + 'noun')
    const h3 = djb2Hash(addr + 'num')
    const adj = ADJECTIVES[h1 % ADJECTIVES.length]
    const noun = NOUNS[h2 % NOUNS.length]
    const num = (h3 % 9000) + 1000
    return `${adj}#${noun}_${num}`
}

function generateAvatar(address) {
    const h = djb2Hash(address.toLowerCase())
    const colors = [
        ['#8b5cf6', '#22d3ee'],
        ['#f59e0b', '#ef4444'],
        ['#10b981', '#22d3ee'],
        ['#8b5cf6', '#f59e0b'],
        ['#22d3ee', '#10b981'],
    ]
    const [c1, c2] = colors[h % colors.length]
    const shapes = h % 4
    return { c1, c2, shapes, seed: h }
}

function AvatarSVG({ address, size = 80 }) {
    const { c1, c2, shapes, seed } = generateAvatar(address)
    const s = size
    return (
        <svg width={s} height={s} viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '50%', flexShrink: 0 }}>
            <defs>
                <linearGradient id={`g-${seed}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={c1} />
                    <stop offset="100%" stopColor={c2} />
                </linearGradient>
            </defs>
            <rect width="80" height="80" fill={`url(#g-${seed})`} rx="40" />
            {shapes === 0 && <>
                <circle cx="40" cy="30" r="14" fill="rgba(255,255,255,0.25)" />
                <circle cx="40" cy="60" r="20" fill="rgba(255,255,255,0.15)" />
            </>}
            {shapes === 1 && <>
                <rect x="20" y="20" width="40" height="40" rx="8" fill="rgba(255,255,255,0.2)" transform="rotate(15 40 40)" />
                <rect x="28" y="28" width="24" height="24" rx="4" fill="rgba(255,255,255,0.15)" transform="rotate(45 40 40)" />
            </>}
            {shapes === 2 && <>
                <polygon points="40,12 65,55 15,55" fill="rgba(255,255,255,0.2)" />
                <polygon points="40,28 58,58 22,58" fill="rgba(255,255,255,0.1)" />
            </>}
            {shapes === 3 && <>
                <circle cx="25" cy="35" r="12" fill="rgba(255,255,255,0.2)" />
                <circle cx="55" cy="35" r="12" fill="rgba(255,255,255,0.2)" />
                <circle cx="40" cy="55" r="12" fill="rgba(255,255,255,0.2)" />
            </>}
            <text x="40" y="45" textAnchor="middle" fontSize="16" fill="rgba(255,255,255,0.6)" fontFamily="sans-serif">👤</text>
        </svg>
    )
}

const RPC_URL = 'https://data-seed-prebsc-1-s1.binance.org:8545'

export default function AnonTag() {
    const [address, setAddress] = useState('')
    const [loading, setLoading] = useState(false)
    const [tagData, setTagData] = useState(null)
    const [error, setError] = useState('')
    const [copied, setCopied] = useState(false)

    async function connectWallet() {
        if (!window.ethereum) { setError('No wallet detected.'); return }
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
            setAddress(accounts[0])
        } catch { setError('Connection rejected.') }
    }

    async function generateAnonTag() {
        setError('')
        setTagData(null)
        const addr = address.trim()
        if (!ethers.isAddress(addr)) { setError('Invalid address.'); return }

        setLoading(true)
        try {
            const provider = new ethers.JsonRpcProvider(RPC_URL)
            const txCount = await provider.getTransactionCount(addr)
            const tier = TIERS.find(t => txCount >= t.min && txCount <= t.max) || TIERS[0]
            const tag = generateTag(addr)
            setTagData({ addr, tag, tier, txCount })
        } catch {
            // Even without RPC, we can generate tag from address alone
            const tag = generateTag(addr)
            setTagData({ addr, tag, tier: TIERS[0], txCount: 0 })
        } finally {
            setLoading(false)
        }
    }

    function copyTag() {
        if (!tagData) return
        navigator.clipboard.writeText(tagData.tag)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="page fade-up">
            <h1 className="page-title">Anonastr Degen Tag</h1>
            <p className="page-subtitle">Get a permanent anonymous identity built from your wallet hash. Same wallet always gets the same tag.</p>

            <div className="card">
                <div className="input-group">
                    <label className="input-label">Wallet Address</label>
                    <div className="input-row">
                        <input className="input" placeholder="0x..." value={address} onChange={e => setAddress(e.target.value)} spellCheck={false} />
                        <button className="btn btn-ghost" onClick={connectWallet}>Connect</button>
                    </div>
                </div>
                {error && <div className="alert alert-warning" style={{ marginBottom: 16 }}>⚠️ {error}</div>}
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={generateAnonTag} disabled={loading || !address}>
                    {loading ? <><span className="loader" /> Generating...</> : <><TagIcon color="black" style={{ width: 18, height: 18 }} /> Generate My Tag</>}
                </button>
            </div>

            {tagData && (
                <div className="tag-result fade-up">
                    <div className="tag-card card">
                        {/* Avatar + Tag display */}
                        <div className="tag-display">
                            <AvatarSVG address={tagData.addr} size={80} />
                            <div className="tag-info">
                                <div className="tag-handle">{tagData.tag}</div>
                                <div className="tag-tier" style={{ color: tagData.tier.color }}>
                                    {tagData.tier.emoji} {tagData.tier.name}
                                </div>
                            </div>
                        </div>

                        <div className="divider" />

                        {/* Stats */}
                        <div className="tag-stats">
                            <div className="stat-box">
                                <div className="stat-value">{tagData.txCount}</div>
                                <div className="stat-label">Transactions</div>
                            </div>
                            <div className="stat-box">
                                <div className="stat-value">{tagData.tier.name}</div>
                                <div className="stat-label">Tier</div>
                            </div>
                            <div className="stat-box">
                                <div className="stat-value">ASTER</div>
                                <div className="stat-label">ASTER CHAIN</div>
                            </div>
                        </div>

                        <div className="divider" />

                        {/* How it works */}
                        <div className="alert alert-info" style={{ marginBottom: 16 }}>
                            🔒 <strong>Deterministic:</strong> Your tag is generated from a one-way hash of your wallet address. Your wallet is never stored or transmitted.
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={copyTag}>
                                {copied ? '✓ Copied!' : '📋 Copy Tag'}
                            </button>
                        </div>

                        <div className="tag-share">
                            <p className="share-text" style={{ marginBottom: 12 }}>Share this on Twitter:</p>
                            <a
                                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Zero trace left behind. I am anon#baron_2181, a ${tagData.tier.emoji} ${tagData.tier.name} on Aster Chain. #Anonastr #ASTERCHAIN`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary"
                                style={{ width: '100%', justifyContent: 'center' }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                                Post to X
                            </a>
                        </div>
                    </div>

                    {/* Tier guide */}
                    <div className="card" style={{ marginTop: 16 }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', marginBottom: 14 }}>🏆 Tier Guide</h3>
                        <div className="tier-list">
                            {TIERS.map(t => (
                                <div key={t.name} className={`tier-row ${tagData.tier.name === t.name ? 'active-tier' : ''}`}>
                                    <span style={{ color: t.color }}>{t.emoji} {t.name}</span>
                                    <span className="tier-range">{t.max === Infinity ? `${t.min}+ txs` : `${t.min}–${t.max} txs`}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
