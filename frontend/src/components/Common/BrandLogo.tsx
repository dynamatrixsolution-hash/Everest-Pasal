// ==============================================================================
// EVEREST PASAL - OFFICIAL BRAND LOGO COMPONENT
// Mountain + Cube Emblem with Himalayan Blue (#0B4EA2) and Nepali Crimson (#E63946)
// ==============================================================================

import React, { useState } from 'react';

interface BrandLogoProps {
  variant?: 'horizontal' | 'stacked' | 'icon' | 'dark' | 'app-icon' | 'white';
  height?: number;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'horizontal',
  height = 42,
  className,
}) => {
  const [imageError, setImageError] = useState(false);

  const getImageSrc = () => {
    switch (variant) {
      case 'icon':
      case 'app-icon':
        return '/logo-icon.png';
      case 'stacked':
      case 'dark':
      case 'white':
      case 'horizontal':
      default:
        return '/logo.png';
    }
  };

  // If PNG image renders cleanly
  if (!imageError) {
    if (variant === 'icon' || variant === 'app-icon') {
      return (
        <img
          src={getImageSrc()}
          alt="Everest Pasal Icon"
          height={height}
          className={className}
          onError={() => setImageError(true)}
          style={{ height: `${height}px`, width: 'auto', display: 'inline-block', objectFit: 'contain' }}
        />
      );
    }

    return (
      <img
        src={getImageSrc()}
        alt="Everest Pasal - Nepal to the World"
        height={height}
        className={className}
        onError={() => setImageError(true)}
        style={{ height: `${height}px`, width: 'auto', display: 'inline-block', objectFit: 'contain' }}
      />
    );
  }

  // Fallback crisp SVG vector
  const emblemWidth = height;
  const emblemHeight = height;

  const renderEmblem = (isDarkBg: boolean = false) => (
    <svg
      width={emblemWidth}
      height={emblemHeight}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', flexShrink: 0 }}
    >
      <path
        d="M50 8L15 28V68L50 88V72L27 58V36L50 22L73 36V48L85 41V28L50 8Z"
        fill={isDarkBg ? '#38BDF8' : '#0B4EA2'}
      />
      <path d="M50 8L76 23L65 30L50 21L35 30L50 8Z" fill="#E63946" />
      <path d="M62 15L85 28L73 35L58 25L62 15Z" fill="#E63946" />
      <path d="M38 42L76 42L85 47L38 47V42Z" fill={isDarkBg ? '#FFFFFF' : '#0B4EA2'} />
      <path d="M38 52L72 52L80 57L38 57V52Z" fill={isDarkBg ? '#FFFFFF' : '#0B4EA2'} />
      <path d="M38 62L68 62L76 67L38 67V62Z" fill={isDarkBg ? '#FFFFFF' : '#0B4EA2'} />
      <path d="M38 68L64 53L76 60L50 75L38 68Z" fill="#E63946" opacity="0.9" />
    </svg>
  );

  const isDark = variant === 'dark' || variant === 'white';

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        textDecoration: 'none',
      }}
    >
      {renderEmblem(isDark)}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: `${Math.max(18, height * 0.52)}px`,
            fontWeight: 800,
            lineHeight: 1.1,
          }}
        >
          <span style={{ color: isDark ? '#FFFFFF' : '#0B4EA2', letterSpacing: '-0.02em' }}>Everest</span>
          <span style={{ color: '#E63946', letterSpacing: '-0.02em' }}>Pasal</span>
        </div>
        <div
          style={{
            fontSize: `${Math.max(8.5, height * 0.22)}px`,
            fontWeight: 700,
            letterSpacing: '1.8px',
            color: isDark ? '#94A3B8' : '#475569',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '2px',
          }}
        >
          <span style={{ width: '14px', height: '1px', backgroundColor: isDark ? '#475569' : '#CBD5E1' }} />
          NEPAL TO THE WORLD
          <span style={{ width: '14px', height: '1px', backgroundColor: isDark ? '#475569' : '#CBD5E1' }} />
        </div>
      </div>
    </div>
  );
};

