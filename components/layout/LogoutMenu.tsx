"use client";

import { useEffect, useRef } from "react";
import { LogOut } from "lucide-react";

interface LogoutMenuProps {
  anchorRect: DOMRect;
  onLogout: () => void;
  onClose: () => void;
}

export function LogoutMenu({ anchorRect, onLogout, onClose }: LogoutMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        bottom: 60,
        left: anchorRect.left,
        zIndex: 9999,
        background: "#111214",
        border: "1px solid var(--dc-separator)",
        borderRadius: 6,
        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        minWidth: 160,
        padding: "4px",
        animation: "slideUp 0.12s ease-out",
      }}
    >
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <button
        onClick={onLogout}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 8px",
          borderRadius: 4,
          border: "none",
          background: "transparent",
          color: "#F23F43",
          fontSize: 13,
          fontWeight: 500,
          cursor: "pointer",
          textAlign: "left",
          transition: "background 0.1s ease",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background =
            "rgba(242,63,67,0.12)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background =
            "transparent")
        }
      >
        <LogOut size={14} />
        Log out
      </button>
    </div>
  );
}
