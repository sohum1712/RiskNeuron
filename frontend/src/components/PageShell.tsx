/**
 * PageShell — shared layout wrapper for all authenticated inner pages.
 * Claims, Policy, Profile all use this.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { AppBackground } from './AppBackground';

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

      {/* Sticky nav */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        scrolled
          ? 'py-3 bg-[#0C1117]/85 backdrop-blur-2xl border-b border-white/[0.08] px-6 lg:px-12'
          : 'py-5 bg-transparent px-8 lg:px-16'
      }`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Left: back + logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(resolvedBack)}
              className="p-2 hover:bg-white/8 rounded-xl border border-white/[0.12] transition-all group"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4 text-white/60 group-hover:text-white group-hover:-translate-x-0.5 transition-all" />
            </button>

            <button onClick={() => navigate('/')} className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 bg-gradient-to-tr from-[#F97316] to-[#FB923C] rounded-lg flex items-center justify-center shadow-lg shadow-[#F97316]/30 group-hover:scale-110 transition-transform">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-base tracking-tighter text-white hidden sm:block" style={{ fontFamily: font.display }}>
                SWIFTCOVER
              </span>
            </button>
          </div>

          {/* Center: page label */}
          {pageLabel && (
            <div className="hidden md:block text-center">
              {overline && (
                <p className="text-[9px] font-black text-[#F97316] uppercase tracking-[0.2em] mb-0.5" style={{ fontFamily: font.label }}>
                  {overline}
                </p>
              )}
              <p className="text-sm font-black text-white/70 uppercase tracking-widest" style={{ fontFamily: font.label }}>
                {pageLabel}
              </p>
            </div>
          )}

          {/* Right: nav pills */}
          <div className="flex items-center gap-2">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  window.location.pathname === item.path
                    ? 'bg-[#F97316]/15 border-[#F97316]/40 text-[#F97316]'
                    : 'bg-white/[0.05] border-white/[0.12] text-white/55 hover:text-white hover:bg-white/[0.08]'
                }`}
                style={{ fontFamily: font.label }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="pt-24 pb-20 px-6 lg:px-12 max-w-6xl mx-auto">
        {children}
      </main>
    </div>
  );
};
