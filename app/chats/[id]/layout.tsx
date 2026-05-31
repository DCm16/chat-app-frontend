"use client";

import { useGuestStore } from "@/store/guestStore";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import { GuestSidebar } from "@/components/layout/GuestSidebar";

export default function ChatDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isGuest, _hasHydrated } = useGuestStore();
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    if (_hasHydrated && !isGuest()) {
      router.replace("/");
    }
  }, [_hasHydrated, isGuest, router]);

  if (!_hasHydrated) return null;

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
      <GuestSidebar activeConversationId={id as string} />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </main>
  );
}
