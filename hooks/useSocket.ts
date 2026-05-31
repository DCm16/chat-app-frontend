"use client";
import { useEffect, useCallback } from "react";
import getSocket from "@/lib/socket";
import { useChatStore } from "@/store/chatStore";
import { Message } from "@/types";

export const useSocket = (conversationId: string) => {
  useEffect(() => {
    if (!conversationId) return;
    const socket = getSocket();

    const onMessage = (msg: Message) => {
      useChatStore.getState().addMessage(msg);
      // Clear unread when receiving a message in active conversation
      useChatStore.getState().decrementUnread(msg.conversation);
    };

    const onDeleted = ({ messageId }: { messageId: string }) =>
      useChatStore.getState().deleteMessage(messageId);

    const onTypingStart = ({ username, senderType }: { username: string; senderType: string }) => {
      if (username) useChatStore.getState().addTyping(username);
    };

    const onTypingStop = ({ username }: { username: string }) => {
      if (username) useChatStore.getState().removeTyping(username);
    };

    const onRead = ({ conversationId: cid }: { conversationId: string }) => {
      useChatStore.getState().decrementUnread(cid);
    };

    socket.on("message:new", onMessage);
    socket.on("message:deleted", onDeleted);
    socket.on("typing:start", onTypingStart);
    socket.on("typing:stop", onTypingStop);
    socket.on("messages:read", onRead);

    const doJoin = () => {
      socket.emit("room:join", conversationId);
    };

    if (socket.connected) {
      doJoin();
    } else {
      socket.once("connect", doJoin);
      socket.connect();
    }

    return () => {
      socket.off("message:new", onMessage);
      socket.off("message:deleted", onDeleted);
      socket.off("typing:start", onTypingStart);
      socket.off("typing:stop", onTypingStop);
      socket.off("messages:read", onRead);
      socket.off("connect", doJoin);
      socket.emit("room:leave", conversationId);
    };
  }, [conversationId]);

  const sendMessage = useCallback(
    (content: string) =>
      new Promise((resolve, reject) => {
        getSocket().emit(
          "message:send",
          { room: conversationId, content },
          (res: { error?: string; message?: Message }) =>
            res.error ? reject(res.error) : resolve(res.message)
        );
      }),
    [conversationId]
  );

  const sendTypingStart = useCallback(
    () => getSocket().emit("typing:start", { room: conversationId }),
    [conversationId]
  );

  const sendTypingStop = useCallback(
    () => getSocket().emit("typing:stop", { room: conversationId }),
    [conversationId]
  );

  const deleteMessage = useCallback(
    (messageId: string) =>
      new Promise((resolve, reject) => {
        getSocket().emit(
          "message:delete",
          { messageId, room: conversationId },
          (res: { error?: string; success?: boolean }) =>
            res.error ? reject(res.error) : resolve(res)
        );
      }),
    [conversationId]
  );

  return { sendMessage, sendTypingStart, sendTypingStop, deleteMessage };
};
