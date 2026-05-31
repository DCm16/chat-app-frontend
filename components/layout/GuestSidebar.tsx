"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, Mic, Headphones } from "lucide-react";
import { LogoutMenu } from "@/components/layout/LogoutMenu";
import { useGuestStore } from "@/store/guestStore";
import api from "@/lib/api";

interface ConversationInfo {
  _id: string;
  adminUser: { username: string; isOnline?: boolean };
  guestUsername: string;
}

export function GuestSidebar({
  activeConversationId,
}: {
  activeConversationId: string;
}) {
  const { guestUsername, conversationId, clearGuest } = useGuestStore();
  const [logoutMenuRect, setLogoutMenuRect] = useState<DOMRect | null>(null);
  const cogRef = useRef<HTMLButtonElement>(null);
  const [conversation, setConversation] = useState<ConversationInfo | null>(
    null,
  );
  const router = useRouter();

  useEffect(() => {
    if (!conversationId) return;
    api
      .get<{ conversation: ConversationInfo }>(
        `/api/conversations/${conversationId}/info`,
      )
      .then(({ data }) => setConversation(data.conversation))
      .catch(() => {});
  }, [conversationId]);

  const adminName = conversation?.adminUser?.username ?? "Admin";
  const isActive = activeConversationId === conversationId;

  return (
    <div
      className="flex flex-col h-full"
      style={{
        width: 240,
        minWidth: 240,
        backgroundColor: "var(--dc-sidebar-bg)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 8px 8px",
          flexShrink: 0,
          borderBottom: "1px solid var(--dc-separator)",
        }}
      >
        <div
          style={{
            padding: "6px 8px",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--dc-text-muted)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          Direct Messages
        </div>
      </div>

      {/* Conversation list — only one entry */}
      <div
        className="flex-1 overflow-y-auto scrollbar-thin"
        style={{ padding: "8px" }}
      >
        {conversationId && (
          <div
            onClick={() => router.push(`/chats/${conversationId}`)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "6px 8px",
              borderRadius: 6,
              cursor: "pointer",
              backgroundColor: isActive
                ? "var(--dc-bg-modifier-active)"
                : "transparent",
              color: isActive
                ? "var(--dc-interactive-active)"
                : "var(--dc-channel-text)",
              transition: "background-color 0.1s ease",
            }}
            onMouseEnter={(e) => {
              if (!isActive)
                (e.currentTarget as HTMLDivElement).style.backgroundColor =
                  "var(--dc-bg-modifier-hover)";
            }}
            onMouseLeave={(e) => {
              if (!isActive)
                (e.currentTarget as HTMLDivElement).style.backgroundColor =
                  "transparent";
            }}
          >
            {/* Admin avatar */}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                backgroundColor: "var(--dc-brand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                color: "white",
                flexShrink: 0,
                position: "relative",
              }}
            >
              {adminName.charAt(0).toUpperCase()}
              {/* Online indicator */}
              <span
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: "var(--dc-status-online)",
                  border: "2px solid var(--dc-sidebar-bg)",
                }}
              />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 500,
                  fontSize: 14,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {adminName}
              </div>
              <div style={{ fontSize: 11, color: "var(--dc-text-muted)" }}>
                Admin
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Guest user panel */}
      <div
        style={{
          height: 52,
          backgroundColor: "var(--dc-bg-tertiary)",
          display: "flex",
          alignItems: "center",
          padding: "0 8px",
          gap: 8,
          flexShrink: 0,
        }}
      >
        {/* Guest avatar */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            backgroundColor: "var(--dc-bg-accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 700,
            color: "var(--dc-text-normal)",
            flexShrink: 0,
          }}
        >
          {guestUsername?.charAt(0).toUpperCase() ?? "?"}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--dc-header-primary)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {guestUsername ?? "Guest"}
          </div>
          <div style={{ fontSize: 11, color: "var(--dc-text-muted)" }}>
            Guest
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 2 }}>
          <button
            className="icon-btn"
            style={{ width: 32, height: 32 }}
            title="Mute"
          >
            <Mic size={18} />
          </button>
          <button
            className="icon-btn"
            style={{ width: 32, height: 32 }}
            title="Deafen"
          >
            <Headphones size={18} />
          </button>
          <button
            ref={cogRef}
            className="icon-btn"
            style={{ width: 32, height: 32 }}
            title="Settings"
            onClick={(e) => {
              const rect = (
                e.currentTarget as HTMLButtonElement
              ).getBoundingClientRect();
              setLogoutMenuRect((prev) => (prev ? null : rect));
            }}
          >
            <Settings size={18} />
          </button>

          {logoutMenuRect && (
            <LogoutMenu
              anchorRect={logoutMenuRect}
              onClose={() => setLogoutMenuRect(null)}
              onLogout={() => {
                clearGuest();
                router.push("/");
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
