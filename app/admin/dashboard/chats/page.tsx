"use client";

import { useConversations } from "@/hooks/useConversations";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DMSidebar } from "@/components/layout/DMSidebar";

export default function AdminChatsPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  useConversations(); // load conversations into store

  useEffect(() => {
    if (!isAuthenticated()) router.replace("/admin/login");
  }, [isAuthenticated, router]);

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
      <DMSidebar
        activeDMId={undefined}
        onDMSelect={(id) => router.push(`/admin/dashboard/chats/${id}`)}
        onFriendsClick={() => {}}
        isFriendsActive={true}
      />
      {/* <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          backgroundColor: "var(--dc-bg-primary)",
        }}
      >
        <FriendsContent />
      </div> */}
    </main>
  );
}
