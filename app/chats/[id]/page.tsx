"use client";

import { useParams } from "next/navigation";
import { useGuestStore } from "@/store/guestStore";
import ChatView from "@/components/chat/ChatView";

export default function ChatDetailPage() {
  const { id } = useParams();
  const { guestUsername } = useGuestStore();

  return (
    <ChatView
      conversationId={id as string}
      guestUsername={guestUsername ?? undefined}
    />
  );
}
