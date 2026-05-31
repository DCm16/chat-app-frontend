'use client';

import { UserStatus } from '@/types';
import { getStatusColor } from '@/lib/utils';

interface StatusIndicatorProps {
  status: UserStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP = {
  sm: { outer: 12, inner: 8, border: 2 },
  md: { outer: 16, inner: 10, border: 3 },
  lg: { outer: 20, inner: 14, border: 3 },
};

export function StatusIndicator({ status, size = 'md', className = '' }: StatusIndicatorProps) {
  const { outer, inner, border } = SIZE_MAP[size];
  const color = getStatusColor(status);

  return (
    <div
      className={`relative flex items-center justify-center rounded-full ${className}`}
      style={{ width: outer, height: outer, backgroundColor: 'var(--dc-bg-secondary)' }}
    >
      {status === 'dnd' ? (
        <div
          style={{
            width: inner,
            height: inner,
            borderRadius: '50%',
            backgroundColor: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: inner * 0.55,
              height: 2,
              backgroundColor: 'var(--dc-bg-secondary)',
              borderRadius: 1,
            }}
          />
        </div>
      ) : status === 'idle' ? (
        <div style={{ position: 'relative', width: inner, height: inner }}>
          <div
            style={{
              width: inner,
              height: inner,
              borderRadius: '50%',
              backgroundColor: color,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: -1,
              right: -1,
              width: inner * 0.55,
              height: inner * 0.55,
              borderRadius: '50%',
              backgroundColor: 'var(--dc-bg-secondary)',
            }}
          />
        </div>
      ) : status === 'streaming' ? (
        <div
          style={{
            width: inner,
            height: inner,
            borderRadius: '50%',
            backgroundColor: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width={inner * 0.5} height={inner * 0.5} viewBox="0 0 10 10" fill="white">
            <path d="M2 2 L8 5 L2 8 Z" />
          </svg>
        </div>
      ) : status === 'offline' ? (
        <div
          style={{
            width: inner * 0.6,
            height: inner * 0.6,
            borderRadius: '50%',
            border: `2px solid ${color}`,
            backgroundColor: 'transparent',
          }}
        />
      ) : (
        /* online */
        <div
          style={{
            width: inner,
            height: inner,
            borderRadius: '50%',
            backgroundColor: color,
          }}
        />
      )}
    </div>
  );
}
