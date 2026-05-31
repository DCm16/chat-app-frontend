'use client';

import { GamepadIcon, Music, Code } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { FRIENDS } from '@/lib/data';

const ACTIVITIES = [
  {
    user: FRIENDS[0],
    activity: 'Listening to Spotify',
    detail: 'Midnight Rain — Taylor Swift',
    icon: '🎵',
    color: '#1DB954',
    type: 'music',
  },
  {
    user: FRIENDS[3],
    activity: 'Live on Twitch',
    detail: 'Minecraft — 142 viewers',
    icon: '📡',
    color: '#9146FF',
    type: 'stream',
  },
  {
    user: FRIENDS[1],
    activity: 'Playing a game',
    detail: 'Valorant — Competitive',
    icon: '🎮',
    color: '#FF4655',
    type: 'game',
  },
  {
    user: FRIENDS[2],
    activity: 'Using Visual Studio Code',
    detail: 'Working on a project',
    icon: '💻',
    color: '#007ACC',
    type: 'app',
  },
];

export function ActivitySidebar() {
  return (
    <div
      style={{
        width: 240,
        minWidth: 240,
        backgroundColor: 'var(--dc-bg-secondary)',
        borderLeft: '1px solid var(--dc-separator)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ padding: '16px 16px 8px' }}>
        <h3 style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: 'var(--dc-header-secondary)',
        }}>
          Active Now
        </h3>
      </div>

      {/* Activity List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 16px' }} className="scrollbar-thin">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {ACTIVITIES.map(({ user, activity, detail, icon, color }) => (
            <div
              key={user.id}
              style={{
                padding: '12px 12px',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'background 0.1s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--dc-bg-modifier-hover)'}
              onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'}
            >
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                <Avatar user={user} size="sm" showStatus />
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--dc-header-primary)' }}>
                  {user.displayName}
                </span>
              </div>
              <div style={{
                backgroundColor: 'var(--dc-bg-primary)',
                borderRadius: 6,
                padding: '8px 10px',
                borderLeft: `3px solid ${color}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 14 }}>{icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--dc-header-secondary)' }}>
                    {activity}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--dc-text-muted)', paddingLeft: 20 }}>
                  {detail}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer cta */}
      <div style={{ padding: 16, borderTop: '1px solid var(--dc-separator)' }}>
        <div
          style={{
            backgroundColor: 'var(--dc-bg-tertiary)',
            borderRadius: 8,
            padding: 12,
            cursor: 'pointer',
          }}
        >
          <p style={{ fontSize: 13, color: 'var(--dc-text-muted)', marginBottom: 8 }}>
            Show your friends what you&apos;re up to!
          </p>
          <button
            className="dc-btn-secondary"
            style={{ width: '100%', fontSize: 13, padding: '6px 12px' }}
          >
            Enable Activity Status
          </button>
        </div>
      </div>
    </div>
  );
}
