'use client';

import { Shield } from 'lucide-react';

export function BlockedView() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        gap: 16,
        color: 'var(--dc-text-muted)',
        padding: 40,
      }}
    >
      <Shield size={72} style={{ opacity: 0.3 }} />
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--dc-header-secondary)', marginBottom: 8 }}>
          You haven&apos;t blocked anyone yet
        </h3>
        <p style={{ fontSize: 14, color: 'var(--dc-text-muted)', maxWidth: 340 }}>
          When you block someone, they won&apos;t be able to DM you or ping you.
        </p>
      </div>
    </div>
  );
}
