/**
 * PageShell — shared layout wrapper for Claims, Policy, Profile pages.
 * Floating pill navbar (landing-page style) that gains blur on scroll.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { AppBackground } from './AppBackground';
import { BrandLogo } from './BrandLogo';

const font = {
  display: "'Barlow', sans-serif",
  label: "'Space Grotesk', sans-serif",
};

interface NavItem {
  label: string;
  path: string;
}

interface PageShellProps {
  workerId?: string | number;
  pageLabel?: string;
  overline?: string;
  backPath?: string;
  navItems?: NavItem[];
  children: React.ReactNode;
}

export const PageShell: React.FC<PageShellProps> = ({
  workerId,
  pageLabel,
  overline,
  backPath,
  navItems = [],
  children,
}) => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const resolvedBack = backPath ?? (workerId ? `/dashboard/${workerId}` : '/');

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <AppBackground />

      {/* Floating pill navbar */}
      <nav style={{
        position: 'fixed', top: 20, left: 0, right: 0, zIndex: 100,
        display: 'flex', justifyContent: 'center', pointerEvents: 'none',
      }}>
        <div style={{
          backdropFilter: scrolled ? 'blur(40px)' : 'none',
          background: scrolled ? 'rgba(12,17,23,0.75)' : 'transparent',
          border: scrolled ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent',
          borderRadius: 40,
          padding: '6px 8px',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'auto',
          gap: 8,
          transition: 'all 0.3s ease-in-out',
          boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.3)' : 'none',
        }}>

          {/* Back + Logo */}
          <div className="flex items-center gap-2 px-1">
            <button
              onClick={() => navigate(resolvedBack)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.16)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
              aria-label="Go back"
            >
              <ArrowLeft style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.7)' }} />
            </button>

            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px' }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: 'linear-gradient(135deg, #5690FF, #7AABFF)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(86,144,255,0.35)',
              }}>
                <Shield style={{ width: 16, height: 16, color: '#fff' }} />
              </div>
              <span style={{ fontFamily: font.display, fontWeight: 800, fontSize: 15, color: '#fff', letterSpacing: '-0.01em' }}
                className="hidden sm:block">
                <BrandLogo size={16} />
              </span>
            </button>
          </div>

          {/* Center: page label */}
          {pageLabel && (
            <div className="hidden md:block px-3 text-center">
              {overline && (
                <p style={{ fontFamily: font.label, fontSize: 9, fontWeight: 900, color: '#5690FF', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 1 }}>
                  {overline}
                </p>
              )}
              <p style={{ fontFamily: font.label, fontSize: 11, fontWeight: 900, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                {pageLabel}
              </p>
            </div>
          )}

          {/* Right: nav pills */}
          <div className="flex items-center gap-1 pr-1">
            {navItems.map((item) => {
              const isActive = window.location.pathname === item.path;
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  style={{
                    fontFamily: font.label, fontSize: 11, fontWeight: 700,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    color: isActive ? '#5690FF' : 'rgba(255,255,255,0.60)',
                    background: isActive ? 'rgba(86,144,255,0.12)' : 'rgba(255,255,255,0.06)',
                    border: isActive ? '1px solid rgba(86,144,255,0.35)' : '1px solid transparent',
                    borderRadius: 20, padding: '7px 14px', cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; }}}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.60)'; }}}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="pt-28 pb-20 px-6 lg:px-12 max-w-6xl mx-auto">
        {children}
      </main>
    </div>
  );
};
