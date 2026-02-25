import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import './Navbar.css'

/* ─────────────────────────────────────────────────────────────
   3D Padlock Logo
   Techniques:
   • Layered shackle paths (shadow → main gold → specular)
     simulates a cylindrical metal tube
   • Body with gradient fill + top highlight band + bottom shadow
   • Drop shadow rect offset behind body for depth
   • Metallic gradient on body border
   • Icons inside unchanged
──────────────────────────────────────────────────────────────*/
function PadlockIcon({ size = 18 }) {
    return (
        <img
            src="/logo.png"
            alt="Anonastr Logo"
            style={{ width: size, height: size, objectFit: 'contain' }}
            className="logo-img"
        />
    )
}
import { EyeIcon, KeyIcon, ChartIcon, TagIcon, SweeperIcon, ShieldIcon, BundlerIcon, SniperIcon } from './icons'

function GithubIcon({ size = 18 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
        </svg>
    )
}

function TwitterIcon({ size = 18 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    )
}

const navItems = [
    { path: '/exposure', label: 'Exposure', Icon: EyeIcon },
    { path: '/stealth', label: 'Stealth Wallet', Icon: KeyIcon },
    { path: '/sweeper', label: 'Dust Sweeper', Icon: SweeperIcon },
    { path: '/revoke', label: 'Approval Revoker', Icon: ShieldIcon },
    { path: '/bundle', label: 'Wallet Bundler', Icon: BundlerIcon },
    { path: '/sniper', label: 'Mempool Sniper', Icon: SniperIcon },
    { path: '/pnl', label: 'PnL Card', Icon: ChartIcon },
    { path: '/tag', label: 'Anon Tag', Icon: TagIcon },
]

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const location = useLocation()

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => setMenuOpen(false), [location])

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-inner">
                <NavLink to="/" className="navbar-logo">
                    <PadlockIcon size={52} />
                    <span className="logo-text">Anonastr</span>
                </NavLink>

                <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                    {navItems.map((item) => {
                        const IconComponent = item.Icon
                        return (
                            <NavLink key={item.path} to={item.path}
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <IconComponent />
                                {item.label}
                            </NavLink>
                        )
                    })}
                </div>

                <div className="navbar-right" style={{ display: 'flex', gap: '8px' }}>
                    <a href="https://github.com/anonastr/anonastr" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', transition: 'color 0.2s', padding: '8px' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                        <GithubIcon size={20} />
                    </a>
                    <a href="https://x.com/anonastr" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', transition: 'color 0.2s', padding: '8px' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                        <TwitterIcon size={20} />
                    </a>
                    <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="menu">
                        <span /><span /><span />
                    </button>
                </div>
            </div>
        </nav>
    )
}
