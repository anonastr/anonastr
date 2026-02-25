import { useNavigate } from 'react-router-dom'
import { EyeIcon, KeyIcon, ChartIcon, TagIcon, SweeperIcon, ShieldIcon, BundlerIcon, SniperIcon } from '../components/icons'
import './Landing.css'

const features = [
    {
        icon: <EyeIcon className="feat-icon-svg" />,
        title: 'Wallet Exposure Checker',
        desc: 'Analyze how exposed your wallet is. Get a privacy risk score with a full breakdown.',
        path: '/exposure',
        color: 'cyan',
    },
    {
        icon: <KeyIcon className="feat-icon-svg" />,
        title: 'Stealth Wallet Generator',
        desc: 'Generate burner wallets entirely in-browser. No servers. No tracking. Just pure entropy.',
        path: '/stealth',
        color: 'purple',
    },
    {
        icon: <SweeperIcon className="feat-icon-svg" />,
        title: 'Dust Sweeper',
        desc: 'Systematically sweep ASTER gas and dust from multiple burner wallets to a cold wallet in one secure transaction.',
        path: '/sweeper',
        color: 'yellow',
    },
    {
        icon: <ShieldIcon className="feat-icon-svg" />,
        title: 'Approval Revoker',
        desc: 'Scan your wallet for unlimited token approvals given to sketchy smart contracts and revoke them instantly.',
        path: '/revoke',
        color: 'red',
    },
    {
        icon: <BundlerIcon className="feat-icon-svg" />,
        title: 'Multi-Wallet Bundler',
        desc: 'Bundle buy/sell transactions across up to 10 stealth wallets simultaneously to snipe launches and avoid front-running.',
        path: '/bundle',
        color: 'cyan',
    },
    {
        icon: <SniperIcon className="feat-icon-svg" />,
        title: 'Mempool Sniper',
        desc: 'Watch the mempool to snipe token launches the exact millisecond liquidity is added.',
        path: '/sniper',
        color: 'yellow',
    },
    {
        icon: <ChartIcon className="feat-icon-svg" />,
        title: 'Private PnL Card',
        desc: 'See your real trade stats locally and flex with a shareable card — without revealing your wallet.',
        path: '/pnl',
        color: 'green',
    },
    {
        icon: <TagIcon className="feat-icon-svg" />,
        title: 'Anon Degen Tag',
        desc: 'Get a permanent anonymous handle like ghost#4829 built from your wallet hash.',
        path: '/tag',
        color: 'blue',
    },
]

export default function Landing() {
    const navigate = useNavigate()

    return (
        <div className="landing">
            {/* Grid background */}
            <div className="landing-grid" />

            {/* Glowing orbs */}
            <div className="orb orb-1" />
            <div className="orb orb-2" />

            {/* Hero */}
            <section className="hero fade-up">
                <h1 className="hero-title pt-6">
                    STAY ANON. <span className="gradient-text">STAY SAFU.</span>
                </h1>
                <p className="hero-subtitle">
                    The ultimate privacy toolkit for the truly paranoid. Generate stealth wallets, check exposure, and flex PnL completely off the grid.
                </p>
                <div className="hero-cta">
                    <button className="btn btn-primary btn-lg" onClick={() => navigate('/exposure')}>
                        Sweep Your Dust →
                    </button>
                    <button className="btn btn-ghost btn-lg" onClick={() => navigate('/stealth')}>
                        Generate Stealth Wallet
                    </button>
                </div>
                <div className="hero-tags">
                    <span className="badge badge-green">✓ Zero Logs</span>
                    <span className="badge badge-cyan">✓ Pure Entropy</span>
                    <span className="badge badge-purple">✓ Untraceable</span>
                </div>
            </section>

            {/* Features */}
            <section className="features">
                <p className="section-label">Privacy Toolkit</p>
                <div className="features-grid">
                    {features.map((f, i) => (
                        <button
                            key={f.path}
                            className={`feature-card fade-up anim-delay-${i + 1} feat-${f.color}`}
                            onClick={() => navigate(f.path)}
                        >
                            <div className="feat-icon">{f.icon}</div>
                            <h3 className="feat-title">{f.title}</h3>
                            <p className="feat-desc">{f.desc}</p>
                            <span className="feat-arrow">→</span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Stats bar */}
            <section className="stats-bar fade-up anim-delay-4">
                <div className="stat-item">
                    <span className="stat-num">100%</span>
                    <span className="stat-lbl">Client-Side</span>
                </div>
                <div className="stat-divider" />

                <div className="stat-item">
                    <span className="stat-num">8</span>
                    <span className="stat-lbl">Privacy Tools</span>
                </div>
                <div className="stat-divider" />
                <div className="stat-item">
                    <span className="stat-num">Aster</span>
                    <span className="stat-lbl">Compatible</span>
                </div>
            </section>
        </div>
    )
}
