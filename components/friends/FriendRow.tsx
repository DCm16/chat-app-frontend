'use client';

import { useState } from 'react';
import { MessageCircle, MoreVertical, Video, UserMinus, Volume2 } from 'lucide-react';
import { User } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { IconButton } from '@/components/ui/IconButton';
import { getStatusLabel } from '@/lib/utils';

interface FriendRowProps {
  user: User;
  showDivider?: boolean;
}

export function FriendRow({ user, showDivider = true }: FriendRowProps) {
  const [showMenu, setShowMenu] = useState(false);

  const statusText = user.customStatus
    ? user.customStatus
    : getStatusLabel(user.status);

  return (
    <div>
      {showDivider && (
        <div style={{ height: 1, backgroundColor: 'var(--dc-separator)', margin: '0 16px' }} />
      )}
      <div
        className="friend-row"
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
          gap: 16,
          position: 'relative',
          margin: '0 8px',
        }}
      >
        {/* Avatar */}
        <Avatar user={user} size="md" showStatus />

        {/* User Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{
              fontWeight: 600,
              fontSize: 15,
              color: 'var(--dc-header-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {user.displayName}
            </span>
          </div>
          <div style={{
            fontSize: 13,
            color: 'var(--dc-text-muted)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {user.status === 'streaming' ? (
              <span style={{ color: '#593695' }}>{statusText}</span>
            ) : (
              statusText
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="friend-actions" style={{ display: 'flex', gap: 8 }}>
          <IconButton tooltip="Message">
            <MessageCircle size={20} />
          </IconButton>
          <IconButton tooltip="More">
            <MoreVertical size={20} />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
