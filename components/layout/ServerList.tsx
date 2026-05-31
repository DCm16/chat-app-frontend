'use client';

import { useState } from 'react';
import { Plus, Compass, Download } from 'lucide-react';

const SERVERS = [
  { id: '1', name: 'Gaming Hub', color: '#5865F2', initials: 'GH', hasNotif: true, notifCount: 2 },
  { id: '2', name: 'Dev Circle', color: '#57F287', initials: 'DC', hasNotif: false },
  { id: '3', name: 'Art & Design', color: '#EB459E', initials: 'AD', hasNotif: true, notifCount: 5 },
  { id: '4', name: 'Music Lounge', color: '#FEE75C', initials: 'ML', hasNotif: false },
  { id: '5', name: 'Tech Talk', color: '#ED4245', initials: 'TT', hasNotif: false },
  { id: '6', name: 'Study Group', color: '#1ABC9C', initials: 'SG', hasNotif: true, notifCount: 1 },
];

export function ServerList() {
  const [activeServer, setActiveServer] = useState<string | null>(null);
  const [homeActive, setHomeActive] = useState(true);

  const handleServerClick = (id: string) => {
    setActiveServer(id);
    setHomeActive(false);
  };

  const handleHomeClick = () => {
    setHomeActive(true);
    setActiveServer(null);
  };

  return (
    <div
      className="flex flex-col items-center py-3 gap-2 overflow-y-auto scrollbar-thin"
      style={{
        width: 72,
        minWidth: 72,
        backgroundColor: 'var(--dc-server-sidebar-bg)',
        height: '100%',
      }}
    >
      {/* Home Button */}
      <ServerIcon
        isHome
        isActive={homeActive}
        onClick={handleHomeClick}
        hasNotif={false}
      />

      {/* Separator */}
      <div style={{ width: 32, height: 2, borderRadius: 1, backgroundColor: 'var(--dc-separator)', flexShrink: 0 }} />

      {/* Server Icons */}
      {SERVERS.map((server) => (
        <ServerIcon
          key={server.id}
          name={server.name}
          initials={server.initials}
          color={server.color}
          isActive={activeServer === server.id}
          hasNotif={server.hasNotif}
          notifCount={server.notifCount}
          onClick={() => handleServerClick(server.id)}
        />
      ))}

      {/* Separator */}
      <div style={{ width: 32, height: 2, borderRadius: 1, backgroundColor: 'var(--dc-separator)', flexShrink: 0 }} />

      {/* Add Server */}
      <button
        className="server-icon flex-shrink-0"
        style={{
          backgroundColor: 'var(--dc-bg-secondary)',
          color: '#23A55A',
          border: 'none',
          cursor: 'pointer',
        }}
        title="Add a Server"
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderRadius = '30%';
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#23A55A';
          (e.currentTarget as HTMLButtonElement).style.color = 'white';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderRadius = '50%';
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--dc-bg-secondary)';
          (e.currentTarget as HTMLButtonElement).style.color = '#23A55A';
        }}
      >
        <Plus size={20} />
      </button>

      {/* Discover */}
      <button
        className="server-icon flex-shrink-0"
        style={{
          backgroundColor: 'var(--dc-bg-secondary)',
          color: '#23A55A',
          border: 'none',
          cursor: 'pointer',
        }}
        title="Explore Discoverable Servers"
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderRadius = '30%';
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#23A55A';
          (e.currentTarget as HTMLButtonElement).style.color = 'white';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderRadius = '50%';
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--dc-bg-secondary)';
          (e.currentTarget as HTMLButtonElement).style.color = '#23A55A';
        }}
      >
        <Compass size={20} />
      </button>

      {/* Download Apps */}
      <button
        className="server-icon flex-shrink-0"
        style={{
          backgroundColor: 'var(--dc-bg-secondary)',
          color: '#23A55A',
          border: 'none',
          cursor: 'pointer',
        }}
        title="Download Apps"
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderRadius = '30%';
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#23A55A';
          (e.currentTarget as HTMLButtonElement).style.color = 'white';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderRadius = '50%';
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--dc-bg-secondary)';
          (e.currentTarget as HTMLButtonElement).style.color = '#23A55A';
        }}
      >
        <Download size={18} />
      </button>
    </div>
  );
}

interface ServerIconProps {
  isHome?: boolean;
  name?: string;
  initials?: string;
  color?: string;
  isActive: boolean;
  hasNotif: boolean;
  notifCount?: number;
  onClick: () => void;
}

function ServerIcon({ isHome, name, initials, color, isActive, hasNotif, notifCount, onClick }: ServerIconProps) {
  return (
    <div className="relative flex items-center flex-shrink-0" style={{ width: 48 }}>
      {/* Active Pill */}
      <div
        style={{
          position: 'absolute',
          left: -16,
          width: 8,
          height: isActive ? 40 : hasNotif ? 8 : 0,
          borderRadius: '0 4px 4px 0',
          backgroundColor: '#f2f3f5',
          transition: 'height 0.15s ease',
        }}
      />

      <button
        className="server-icon"
        onClick={onClick}
        title={isHome ? 'Direct Messages' : name}
        style={{
          backgroundColor: isHome
            ? (isActive ? '#5865F2' : 'var(--dc-bg-primary)')
            : (isActive ? color : color + 'dd'),
          border: 'none',
          cursor: 'pointer',
          color: isHome ? (isActive ? 'white' : '#23A55A') : 'white',
          borderRadius: isActive ? '30%' : '50%',
          fontSize: isHome ? '24px' : '16px',
          fontWeight: 700,
          overflow: 'hidden',
        }}
      >
        {isHome ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.73 4.87a18.2 18.2 0 0 0-4.6-1.44c-.21.4-.4.8-.58 1.21-1.69-.25-3.35-.25-5.04 0-.18-.41-.37-.82-.59-1.21-1.6.27-3.14.75-4.6 1.44C.75 9.12-.46 13.25.14 17.33a18.33 18.33 0 0 0 5.63 2.87 13.16 13.16 0 0 0 1.06-1.72c-.57-.23-1.14-.5-1.67-.82.14-.1.28-.2.41-.3a12.95 12.95 0 0 0 11.07 0l.42.3c-.53.32-1.1.59-1.68.82.29.63.65 1.21 1.06 1.72a18.18 18.18 0 0 0 5.64-2.87c.7-4.67-.72-8.75-3.05-12.46zM8.02 14.91c-1.08 0-1.96-1.01-1.96-2.26S6.93 10.4 8.02 10.4c1.1 0 1.98 1.01 1.96 2.25 0 1.25-.87 2.26-1.96 2.26zm7.96 0c-1.08 0-1.96-1.01-1.96-2.26s.87-2.25 1.96-2.25c1.1 0 1.97 1.01 1.96 2.25 0 1.25-.86 2.26-1.96 2.26z"/>
          </svg>
        ) : (
          initials
        )}
      </button>

      {/* Notification Badge */}
      {hasNotif && !isActive && notifCount && (
        <div
          style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            minWidth: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: '#F23F43',
            color: 'white',
            fontSize: 11,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            border: '2px solid var(--dc-server-sidebar-bg)',
          }}
        >
          {notifCount}
        </div>
      )}
    </div>
  );
}
