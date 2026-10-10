'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

interface UserSession {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

/**
 * Header — shared navigation bar.
 * Design: transparent background, hairline bottom border (#292d30), white wordmark with loog.png.
 * Reads session from localStorage (set after login) and re-validates on mount.
 */
export function Header() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Sync session state from localStorage (set by login/signup pages)
  useEffect(() => {
    const stored = localStorage.getItem('evo_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('evo_user');
      }
    }
  }, [pathname]); // re-run on route change to stay in sync

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('evo_user');
    localStorage.removeItem('evo_token');
    setUser(null);
    router.push('/events');
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(0, 0, 0, 0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #292d30',
      }}
    >
      <nav
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '60px',
        }}
        aria-label="Main navigation"
      >
        {/* Wordmark with Brand Logo Image */}
        <Link
          href="/"
          style={{
            fontSize: '15px',
            fontWeight: 600,
            color: '#ffffff',
            textDecoration: 'none',
            letterSpacing: '-0.3px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
          aria-label="Project Evo home"
        >
          <img
            src="/loog.png"
            alt="Project Evo"
            style={{
              height: '24px',
              width: 'auto',
              maxHeight: '24px',
              objectFit: 'contain',
              display: 'block',
            }}
          />
          <span>Project Evo</span>
        </Link>

        {/* Desktop nav links */}
        <div
          className="hidden-mobile"
          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <NavLink href="/" active={pathname === '/'}>
            Overview
          </NavLink>
          <NavLink href="/events" active={isActive('/events')}>
            Events
          </NavLink>
          {user && (
            <NavLink href="/feed" active={isActive('/feed')}>
              My Feed
            </NavLink>
          )}
          {user?.role === 'ADMIN' && (
            <NavLink href="/admin" active={isActive('/admin')}>
              Admin
            </NavLink>
          )}
        </div>

        {/* Auth actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {user ? (
            <>
              <span
                style={{
                  fontSize: '13px',
                  color: '#a1a4a5',
                  maxWidth: '160px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                className="hidden-mobile"
              >
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="btn-ghost"
                style={{ padding: '6px 14px', fontSize: '13px', minHeight: '34px', borderRadius: '9999px' }}
                aria-label="Log out"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                style={{
                  color: '#f0f0f0',
                  textDecoration: 'none',
                  fontSize: '13px',
                  padding: '6px 12px',
                  transition: 'color 150ms ease-out',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = '#f0f0f0';
                }}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="btn-primary"
                style={{ padding: '6px 16px', fontSize: '13px', minHeight: '34px' }}
              >
                Get started
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="show-mobile"
            style={{
              background: 'transparent',
              border: '1px solid #292d30',
              borderRadius: '6px',
              color: '#f0f0f0',
              width: '36px',
              height: '36px',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div
          style={{
            borderTop: '1px solid #292d30',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <MobileNavLink href="/events" onClick={() => setMenuOpen(false)}>
            Events
          </MobileNavLink>
          {user && (
            <MobileNavLink href="/feed" onClick={() => setMenuOpen(false)}>
              My Feed
            </MobileNavLink>
          )}
          {user?.role === 'ADMIN' && (
            <MobileNavLink href="/admin" onClick={() => setMenuOpen(false)}>
              Admin
            </MobileNavLink>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 641px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        fontSize: '14px',
        fontWeight: 400,
        color: active ? '#ffffff' : '#f0f0f0',
        textDecoration: 'none',
        padding: '6px 12px',
        borderRadius: '6px',
        background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
        transition: 'color 150ms ease-out, background 150ms ease-out',
      }}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLAnchorElement).style.color = '#ffffff';
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLAnchorElement).style.color = '#f0f0f0';
      }}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: 'block',
        padding: '12px 16px',
        fontSize: '15px',
        color: '#f0f0f0',
        textDecoration: 'none',
        borderRadius: '8px',
        transition: 'background 150ms ease-out',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.06)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
      }}
    >
      {children}
    </Link>
  );
}
