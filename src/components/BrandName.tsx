import React from 'react';

interface BrandNameProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BrandName: React.FC<BrandNameProps> = ({ className = '', size = 'md' }) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <div className={`flex flex-col select-none ${className}`}>
      {/* Top Line: IP-SAKTI with Custom Leaf in 'A' */}
      <div className="flex items-center tracking-tight font-display font-black leading-none">
        {/* 'IP-' in dark herbal green */}
        <span className={`${isLg ? 'text-2xl sm:text-3xl' : isSm ? 'text-base' : 'text-lg sm:text-xl'} text-[#165B33]`}>
          IP-
        </span>
        {/* 'SAKTI' in dark slate/charcoal */}
        <span className={`${isLg ? 'text-2xl sm:text-3xl' : isSm ? 'text-base' : 'text-lg sm:text-xl'} text-[#2A3439] flex items-center`}>
          <span>S</span>
          <span className="relative inline-flex items-center justify-center">
            <span>A</span>
            {/* Green leaf nestled in the top aperture of 'A' */}
            <svg
              className={`absolute top-0.5 left-[2.5px] sm:left-[3px] text-[#2e7d32] fill-current pointer-events-none ${
                isLg ? 'w-3 h-3' : isSm ? 'w-2 h-2' : 'w-2.5 h-2.5'
              }`}
              viewBox="0 0 24 24"
            >
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
            </svg>
          </span>
          <span>KTI</span>
        </span>
      </div>

      {/* Bottom Subtitle: SAHAYAK with wide tracking */}
      <div
        className={`font-sans font-bold text-[#3B4A54] uppercase tracking-[0.32em] ${
          isLg ? 'text-xs mt-1' : isSm ? 'text-[8.5px] mt-0.5' : 'text-[9.5px] sm:text-[10.5px] mt-0.5'
        }`}
      >
        SAHAYAK
      </div>
    </div>
  );
};
