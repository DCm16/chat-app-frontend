import { create } from "zustand";
import { Conversation, Message } from "@/types";

interface ChatState {
  // Conversations (admin sidebar)
  conversations: Conversation[];
  setConversations: (conversations: Conversation[]) => void;
  updateConversation: (id: string, data: Partial<Conversation>) => void;

  // Active conversation
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;

  // Messages
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  deleteMessage: (messageId: string) => void;

  // Typing
  typingUsers: string[];
  addTyping: (username: string) => void;
  removeTyping: (username: string) => void;

  // Unread
  decrementUnread: (conversationId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  setConversations: (conversations) => set({ conversations }),
  updateConversation: (id, data) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c._id === id ? { ...c, ...data } : c
      ),
    })),

  activeConversationId: null,
  setActiveConversationId: (id) => set({ activeConversationId: id, messages: [] }),

  messages: [],
  setMessages: (messages) => set({ messages: [...messages] }),
  addMessage: (message) =>
    set((s) => ({ messages: [...s.messages, message] })),
  deleteMessage: (messageId) =>
    set((s) => ({
      messages: s.messages.filter((m) => m._id !== messageId),
    })),

  typingUsers: [],
  addTyping: (username) =>
    set((s) => ({
      typingUsers: s.typingUsers.includes(username)
        ? s.typingUsers
        : [...s.typingUsers, username],
    })),
  removeTyping: (username) =>
    set((s) => ({
      typingUsers: s.typingUsers.filter((u) => u !== username),
    })),

  decrementUnread: (conversationId) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c._id === conversationId
          ? { ...c, unreadCount: 0 }
          : c
      ),
    })),
}));
