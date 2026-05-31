"use client";

import { useState, useEffect } from "react";
import { DMSidebar } from "@/components/layout/DMSidebar";
import { useRouter } from "next/navigation";
import { useGuestStore } from "@/store/guestStore";

export default function ChatPage() {
  const [activeDMId, setActiveDMId] = useState<string | undefined>(undefined);
  const [isFriendsActive, setIsFriendsActive] = useState(true);

  const { conversationId, _hasHydrated } = useGuestStore();
  const router = useRouter();

  const handleDMSelect = (id: string) => {
    setActiveDMId(id);
    setIsFriendsActive(false);
  };

  const handleFriendsClick = () => {
    setIsFriendsActive(true);
    setActiveDMId(undefined);
  };

  useEffect(() => {
    if (!_hasHydrated) return;
    if (conversationId) {
      router.replace(`/chats/${conversationId}`);
    } else {
      router.replace("/");
    }
  }, [_hasHydrated, conversationId, router]);

  return (
    <main
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        backgroundColor: "var(--dc-bg-primary)",
      }}
    >
      {/* Server List — leftmost column */}
      {/* <ServerList /> */}

      {/* DM Sidebar */}
      <DMSidebar
        activeDMId={activeDMId}
        onDMSelect={handleDMSelect}
        onFriendsClick={handleFriendsClick}
        isFriendsActive={isFriendsActive}
      />

      {/* Main content area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          backgroundColor: "var(--dc-bg-primary)",
        }}
      >
        {isFriendsActive ?? <DMConversationPlaceholder dmId={activeDMId} />}
      </div>
    </main>
  );
}

function DMConversationPlaceholder({ dmId }: { dmId?: string }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
        color: "var(--dc-text-muted)",
      }}
    >
      <div style={{ fontSize: 64 }}>💬</div>
      <h2
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: "var(--dc-header-primary)",
        }}
      >
        Direct Message
      </h2>
      <p style={{ fontSize: 15, color: "var(--dc-text-muted)" }}>
        DM conversation view would appear here
      </p>
    </div>
  );
}
