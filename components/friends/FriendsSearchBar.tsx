'use client';

import { Search, X } from 'lucide-react';

interface FriendsSearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export function FriendsSearchBar({ value, onChange, placeholder = 'Search' }: FriendsSearchBarProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      backgroundColor: 'var(--dc-bg-tertiary)',
      borderRadius: 4,
      padding: '6px 10px',
    }}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="search-input"
        style={{ fontSize: 14 }}
      />
      {value ? (
        <button
          onClick={() => onChange('')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dc-interactive-normal)', display: 'flex', padding: 0 }}
        >
          <X size={16} />
        </button>
      ) : (
        <Search size={16} style={{ color: 'var(--dc-text-muted)', flexShrink: 0 }} />
      )}
    </div>
  );
}
