'use client';

import { Check, X, MoreVertical } from 'lucide-react';
import { FriendRequest } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { IconButton } from '@/components/ui/IconButton';

interface FriendRequestRowProps {
  request: FriendRequest;
  showDivider?: boolean;
}

export function FriendRequestRow({ request, showDivider = true }: FriendRequestRowProps) {
  const { user, type } = request;

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
        <Avatar user={user} size="md" showStatus={false} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--dc-header-primary)' }}>
            {user.displayName}
          </div>
          <div style={{ fontSize: 13, color: 'var(--dc-text-muted)' }}>
            {type === 'incoming' ? 'Incoming Friend Request' : 'Outgoing Friend Request'}
          </div>
        </div>

        <div className="friend-actions" style={{ display: 'flex', gap: 8 }}>
          {type === 'incoming' && (
            <IconButton tooltip="Accept" variant="success">
              <Check size={20} />
            </IconButton>
          )}
          <IconButton tooltip={type === 'incoming' ? 'Ignore' : 'Cancel'} variant="danger">
            <X size={20} />
          </IconButton>
          <IconButton tooltip="More">
            <MoreVertical size={20} />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
