"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Users,
  Settings,
  Mic,
  Headphones,
  Plus,
  EllipsisVertical,
  KeyRound,
  Trash2,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { getStatusColor, getStatusLabel } from "@/lib/utils";
import { InviteUserModal } from "@/components/modals/InviteUserModal";
import { LogoutMenu } from "@/components/layout/LogoutMenu";
import { useChatStore } from "@/store/chatStore";
import { useAuthStore } from "@/store/authStore";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";

interface DMSidebarProps {
  activeDMId?: string;
  onDMSelect: (id: string) => void;
  onFriendsClick: () => void;
  isFriendsActive: boolean;
}

export function DMSidebar({
  activeDMId,
  onDMSelect,
  onFriendsClick,
  isFriendsActive,
}: DMSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const { signOut } = useAuth();
  const router = useRouter();

  const { user } = useAuthStore();

  console.log("user", user);

  const conversations = useChatStore((s) => s.conversations);

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [dropdown, setDropdown] = useState<{
    open: boolean;
    dmId: string;
    username: string;
    anchorRect: DOMRect | null;
    activeCode: string;
  }>({ open: false, dmId: "", username: "", anchorRect: null, activeCode: "" });
  const [ellipsisModal, setEllipsisModal] = useState<{
    open: boolean;
    username: string;
    code: string;
    conversationId: string;
  }>({ open: false, username: "", code: "", conversationId: "" });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [logoutMenuRect, setLogoutMenuRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdown((prev) => ({ ...prev, open: false }));
      }
    }
    if (dropdown.open)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdown.open]);

  const filteredConversations = conversations.filter((c) =>
    c.guestUsername.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  async function handleDeleteUser(conversationId: string) {
    try {
      await api.delete(`/api/conversations/${conversationId}`);
      useChatStore
        .getState()
        .setConversations(
          useChatStore
            .getState()
            .conversations.filter((c) => c._id !== conversationId),
        );
    } catch (err) {
      console.error("Failed to archive conversation:", err);
    }
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{
        width: 240,
        minWidth: 240,
        backgroundColor: "var(--dc-sidebar-bg)",
      }}
    >
      {/* Search */}
      <div style={{ padding: "12px 8px 8px", flexShrink: 0 }}>
        <button
          onClick={onFriendsClick}
          style={{
            width: "100%",
            padding: "6px 8px",
            borderRadius: 4,
            backgroundColor: "var(--dc-bg-tertiary)",
            border: "none",
            cursor: "text",
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "var(--dc-text-muted)",
            fontSize: 14,
            textAlign: "left",
          }}
        >
          <Search size={14} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>Find or start a conversation</span>
        </button>
      </div>

      {/* Content */}
      <div
        className="flex-1 overflow-y-auto scrollbar-thin"
        style={{ padding: "0 8px" }}
      >
        {/* Friends / header row */}
        <div
          className="sidebar-item"
          onClick={onFriendsClick}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 8px",
            cursor: "pointer",
            color: isFriendsActive
              ? "var(--dc-interactive-active)"
              : "var(--dc-channel-text)",
            backgroundColor: isFriendsActive
              ? "var(--dc-bg-modifier-active)"
              : "transparent",
            borderRadius: 4,
            marginBottom: 2,
          }}
        >
          <div className="w-full flex items-center justify-between">
            <div className="flex gap-2">
              <Users
                size={20}
                style={{
                  flexShrink: 0,
                  color: isFriendsActive ? "#f2f3f5" : "inherit",
                }}
              />
              <span style={{ fontWeight: 500, fontSize: 15 }}>Friends</span>
            </div>
            {isAdmin && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setInviteModalOpen(true);
                }}
                title="Invite User"
                style={{
                  background: "none",
                  border: "none",
                  padding: 2,
                  borderRadius: 4,
                  cursor: "pointer",
                  color: "var(--dc-interactive-normal)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "color 0.1s ease",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.color =
                    "var(--dc-interactive-hover)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.color =
                    "var(--dc-interactive-normal)")
                }
              >
                <Plus size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex flex-col gap-0.5">
          {filteredConversations.map((conv) => (
            <div
              key={conv._id}
              className="group"
              onClick={() => {
                onDMSelect(conv._id);
                router.push(
                  isAdmin
                    ? `/admin/dashboard/chats/${conv._id}`
                    : `/chats/${conv._id}`,
                );
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "6px 8px",
                borderRadius: 4,
                cursor: "pointer",
                backgroundColor:
                  activeDMId === conv._id
                    ? "var(--dc-bg-modifier-active)"
                    : "transparent",
                color:
                  activeDMId === conv._id
                    ? "var(--dc-interactive-active)"
                    : "var(--dc-channel-text)",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                if (activeDMId !== conv._id) {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor =
                    "var(--dc-bg-modifier-hover)";
                  (e.currentTarget as HTMLDivElement).style.color =
                    "var(--dc-interactive-hover)";
                }
              }}
              onMouseLeave={(e) => {
                if (activeDMId !== conv._id) {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor =
                    "transparent";
                  (e.currentTarget as HTMLDivElement).style.color =
                    "var(--dc-channel-text)";
                }
              }}
            >
              {/* Avatar placeholder */}
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
                }}
              >
                {conv.guestUsername.charAt(0).toUpperCase()}
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
                  {conv.guestUsername}
                </div>
                {conv.lastMessageAt && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--dc-text-muted)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {new Date(conv.lastMessageAt).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Unread badge */}
              {!!conv.unreadCount && (
                <div
                  className="group-hover:hidden"
                  style={{
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: "#F23F43",
                    color: "white",
                    fontSize: 11,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 4px",
                    flexShrink: 0,
                  }}
                >
                  {conv.unreadCount}
                </div>
              )}

              {/* Ellipsis button (admin only) */}
              {isAdmin && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdown({
                      open: true,
                      dmId: conv._id,
                      username: conv.guestUsername,
                      anchorRect: (
                        e.currentTarget as HTMLButtonElement
                      ).getBoundingClientRect(),
                      activeCode: conv.activeCode || "",
                    });
                  }}
                  title="More options"
                  className="hidden group-hover:flex"
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 4,
                    border: "none",
                    background: "transparent",
                    color: "var(--dc-interactive-normal)",
                    cursor: "pointer",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    padding: 0,
                    transition: "color 0.1s ease",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.color =
                      "var(--dc-interactive-hover)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.color =
                      "var(--dc-interactive-normal)")
                  }
                >
                  <EllipsisVertical size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current User Panel */}
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
        {user && (
          <div style={{ position: "relative", cursor: "pointer" }}>
            <Avatar user={user} size="sm" showStatus />
          </div>
        )}
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
            {user?.username}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--dc-text-muted)",
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: getStatusColor(
                  user?.isOnline ? "online" : "offline",
                ),
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            {getStatusLabel(user?.isOnline ? "online" : "offline")}
          </div>
        </div>
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
                setLogoutMenuRect(null);
                signOut();
              }}
            />
          )}
        </div>
      </div>

      {/* Invite modal */}
      <InviteUserModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
      />

      {/* Ellipsis code modal */}
      <InviteUserModal
        open={ellipsisModal.open}
        onOpenChange={(val) =>
          setEllipsisModal((prev) => ({ ...prev, open: val }))
        }
        initialUsername={ellipsisModal.username}
        initialCode={ellipsisModal.code}
        conversationId={ellipsisModal.conversationId}
      />

      {/* Dropdown menu */}
      {dropdown.open && dropdown.anchorRect && (
        <div
          ref={dropdownRef}
          style={{
            position: "fixed",
            top: dropdown.anchorRect.bottom + 4,
            left: dropdown.anchorRect.left,
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
          <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}`}</style>
          <button
            onClick={() => {
              setDropdown((p) => ({ ...p, open: false }));
              setEllipsisModal({
                open: true,
                username: dropdown.username,
                code: dropdown.activeCode,
                conversationId: dropdown.dmId,
              });
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 8px",
              borderRadius: 4,
              border: "none",
              background: "transparent",
              color: "var(--dc-text-normal)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              textAlign: "left",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                "rgba(88,101,242,0.15)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                "transparent")
            }
          >
            <KeyRound size={14} color="#5865F2" />
            Show Code
          </button>
          <div
            style={{
              height: 1,
              background: "var(--dc-separator)",
              margin: "4px 0",
            }}
          />
          <button
            onClick={() => {
              setDropdown((p) => ({ ...p, open: false }));
              handleDeleteUser(dropdown.dmId);
            }}
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
            <Trash2 size={14} />
            Delete User
          </button>
        </div>
      )}
    </div>
  );
}
