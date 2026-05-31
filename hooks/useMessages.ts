"use client";
import { useEffect } from "react";
import api from "@/lib/api";
import { useChatStore } from "@/store/chatStore";
import { Message } from "@/types";

export const useMessages = (conversationId: string) => {
  const { messages, setMessages } = useChatStore();

  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      try {
        const { data } = await api.get<{ messages: Message[] }>(
          `/api/conversations/${conversationId}/messages`
        );
        setMessages(data.messages);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    fetchMessages();
  }, [conversationId, setMessages]);

  return { messages };
};
