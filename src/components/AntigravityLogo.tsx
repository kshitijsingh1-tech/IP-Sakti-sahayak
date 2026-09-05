import React from 'react';

interface AntigravityLogoProps {
  className?: string;
  size?: number;
}

export const AntigravityLogo: React.FC<AntigravityLogoProps> = ({ className = '', size = 32 }) => {
  return (
    <div 
      style={{ width: size, height: size }} 
      className={`relative flex items-center justify-center group shrink-0 rounded-full bg-white shadow-xs border border-slate-200/90 overflow-hidden ${className}`}
    >
      <img
        src="/ip-sakti-logo.png"
        alt="IP-SAKTI Emblem Logo"
        className="w-[84%] h-[84%] object-contain group-hover:scale-105 transition-transform duration-200"
      />
    </div>
  );
};
