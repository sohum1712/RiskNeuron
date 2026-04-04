/**
 * AppBackground — single source of truth for the Bg07.jpeg background
 * used across all post-landing pages. Ensures identical visual treatment.
 */
import React from 'react';
import bgUrl from '../assets/images/Bg07.jpeg';

export const AppBackground: React.FC = () => (
  <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
    {/* Base image — higher brightness so the photo shows through, not grey */}
    <img
      src={bgUrl}
      alt=""
      className="w-full h-full object-cover"
      style={{ filter: 'brightness(0.55) contrast(1.05) saturate(1.1)' }}
    />
    {/* Thin dark base layer — just enough to ensure text contrast */}
    <div className="absolute inset-0 bg-[#0C1117]/40" />
    {/* Top vignette so navbar is always readable */}
    <div className="absolute inset-0 bg-gradient-to-b from-[#0C1117]/70 via-transparent to-[#0C1117]/60" />
  </div>
);
