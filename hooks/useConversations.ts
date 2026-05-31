"use client";
import { useEffect } from "react";
import api from "@/lib/api";
import { useChatStore } from "@/store/chatStore";
import { Conversation } from "@/types";

export const useConversations = () => {
  const { conversations, setConversations } = useChatStore();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await api.get<{ conversations: Conversation[] }>(
          "/api/conversations"
        );
        setConversations(data.conversations);
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
      }
    };

    fetchConversations();
  }, [setConversations]);

  return { conversations };
};
