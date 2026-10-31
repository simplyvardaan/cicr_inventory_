import React from 'react';

export const CicrLogo: React.FC<{ size?: number; className?: string }> = ({
  size = 56,
  className = '',
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl bg-white dark:bg-black border-2 border-slate-200 dark:border-slate-800 shadow-md p-1.5 overflow-hidden group ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src="/cicr-logo.jpg"
        alt="CICR Inventory Logo"
        className="w-full h-full object-contain filter contrast-125"
      />
    </div>
  );
};
