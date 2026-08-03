import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
  className?: string;
  glowColor?: 'white' | 'zinc' | 'none';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  interactive = false,
  className = '',
  glowColor = 'none',
  ...props
}) => {
  const glowClasses = {
    white: 'shadow-[0_8px_32px_rgba(255,255,255,0.1)] border-zinc-600',
    zinc: 'shadow-[0_8px_32px_rgba(0,0,0,0.6)] border-zinc-700',
    none: '',
  };

  return (
    <div
      className={`rounded-2xl p-5 ${
        interactive ? 'glass-panel-interactive' : 'glass-panel'
      } ${glowClasses[glowColor]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
