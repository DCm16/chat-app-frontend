"use client";

import { GamepadIcon, Music, Code } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

export function ActivitySidebar() {
  return (
    <div
      style={{
        width: 240,
        minWidth: 240,
        backgroundColor: "var(--dc-bg-secondary)",
        borderLeft: "1px solid var(--dc-separator)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ padding: "16px 16px 8px" }}>
        <h3
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "var(--dc-header-secondary)",
          }}
        >
          Active Now
        </h3>
      </div>

      {/* Activity List */}
      <div
        style={{ flex: 1, overflowY: "auto", padding: "0 8px 16px" }}
        className="scrollbar-thin"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}></div>
      </div>

      {/* Footer cta */}
      <div style={{ padding: 16, borderTop: "1px solid var(--dc-separator)" }}>
        <div
          style={{
            backgroundColor: "var(--dc-bg-tertiary)",
            borderRadius: 8,
            padding: 12,
            cursor: "pointer",
          }}
        >
          <p
            style={{
              fontSize: 13,
              color: "var(--dc-text-muted)",
              marginBottom: 8,
            }}
          >
            Show your friends what you&apos;re up to!
          </p>
          <button
            className="dc-btn-secondary"
            style={{ width: "100%", fontSize: 13, padding: "6px 12px" }}
          >
            Enable Activity Status
          </button>
        </div>
      </div>
    </div>
  );
}
