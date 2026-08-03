import React from 'react';

interface PillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  activeGlow?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PillButton: React.FC<PillButtonProps> = ({
  active = false,
  activeGlow = false,
  icon,
  children,
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-2.5 text-base gap-2.5',
  };

  let variantClass = 'neu-pill text-slate-300';
  if (active) {
    variantClass = activeGlow ? 'neu-pill-active-glow' : 'neu-pill-active';
  }

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95 ${sizeClasses[size]} ${variantClass} ${className}`}
      {...props}
    >
      {icon && <span className="flex items-center justify-center">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
