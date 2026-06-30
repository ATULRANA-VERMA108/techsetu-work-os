import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 32 }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* Dynamic glow filter underneath */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-full blur-[8px] opacity-25 animate-pulse" />
      
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 transition-transform duration-500 hover:scale-105"
      >
        <defs>
          <linearGradient id="logoGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-primary)" />
            <stop offset="50%" stopColor="var(--accent-tertiary)" />
            <stop offset="100%" stopColor="var(--accent-secondary)" />
          </linearGradient>
          <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* Outer Hexagon Shield - Pulsing */}
        <polygon
          points="50,5 90,28 90,72 50,95 10,72 10,28"
          stroke="url(#logoGlowGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-40"
          style={{
            transformOrigin: 'center',
            animation: 'logo-pulse 4s ease-in-out infinite alternate',
          }}
        />

        {/* Inner Connecting Bridge (Setu Nodes) - Spinning */}
        <g
          style={{
            transformOrigin: 'center',
            animation: 'logo-spin 20s linear infinite',
          }}
        >
          {/* Inner triangle */}
          <polygon
            points="50,22 75,65 25,65"
            stroke="url(#logoGlowGrad)"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#logoShadow)"
          />
          {/* Node points */}
          <circle cx="50" cy="22" r="6" fill="var(--bg-primary)" stroke="var(--accent-primary)" strokeWidth="3" />
          <circle cx="75" cy="65" r="6" fill="var(--bg-primary)" stroke="var(--accent-secondary)" strokeWidth="3" />
          <circle cx="25" cy="65" r="6" fill="var(--bg-primary)" stroke="var(--accent-tertiary)" strokeWidth="3" />
        </g>

        {/* Core Nucleus - Hover Reactive Glowing Diamond */}
        <polygon
          points="50,38 62,50 50,62 38,50"
          fill="url(#logoGlowGrad)"
          style={{
            transformOrigin: 'center',
            animation: 'logo-float 2.5s ease-in-out infinite alternate',
          }}
        />
      </svg>
      
      {/* CSS Animation injection */}
      <style>{`
        @keyframes logo-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes logo-pulse {
          0% { transform: scale(0.96); opacity: 0.35; }
          100% { transform: scale(1.04); opacity: 0.65; }
        }
        @keyframes logo-float {
          0% { transform: translateY(-2px) scale(0.9); }
          100% { transform: translateY(2px) scale(1.1); }
        }
      `}</style>
    </div>
  );
};
