export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  isOnline?: boolean;
}

export interface Conversation {
  _id: string;
  adminUser: string;
  guestUsername: string;
  status: "active" | "archived";
  lastMessageAt?: string;
  createdAt: string;
  unreadCount?: number;
  activeCode?: string | null;
}

export interface Message {
  _id: string;
  conversation: string;
  senderType: "admin" | "guest";
  senderUsername: string;
  content: string;
  messageType: "text" | "image" | "file";
  readAt: string | null;
  isDeleted: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface GuestJoinResponse {
  token: string;
  conversationId: string;
  guestUsername: string;
  message: string;
}

export interface InviteCreateResponse {
  code: string;
  conversationId: string;
  guestUsername: string;
  message: string;
}

export type UserStatus = "online" | "idle" | "dnd" | "offline" | "streaming";
