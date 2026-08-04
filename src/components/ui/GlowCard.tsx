import React from 'react';
import { cn } from '@/lib/utils';

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
}

export function GlowCard({ children, className, accentColor = "#6C00FF" }: GlowCardProps) {
  return (
    <div 
      className={cn(
        "soc-card relative group overflow-hidden border-shadow-border/50 hover:border-shadow-purple/50",
        className
      )}
    >
      <div 
        className="absolute -inset-px bg-gradient-to-r from-transparent via-shadow-purple/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
