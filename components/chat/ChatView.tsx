"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useMessages } from "@/hooks/useMessages";
import { useSocket } from "@/hooks/useSocket";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useChatStore } from "@/store/chatStore";
import { useAuthStore } from "@/store/authStore";
import { useGuestStore } from "@/store/guestStore";
import { Send, Phone, Video } from "lucide-react";
import { CallBar } from "../calls/CallBar";

interface ChatViewProps {
  conversationId: string;
  guestUsername?: string;
}

export default function ChatView({
  conversationId,
  guestUsername,
}: ChatViewProps) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [chatRect, setChatRect] = useState({ left: 0, top: 0, width: 0 });
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { messages } = useMessages(conversationId);
  const { sendMessage, sendTypingStart, sendTypingStop } =
    useSocket(conversationId);

  const {
    callStatus,
    callType,
    incomingCall,
    isMuted,
    isCameraOff,
    isTalking,
    isLocalTalking,
    isScreenSharing,
    remoteScreenSharing,
    localVideoRef,
    remoteVideoRef,
    screenVideoRef,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
  } = useWebRTC({ conversationId });

  const typingUsers = useChatStore((s) => s.typingUsers);
  const { user } = useAuthStore();
  const { guestUsername: myGuestUsername } = useGuestStore();

  const senderUsername = user?.username || myGuestUsername || "Unknown";
  const displayName = guestUsername || myGuestUsername || "Chat";

  // Measure the chat container so CallBar can match its position + width
  const measureRect = useCallback(() => {
    if (!containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    setChatRect({ left: r.left, top: r.top, width: r.width });
  }, []);

  useEffect(() => {
    measureRect();
    window.addEventListener("resize", measureRect);
    return () => window.removeEventListener("resize", measureRect);
  }, [measureRect]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || sending) return;
    const content = input.trim();
    setInput("");
    setSending(true);
    try {
      sendTypingStop();
      await sendMessage(content);
    } catch (err) {
      console.error("Send failed:", err);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  let typingTimeout: ReturnType<typeof setTimeout>;
  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
    sendTypingStart();
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(sendTypingStop, 1500);
  }

  return (
    <>
      {/* Floating call overlay — fixed, aligned to chat panel */}
      <CallBar
        callStatus={callStatus}
        callType={callType}
        incomingCall={incomingCall}
        isMuted={isMuted}
        isCameraOff={isCameraOff}
        isScreenSharing={isScreenSharing}
        remoteScreenSharing={remoteScreenSharing}
        isTalking={isTalking}
        isLocalTalking={isLocalTalking}
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        screenVideoRef={screenVideoRef}
        displayName={displayName}
        chatRect={chatRect}
        onAccept={acceptCall}
        onReject={rejectCall}
        onEnd={endCall}
        onToggleMute={toggleMute}
        onToggleCamera={toggleCamera}
        onToggleScreenShare={toggleScreenShare}
      />

      <div
        ref={containerRef}
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          backgroundColor: "var(--dc-bg-primary)",
          overflow: "hidden",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            height: 48,
            borderBottom: "1px solid var(--dc-separator)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "var(--dc-status-online)",
              }}
            />
            <span
              style={{
                fontWeight: 600,
                fontSize: 15,
                color: "var(--dc-header-primary)",
              }}
            >
              {displayName}
            </span>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <HeaderCallBtn
              onClick={() => startCall("audio")}
              disabled={callStatus !== "idle"}
              title="Audio call"
              icon={<Phone size={17} />}
            />
            <HeaderCallBtn
              onClick={() => startCall("video")}
              disabled={callStatus !== "idle"}
              title="Video call"
              icon={<Video size={17} />}
            />
          </div>
        </div>

        {/* ── Messages ── */}
        <div
          className="scrollbar-thin"
          style={{ flex: 1, overflowY: "auto", padding: "16px" }}
        >
          {messages.length === 0 && (
            <div
              style={{
                textAlign: "center",
                color: "var(--dc-text-muted)",
                marginTop: 40,
                fontSize: 14,
              }}
            >
              No messages yet. Say hello!
            </div>
          )}

          {messages.map((msg) => {
            const isMe = msg.senderUsername === senderUsername;
            return (
              <div
                key={msg._id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isMe ? "flex-end" : "flex-start",
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--dc-text-muted)",
                    marginBottom: 3,
                    fontWeight: 600,
                  }}
                >
                  {msg.senderUsername}
                  {msg.senderType === "admin" && (
                    <span
                      style={{
                        marginLeft: 5,
                        fontSize: 10,
                        color: "var(--dc-brand)",
                        fontWeight: 700,
                      }}
                    >
                      ADMIN
                    </span>
                  )}
                </span>
                <div
                  style={{
                    maxWidth: 380,
                    padding: "8px 12px",
                    borderRadius: isMe
                      ? "16px 16px 4px 16px"
                      : "16px 16px 16px 4px",
                    backgroundColor: isMe
                      ? "var(--dc-brand)"
                      : "var(--dc-bg-secondary)",
                    color: isMe ? "white" : "var(--dc-text-normal)",
                    fontSize: 14,
                    lineHeight: 1.45,
                    opacity: msg.isDeleted ? 0.4 : 1,
                    fontStyle: msg.isDeleted ? "italic" : "normal",
                  }}
                >
                  {msg.isDeleted ? "Message deleted" : msg.content}
                </div>
                <span
                  style={{
                    fontSize: 10,
                    color: "var(--dc-text-muted)",
                    marginTop: 2,
                  }}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            );
          })}

          {typingUsers.length > 0 && (
            <div
              style={{
                fontSize: 12,
                color: "var(--dc-text-muted)",
                fontStyle: "italic",
                padding: "4px 0",
              }}
            >
              {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"}{" "}
              typing…
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── Input ── */}
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid var(--dc-separator)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              backgroundColor: "var(--dc-bg-secondary)",
              borderRadius: 8,
              padding: "8px 12px",
            }}
          >
            <input
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Message..."
              style={{
                flex: 1,
                background: "none",
                border: "none",
                outline: "none",
                color: "var(--dc-text-normal)",
                fontSize: 14,
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              style={{
                background: "none",
                border: "none",
                cursor: input.trim() && !sending ? "pointer" : "not-allowed",
                color: input.trim()
                  ? "var(--dc-brand)"
                  : "var(--dc-text-muted)",
                display: "flex",
                alignItems: "center",
                padding: 0,
                transition: "color 0.15s",
              }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function HeaderCallBtn({
  onClick,
  disabled,
  title,
  icon,
}: {
  onClick: () => void;
  disabled: boolean;
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        width: 34,
        height: 34,
        borderRadius: "50%",
        border: "none",
        background: "transparent",
        cursor: disabled ? "not-allowed" : "pointer",
        color: disabled
          ? "var(--dc-interactive-muted)"
          : "var(--dc-interactive-normal)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background-color 0.15s ease, color 0.15s ease",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
            "var(--dc-bg-modifier-hover)";
          (e.currentTarget as HTMLButtonElement).style.color =
            "var(--dc-interactive-hover)";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
          "transparent";
        (e.currentTarget as HTMLButtonElement).style.color = disabled
          ? "var(--dc-interactive-muted)"
          : "var(--dc-interactive-normal)";
      }}
    >
      {icon}
    </button>
  );
}
