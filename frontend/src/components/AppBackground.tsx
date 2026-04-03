/**
 * AppBackground — single source of truth for the Bg.jpeg background
 * used across all post-landing pages. Ensures identical visual treatment.
 */
import React from 'react';
import bgUrl from '../assets/images/Bg.jpeg';

export const AppBackground: React.FC = () => (
  <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
    {/* Base image */}
    <img
      src={bgUrl}
      alt=""
      className="w-full h-full object-cover scale-105"
      style={{ filter: 'brightness(0.28) contrast(1.15) saturate(0.75)' }}
    />
    {/* Dark base so text is always readable */}
    <div className="absolute inset-0 bg-[#0C1117]/55" />
    {/* Vignette — darker edges, lighter center */}
    <div className="absolute inset-0 bg-gradient-to-b from-[#0C1117]/80 via-transparent to-[#0C1117]/90" />
    <div className="absolute inset-0 bg-gradient-to-r from-[#0C1117]/60 via-transparent to-[#0C1117]/40" />
    {/* Subtle dot grid for depth */}
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}
    />
  </div>
);
