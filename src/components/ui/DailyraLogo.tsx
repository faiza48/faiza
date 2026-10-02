import React from 'react';

interface DailyraLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  darkMode?: boolean;
}

export const DailyraLogo: React.FC<DailyraLogoProps> = ({
  size = 'md',
  showTagline = true,
  darkMode = false,
}) => {
  const iconDimensions =
    size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  const titleSize =
    size === 'sm'
      ? 'text-2xl'
      : size === 'lg'
      ? 'text-4xl'
      : 'text-[31px] leading-none';

  return (
    <div className="inline-flex items-center gap-3 select-none">
      {/* Sculpted Serif D + Two-Tone Leaf Emblem matching Reference Image */}
      <div className={`${iconDimensions} relative flex-shrink-0 flex items-center justify-center`}>
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-hidden="true"
        >
          {/* Top & Bottom Serif Bars of the D */}
          <path
            d="M11 11H31C46.464 11 56 20.5 56 32.5C56 44.5 46.464 54 31 54H11"
            stroke={darkMode ? '#8FBF9F' : '#234732'}
            strokeWidth="4.2"
            strokeLinecap="round"
          />
          {/* Left Vertical Stem */}
          <path
            d="M17 11V54"
            stroke={darkMode ? '#8FBF9F' : '#234732'}
            strokeWidth="5.2"
            strokeLinecap="round"
          />
          {/* Deep Forest Green Outer Leaf */}
          <path
            d="M17 51C19 34 30 22 47 19C45 36 35 49 17 51Z"
            fill={darkMode ? '#3E7B52' : '#234732'}
          />
          {/* Soft Sage Inner Leaf Highlight */}
          <path
            d="M19 49C23 36 32 27 45 23C40 36 31 45 19 49Z"
            fill={darkMode ? '#74A984' : '#588165'}
          />
          {/* Delicate Leaf Vein */}
          <path
            d="M18 50C25 39 33 31 43 24"
            stroke={darkMode ? '#142019' : '#F6F4EE'}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="flex flex-col">
        <span
          className={`font-serif-display font-semibold tracking-tight ${titleSize} ${
            darkMode ? 'text-[#EDF2EE]' : 'text-[#1F3A2B]'
          }`}
        >
          Dailyra
        </span>
        {showTagline && (
          <span
            className={`text-[11px] tracking-[0.02em] mt-0.5 whitespace-nowrap ${
              darkMode ? 'text-[#96A79C]' : 'text-[#6E7671]'
            }`}
          >
            Your Life. Every Day.
          </span>
        )}
      </div>
    </div>
  );
};
