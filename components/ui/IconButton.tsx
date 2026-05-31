'use client';

import { ReactNode } from 'react';

interface IconButtonProps {
  children: ReactNode;
  onClick?: () => void;
  tooltip?: string;
  className?: string;
  variant?: 'default' | 'success' | 'danger';
  size?: 'sm' | 'md';
}

const VARIANT_COLORS = {
  default: 'var(--dc-interactive-normal)',
  success: '#23A55A',
  danger: '#F23F43',
};

const VARIANT_HOVER_BG = {
  default: 'var(--dc-bg-modifier-hover)',
  success: 'rgba(35, 165, 90, 0.15)',
  danger: 'rgba(242, 63, 67, 0.15)',
};

export function IconButton({
  children,
  onClick,
  tooltip,
  className = '',
  variant = 'default',
  size = 'md',
}: IconButtonProps) {
  const btnSize = size === 'sm' ? 28 : 36;

  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`icon-btn ${className}`}
      style={{
        width: btnSize,
        height: btnSize,
        color: VARIANT_COLORS[variant],
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = VARIANT_HOVER_BG[variant];
        (e.currentTarget as HTMLButtonElement).style.color =
          variant === 'default' ? 'var(--dc-interactive-hover)' : VARIANT_COLORS[variant];
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
        (e.currentTarget as HTMLButtonElement).style.color = VARIANT_COLORS[variant];
      }}
    >
      {children}
    </button>
  );
}
