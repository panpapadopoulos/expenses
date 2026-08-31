import React from 'react';

export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shrink-0"
    >
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#f8fafc" strokeWidth="2" />
        <path
          d="M12 7v10M9.5 9.4a2.5 2.5 0 0 1 2.5-1.8c1.8 0 2.6 1 2.6 2 0 2.4-5.1 1.6-5.1 4 0 1 .9 2 2.5 2a2.5 2.5 0 0 0 2.5-1.7"
          stroke="#10b981"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}
