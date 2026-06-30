import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loader({ message, size = 'sm', className }) {
  const sizeMap = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
  };
  const sizeClass = sizeMap[size] || 'h-12 w-12';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black font-sans">
      <Loader2 className={`${sizeClass} animate-spin text-black mb-2 ${className}`} />
      {message &&
        <div className="text-xs font-semibold tracking-wider uppercase text-slate-500">{message}</div>
      }
    </div>
  );
}
  