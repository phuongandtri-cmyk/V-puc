import React from 'react';

interface StampProps {
  text: string;
  subtext?: string;
  variant?: 'red' | 'yellow' | 'blue' | 'green' | 'black';
  size?: 'sm' | 'md' | 'lg';
  rotation?: number;
  className?: string;
}

export const WoodblockStamp: React.FC<StampProps> = ({
  text,
  subtext,
  variant = 'red',
  size = 'md',
  rotation = -4,
  className = '',
}) => {
  const colorMap = {
    red: 'border-[#B8321C] text-[#B8321C] bg-[#FFF5F3]',
    yellow: 'border-[#1E1B18] text-[#1E1B18] bg-[#E9B824]',
    blue: 'border-[#2F4A7A] text-[#2F4A7A] bg-[#EEF3FA]',
    green: 'border-[#3E7D4F] text-[#3E7D4F] bg-[#F0F7F2]',
    black: 'border-[#1E1B18] text-[#1E1B18] bg-[#FFFDF7]',
  };

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 border-2',
    md: 'text-xs px-3 py-1 border-2 font-bold tracking-wider',
    lg: 'text-sm px-4 py-2 border-3 font-extrabold tracking-widest',
  };

  return (
    <div
      style={{ transform: `rotate(${rotation}deg)` }}
      className={`inline-flex flex-col items-center justify-center uppercase font-display border-dashed transition-transform select-none shadow-[2px_2px_0_#1E1B18] whitespace-nowrap shrink-0 ${
        colorMap[variant]
      } ${sizeClasses[size]} ${className}`}
    >
      <span className="whitespace-nowrap leading-none tracking-wider">{text}</span>
      {subtext && (
        <span className="text-[9px] font-sans font-normal opacity-85 lowercase tracking-normal whitespace-nowrap leading-tight mt-0.5">
          {subtext}
        </span>
      )}
    </div>
  );
};
