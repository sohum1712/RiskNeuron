/**
 * BrandLogo — "Axio" in Poppins SemiBold Italic, white.
 * Used in every navbar, footer, and auth page.
 */
import React from 'react';

interface BrandLogoProps {
  size?: number; // font-size in px, default 22
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 22, className = '' }) => (
  <span
    className={className}
    style={{
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 600,
      fontStyle: 'italic',
      fontSize: size,
      color: '#ffffff',
      letterSpacing: '-0.01em',
      lineHeight: 1,
    }}
  >
    Axio
  </span>
);
