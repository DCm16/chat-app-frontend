'use client';

import { useState } from 'react';

export function AddFriendView() {
  const [username, setUsername] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (username.trim()) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setUsername('');
    }
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 680 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--dc-header-primary)', marginBottom: 4 }}>
        Add Friend
      </h2>
      <p style={{ fontSize: 14, color: 'var(--dc-text-muted)', marginBottom: 20 }}>
        You can add friends with their Discord username.
      </p>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--dc-bg-tertiary)',
          borderRadius: 8,
          padding: '4px 4px 4px 16px',
          border: `1px solid ${submitted ? '#23A55A' : 'var(--dc-bg-tertiary)'}`,
          transition: 'border-color 0.2s ease',
        }}
      >
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="You can add friends with their Discord username."
          className="search-input"
          style={{ fontSize: 16, padding: '8px 0', flex: 1 }}
        />
        <button
          onClick={handleSubmit}
          disabled={!username.trim()}
          style={{
            backgroundColor: username.trim() ? 'var(--dc-brand)' : '#3a3d44',
            color: username.trim() ? 'white' : 'var(--dc-text-muted)',
            border: 'none',
            borderRadius: 4,
            padding: '10px 16px',
            fontSize: 14,
            fontWeight: 500,
            cursor: username.trim() ? 'pointer' : 'not-allowed',
            transition: 'background 0.1s ease',
            whiteSpace: 'nowrap',
          }}
        >
          Send Friend Request
        </button>
      </div>

      {submitted && (
        <p style={{ fontSize: 14, color: '#23A55A', marginTop: 8 }}>
          ✓ Success! Your friend request to {username} was sent.
        </p>
      )}

      <div style={{ marginTop: 32 }}>
        <div style={{ height: 1, backgroundColor: 'var(--dc-separator)', marginBottom: 24 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--dc-header-secondary)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            Other Places to Make Friends
          </h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { emoji: '🎮', label: 'Find your game community', color: '#5865F2' },
            { emoji: '🎨', label: 'Creative & art servers', color: '#EB459E' },
            { emoji: '💻', label: 'Tech & dev communities', color: '#57F287' },
            { emoji: '🎵', label: 'Music & streaming spaces', color: '#FEE75C' },
          ].map(({ emoji, label, color }) => (
            <div
              key={label}
              style={{
                backgroundColor: 'var(--dc-bg-secondary)',
                borderRadius: 8,
                padding: 16,
                cursor: 'pointer',
                transition: 'background 0.1s ease',
                border: '1px solid var(--dc-separator)',
              }}
              onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--dc-bg-hover)'}
              onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--dc-bg-secondary)'}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>{emoji}</div>
              <div style={{ fontSize: 13, color: 'var(--dc-text-muted)' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
