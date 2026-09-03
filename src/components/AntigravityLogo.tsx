import React from 'react';

interface AntigravityLogoProps {
  className?: string;
  size?: number;
}

export const AntigravityLogo: React.FC<AntigravityLogoProps> = ({ className = '', size = 32 }) => {
  return (
    <div 
      style={{ width: size, height: size }} 
      className={`relative flex items-center justify-center group shrink-0 ${className}`}
    >
      {/* Outer 4-Color Google Gradient Orbiting Ring */}
      <div 
        className="absolute inset-0 rounded-full p-[2px] animate-spin"
        style={{ animationDuration: '8s' }}
      >
        <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#4285f4] via-[#ea4335] via-[#fbbc05] to-[#34a853] opacity-90 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Inner Black Glass Core */}
      <div className="absolute inset-[2px] rounded-full bg-slate-950 flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform">
        {/* White Central Google Antigravity Star Spark */}
        <svg 
          viewBox="0 0 24 24" 
          className="w-1/2 h-1/2 text-white fill-current drop-shadow-[0_0_8px_rgba(255,255,255,0.9)] transition-transform duration-300 group-hover:rotate-45"
        >
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
      </div>

      {/* Radial Outer Glow Pulse */}
      <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#4285f4] via-[#ea4335] to-[#34a853] opacity-20 blur-md group-hover:opacity-50 transition-opacity pointer-events-none" />
    </div>
  );
};
