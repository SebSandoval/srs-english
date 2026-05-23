'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from './theme-provider'

const links = [
  {
    href: '/',
    label: 'Dashboard',
    shortLabel: 'Home',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: '/study',
    label: 'Study',
    shortLabel: 'Study',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    href: '/cards',
    label: 'Cards',
    shortLabel: 'Cards',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
  },
  {
    href: '/about',
    label: 'About',
    shortLabel: 'Info',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
]

export function Nav({ onSignOut }: { onSignOut: () => Promise<void> }) {
  const pathname = usePathname()
  const { theme, toggle } = useTheme()

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      {/* ── Top header ── */}
      <header className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur-sm px-4 sm:px-6 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {/* Brand + desktop links */}
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-accent mr-3 tracking-tight">SRS</span>
            <nav className="hidden sm:flex items-center gap-0.5">
              {links.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    isActive(href)
                      ? 'bg-accent/10 text-accent'
                      : 'text-t2 hover:text-t1 hover:bg-elevated'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggle}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-t3 hover:text-t1 hover:bg-elevated transition-colors duration-150"
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
            <form action={onSignOut}>
              <button
                type="submit"
                className="text-xs text-t3 hover:text-t2 transition-colors duration-150 px-2.5 py-1.5 rounded-lg hover:bg-elevated"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* ── Mobile bottom nav ── */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border bg-bg/95 backdrop-blur-md">
        <div className="flex items-center justify-around px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
          {links.map(({ href, shortLabel, icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-xl transition-colors duration-150 ${
                  active ? 'text-accent' : 'text-t3 hover:text-t2'
                }`}
              >
                <span className={`transition-transform duration-150 ${active ? 'scale-110' : ''}`}>
                  {icon}
                </span>
                <span className="text-[10px] font-semibold tracking-wide">{shortLabel}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}
