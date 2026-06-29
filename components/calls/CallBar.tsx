"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  ChevronDown,
  ChevronUp,
  Monitor,
  MonitorOff,
} from "lucide-react";
import { CallType, CallStatus } from "@/hooks/useWebRTC";

interface CallBarProps {
  callStatus: CallStatus;
  callType: CallType;
  incomingCall: { from: string; callType: CallType; roomId: string } | null;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  remoteScreenSharing: boolean;
  isTalking: boolean;
  isLocalTalking: boolean;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  screenVideoRef: React.RefObject<HTMLVideoElement | null>;
  displayName: string;
  /** Left offset + width of the chat panel — passed from ChatView via a ref */
  chatRect: { left: number; width: number; top: number };
  activeCallInRoom: { callType: CallType; roomId: string } | null;
  onRejoin: () => void;
  onAccept: () => void;
  onReject: () => void;
  onEnd: () => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
}

const MIN_H = 56;
const COLLAPSED_H = 56;

export function CallBar({
  callStatus,
  callType,
  incomingCall,
  isMuted,
  isCameraOff,
  isScreenSharing,
  remoteScreenSharing,
  isTalking,
  isLocalTalking,
  localVideoRef,
  remoteVideoRef,
  screenVideoRef,
  displayName,
  chatRect,
  activeCallInRoom,
  onRejoin,
  onAccept,
  onReject,
  onEnd,
  onToggleMute,
  onToggleCamera,
  onToggleScreenShare,
}: CallBarProps) {
  // Lazy initializer — runs only on the client, never during SSR
  const [height, setHeight] = useState(() =>
    typeof window !== "undefined" ? Math.round(window.innerHeight / 3) : 300,
  );
  const [collapsed, setCollapsed] = useState(false);
  const [showScreenConfirm, setShowScreenConfirm] = useState(false);
  const resizeRef = useRef<{ startY: number; startH: number } | null>(null);

  // Reset height when a new call starts
  useEffect(() => {
    if (callStatus !== "idle") {
      setHeight(Math.round(window.innerHeight / 3));
      setCollapsed(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callStatus]);

  // ── Vertical resize from bottom edge ─────────────────────────────
  const onResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      resizeRef.current = { startY: e.clientY, startH: height };
      const onMove = (ev: MouseEvent) => {
        if (!resizeRef.current) return;
        const next = Math.min(
          window.innerHeight * 0.85,
          Math.max(
            MIN_H,
            resizeRef.current.startH + ev.clientY - resizeRef.current.startY,
          ),
        );
        setHeight(next);
      };
      const onUp = () => {
        resizeRef.current = null;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [height],
  );

  if (callStatus === "idle" && !activeCallInRoom) return null;

  const isVideo = callType === "video";
  const isIncoming = callStatus === "incoming";
  const isCalling = callStatus === "calling";
  const isActive = callStatus === "active";
  const isReconnecting = callStatus === "reconnecting";
  const isRejoinable = callStatus === "idle" && !!activeCallInRoom;
  const displayH = collapsed ? COLLAPSED_H : height;

  return (
    <>
      <style>{`
        @keyframes pulse-ring {
          0%   { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes wave {
          0%, 100% { transform: scaleY(0.4); }
          50%       { transform: scaleY(1); }
        }
        @keyframes btn-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(35,165,90,0.5); }
          50%       { box-shadow: 0 0 0 8px rgba(35,165,90,0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        .call-overlay { animation: slideDown 0.2s ease forwards; }
        .resize-strip:hover .resize-pill { background: rgba(255,255,255,0.35) !important; }
        .screen-confirm { animation: fadeIn 0.15s ease forwards; }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div
        className="call-overlay"
        style={{
          position: "fixed",
          left: chatRect.left,
          top: chatRect.top,
          width: chatRect.width,
          height: displayH,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          backgroundColor:
            isActive && isVideo ? "#000" : "var(--dc-bg-secondary)",
          borderBottom: "1px solid var(--dc-separator)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
          transition: collapsed ? "height 0.2s ease" : "none",
          userSelect: "none",
        }}
      >
        {/* ── Top bar: label + collapse toggle ── */}
        <div
          style={{
            height: 40,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 14px",
            backgroundColor: "rgba(0,0,0,0.2)",
            backdropFilter: "blur(6px)",
            zIndex: 2,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(255,255,255,0.5)",
              letterSpacing: "0.04em",
            }}
          >
            {isIncoming
              ? `Incoming ${incomingCall?.callType} call`
              : isCalling
                ? "Calling…"
                : isVideo
                  ? "Video call"
                  : "Voice call"}
          </span>
          <button
            onClick={() => setCollapsed((v) => !v)}
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              border: "none",
              background: "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.5)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {collapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
          </button>
        </div>

        {/* ── Content ── */}
        {!collapsed && (
          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            {/* INCOMING */}
            {isIncoming && (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                }}
              >
                <TalkingAvatar
                  name={incomingCall?.from ?? "?"}
                  size={56}
                  talking={false}
                  ringing
                />
                <div style={{ textAlign: "center" }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 16,
                      fontWeight: 700,
                      color: "var(--dc-header-primary)",
                    }}
                  >
                    {incomingCall?.from}
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 12,
                      color: "var(--dc-text-muted)",
                    }}
                  >
                    Incoming {incomingCall?.callType} call
                  </p>
                </div>
                <div style={{ display: "flex", gap: 24 }}>
                  <RoundBtn
                    onClick={onReject}
                    color="#F23F43"
                    icon={<PhoneOff size={18} />}
                    label="Decline"
                  />
                  <RoundBtn
                    onClick={onAccept}
                    color="#23A55A"
                    icon={<Phone size={18} />}
                    label="Accept"
                    pulse
                  />
                </div>
              </div>
            )}

            {/* CALLING */}
            {isCalling && (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                }}
              >
                <TalkingAvatar
                  name={displayName}
                  size={56}
                  talking={false}
                  ringing
                />
                <div style={{ textAlign: "center" }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 16,
                      fontWeight: 700,
                      color: "var(--dc-header-primary)",
                    }}
                  >
                    {displayName}
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 12,
                      color: "var(--dc-text-muted)",
                    }}
                  >
                    Calling…
                  </p>
                </div>
                <RoundBtn
                  onClick={onEnd}
                  color="#F23F43"
                  icon={<PhoneOff size={18} />}
                  label="Cancel"
                />
              </div>
            )}

            {/* RECONNECTING — remote peer dropped, waiting for them */}
            {isReconnecting && (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 14,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    border: "3px solid rgba(88,101,242,0.4)",
                    borderTopColor: "#5865F2",
                    animation: "spin 1s linear infinite",
                  }}
                />
                <div style={{ textAlign: "center" }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 15,
                      fontWeight: 700,
                      color: "var(--dc-header-primary)",
                    }}
                  >
                    {displayName} disconnected
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 12,
                      color: "var(--dc-text-muted)",
                    }}
                  >
                    Waiting for them to reconnect…
                  </p>
                </div>
                <RoundBtn
                  onClick={onEnd}
                  color="#F23F43"
                  icon={<PhoneOff size={18} />}
                  label="End call"
                />
              </div>
            )}

            {/* REJOIN — this user reloaded while a call was active */}
            {isRejoinable && (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 14,
                  padding: 16,
                }}
              >
                <TalkingAvatar name={displayName} size={52} talking={false} />
                <div style={{ textAlign: "center" }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 15,
                      fontWeight: 700,
                      color: "var(--dc-header-primary)",
                    }}
                  >
                    {displayName} is still in the call
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 12,
                      color: "var(--dc-text-muted)",
                    }}
                  >
                    You left a {activeCallInRoom?.callType} call
                  </p>
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                  <RoundBtn
                    onClick={onEnd}
                    color="#F23F43"
                    icon={<PhoneOff size={18} />}
                    label="Leave"
                  />
                  <RoundBtn
                    onClick={onRejoin}
                    color="#23A55A"
                    icon={<Phone size={18} />}
                    label="Rejoin"
                    pulse
                  />
                </div>
              </div>
            )}

            {/* ACTIVE */}
            {isActive && (
              <>
                {/* ── Always-mounted video elements ──────────────────────────
                    All refs must be attached before srcObject is ever set,
                    so every <video> stays in the DOM at all times.
                    Visibility is controlled via CSS, not conditional rendering. */}

                {/* Remote stream — ALWAYS mounted and playing.
                    Never use display:none — hidden elements don't play video.
                    Use z-index + opacity to layer correctly. */}
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: remoteScreenSharing ? "contain" : "cover",
                    background: "#000",
                    // Hidden behind local screen share, but still playing
                    zIndex: isScreenSharing ? 0 : 1,
                    opacity: isScreenSharing ? 0 : 1,
                  }}
                />

                {/* Local screen share — shown only when local is sharing */}
                <video
                  ref={screenVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    background: "#000",
                    display: isScreenSharing ? "block" : "none",
                  }}
                />

                {/* Local camera PiP — video calls only, hidden while screen sharing */}
                {isVideo && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 56,
                      right: 12,
                      width: 90,
                      height: 112,
                      borderRadius: 8,
                      overflow: "hidden",
                      border: "1.5px solid rgba(255,255,255,0.2)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                      display: isScreenSharing ? "none" : "block",
                    }}
                  >
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transform: "scaleX(-1)",
                      }}
                    />
                    {isCameraOff && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "#1e1f22",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <VideoOff size={16} color="#949ba4" />
                      </div>
                    )}
                  </div>
                )}

                {/* Audio-only avatar — hidden whenever any screen share is active */}
                {!isVideo && !isScreenSharing && !remoteScreenSharing && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 12,
                    }}
                  >
                    <TalkingAvatar
                      name={displayName}
                      size={60}
                      talking={isTalking}
                    />
                    <p
                      style={{
                        margin: 0,
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--dc-header-primary)",
                      }}
                    >
                      {displayName}
                    </p>
                  </div>
                )}

                {/* Screen share badge — shown to remote viewer */}
                {remoteScreenSharing && !isScreenSharing && (
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      left: 12,
                      zIndex: 6,
                      background: "rgba(0,0,0,0.55)",
                      borderRadius: 6,
                      padding: "3px 8px",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <Monitor size={12} color="#fff" />
                    <span style={{ fontSize: 11, color: "#fff" }}>
                      {displayName} is sharing screen
                    </span>
                  </div>
                )}

                {/* Controls */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 52,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    background: isVideo
                      ? "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)"
                      : "transparent",
                    zIndex: 5,
                  }}
                >
                  <SmallBtn
                    onClick={onToggleMute}
                    active={isMuted}
                    icon={isMuted ? <MicOff size={15} /> : <Mic size={15} />}
                    title={isMuted ? "Unmute" : "Mute"}
                  />
                  {isVideo && (
                    <SmallBtn
                      onClick={onToggleCamera}
                      active={isCameraOff}
                      icon={
                        isCameraOff ? (
                          <VideoOff size={15} />
                        ) : (
                          <Video size={15} />
                        )
                      }
                      title={isCameraOff ? "Show cam" : "Hide cam"}
                    />
                  )}
                  <SmallBtn
                    onClick={() => {
                      if (isScreenSharing) {
                        onToggleScreenShare();
                      } else {
                        setShowScreenConfirm(true);
                      }
                    }}
                    active={isScreenSharing}
                    icon={
                      isScreenSharing ? (
                        <MonitorOff size={15} />
                      ) : (
                        <Monitor size={15} />
                      )
                    }
                    title={isScreenSharing ? "Stop sharing" : "Share screen"}
                  />
                  <SmallBtn
                    onClick={onEnd}
                    danger
                    icon={<PhoneOff size={15} />}
                    title="End call"
                  />
                </div>

                {/* Screen share confirm dialog */}
                {showScreenConfirm && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      zIndex: 20,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "rgba(0,0,0,0.55)",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    <div
                      className="screen-confirm"
                      style={{
                        backgroundColor: "var(--dc-bg-primary, #313338)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 12,
                        padding: "24px 28px",
                        width: "min(280px, 85%)",
                        textAlign: "center",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                      }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
                          backgroundColor: "rgba(88,101,242,0.15)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 14px",
                        }}
                      >
                        <Monitor size={22} color="#5865F2" />
                      </div>
                      <p
                        style={{
                          margin: "0 0 6px",
                          fontSize: 15,
                          fontWeight: 700,
                          color: "var(--dc-header-primary, #f2f3f5)",
                        }}
                      >
                        Share your screen?
                      </p>
                      <p
                        style={{
                          margin: "0 0 20px",
                          fontSize: 12,
                          color: "var(--dc-text-muted, #949ba4)",
                          lineHeight: 1.5,
                        }}
                      >
                        The other person will be able to see everything on the
                        screen you choose.
                      </p>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button
                          onClick={() => setShowScreenConfirm(false)}
                          style={{
                            flex: 1,
                            height: 36,
                            borderRadius: 6,
                            border: "none",
                            backgroundColor: "rgba(255,255,255,0.08)",
                            color: "var(--dc-text-normal, #dbdee1)",
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            setShowScreenConfirm(false);
                            onToggleScreenShare();
                          }}
                          style={{
                            flex: 1,
                            height: 36,
                            borderRadius: 6,
                            border: "none",
                            backgroundColor: "#5865F2",
                            color: "white",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Start sharing
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Collapsed active strip */}
        {collapsed && isActive && (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <TalkingAvatar name={displayName} size={28} talking={isTalking} />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--dc-header-primary)",
                }}
              >
                {displayName}
              </span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <SmallBtn
                onClick={onToggleMute}
                active={isMuted}
                icon={isMuted ? <MicOff size={13} /> : <Mic size={13} />}
                title={isMuted ? "Unmute" : "Mute"}
              />
              <SmallBtn
                onClick={onEnd}
                danger
                icon={<PhoneOff size={13} />}
                title="End call"
              />
            </div>
          </div>
        )}

        {/* ── Bottom resize strip ── */}
        {!collapsed && (
          <div
            className="resize-strip"
            onMouseDown={onResizeStart}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 10,
              cursor: "ns-resize",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              className="resize-pill"
              style={{
                width: 40,
                height: 3,
                borderRadius: 2,
                backgroundColor: "rgba(255,255,255,0.18)",
                transition: "background 0.15s",
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}

/* ── Talking avatar ── */
function TalkingAvatar({
  name,
  size,
  talking,
  ringing,
}: {
  name: string;
  size: number;
  talking: boolean;
  ringing?: boolean;
}) {
  const initial = name?.charAt(0).toUpperCase() ?? "?";
  return (
    <div
      style={{ position: "relative", width: size, height: size, flexShrink: 0 }}
    >
      {ringing && (
        <div
          style={{
            position: "absolute",
            inset: -6,
            borderRadius: "50%",
            border: "2px solid rgba(88,101,242,0.5)",
            animation: "pulse-ring 1.2s ease-out infinite",
          }}
        />
      )}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          backgroundColor: talking ? "#5865F2" : "var(--dc-bg-accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.38,
          fontWeight: 800,
          color: "white",
          transition: "background-color 0.2s ease",
          border: talking ? "2px solid #5865F2" : "2px solid transparent",
          boxShadow: talking ? "0 0 0 3px rgba(88,101,242,0.3)" : "none",
          position: "relative",
          zIndex: 1,
        }}
      >
        {initial}
      </div>
      {talking && (
        <div
          style={{
            position: "absolute",
            bottom: -12,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "flex-end",
            gap: 2,
            height: 10,
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 3,
                height: "100%",
                borderRadius: 2,
                backgroundColor: "#5865F2",
                animation: "wave 0.6s ease infinite",
                animationDelay: `${i * 0.1}s`,
                transformOrigin: "bottom",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RoundBtn({
  onClick,
  color,
  icon,
  label,
  pulse,
}: {
  onClick: () => void;
  color: string;
  icon: React.ReactNode;
  label: string;
  pulse?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      <button
        onClick={onClick}
        style={{
          width: 46,
          height: 46,
          borderRadius: "50%",
          border: "none",
          backgroundColor: color,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          transition: "transform 0.15s ease",
          animation: pulse ? "btn-pulse 1.5s ease infinite" : "none",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {icon}
      </button>
      <span style={{ fontSize: 10, color: "var(--dc-text-muted)" }}>
        {label}
      </span>
    </div>
  );
}

function SmallBtn({
  onClick,
  icon,
  title,
  active,
  danger,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 34,
        height: 34,
        borderRadius: "50%",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: danger
          ? "#F23F43"
          : active
            ? "rgba(255,255,255,0.25)"
            : "rgba(255,255,255,0.1)",
        color: "white",
        transition: "transform 0.15s ease, background-color 0.15s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {icon}
    </button>
  );
}
