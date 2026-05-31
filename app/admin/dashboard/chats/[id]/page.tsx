"use client";

import { useParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DMSidebar } from "@/components/layout/DMSidebar";
import { useChatStore } from "@/store/chatStore";
import { useConversations } from "@/hooks/useConversations";
import ChatView from "@/components/chat/ChatView";

export default function AdminChatDetailPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useConversations(); // keep sidebar populated

  const conversations = useChatStore((s) => s.conversations);
  const conversation = conversations.find((c) => c._id === id);

  useEffect(() => {
    if (!isAuthenticated()) router.replace("/admin/login");
  }, [isAuthenticated, router]);

  return (
    <main style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden", backgroundColor: "var(--dc-bg-primary)" }}>
      <DMSidebar
        activeDMId={id as string}
        onDMSelect={(dmId) => router.push(`/admin/dashboard/chats/${dmId}`)}
        onFriendsClick={() => router.push("/admin/dashboard/chats")}
        isFriendsActive={false}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <ChatView
          conversationId={id as string}
          guestUsername={conversation?.guestUsername}
        />
      </div>
    </main>
  );
}
