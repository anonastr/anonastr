export const EyeIcon = ({ className = "nav-icon", color = "#E8C49A", ...props }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className} {...props}>
        <ellipse cx="12" cy="12" rx="10" ry="6" stroke={color} strokeWidth="2" />
        <circle cx="12" cy="12" r="3" fill={color} />
    </svg>
)

export const KeyIcon = ({ className = "nav-icon", color = "#E8C49A", ...props }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className} {...props}>
        <circle cx="9" cy="9" r="5" stroke={color} strokeWidth="2" />
        <line x1="13" y1="13" x2="22" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <line x1="19" y1="19" x2="19" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <line x1="22" y1="22" x2="19" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
)

export const ChartIcon = ({ className = "nav-icon", color = "#E8C49A", ...props }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className} {...props}>
        <rect x="3" y="14" width="4" height="7" rx="1" fill={color} opacity="0.6" />
        <rect x="10" y="9" width="4" height="12" rx="1" fill={color} opacity="0.8" />
        <rect x="17" y="4" width="4" height="17" rx="1" fill={color} />
    </svg>
)

export const TagIcon = ({ className = "nav-icon", color = "#E8C49A", ...props }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className} {...props}>
        <path d="M3,3 L13,3 L21,12 L13,21 L3,21 Z"
            stroke={color} strokeWidth="2" fill="none" strokeLinejoin="round" />
        <circle cx="8" cy="8" r="2" fill={color} />
    </svg>
)
