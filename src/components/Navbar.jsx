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
import { EyeIcon, KeyIcon, ChartIcon, TagIcon } from './icons'

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

    useEffect(() => setMenuOpen(false), [location])

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-inner">
                <NavLink to="/" className="navbar-logo">
                    <PadlockIcon size={52} />
                    <span className="logo-text">Anonastr</span>
                </NavLink>

                <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                    {navItems.map(({ path, label, Icon }) => (
                        <NavLink key={path} to={path}
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <Icon />
                            {label}
                        </NavLink>
                    ))}
                </div>

                <div className="navbar-right">
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
