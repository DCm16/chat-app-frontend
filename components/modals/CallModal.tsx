"use client";

import { useEffect, useRef } from "react";
import {
  Phone,
  PhoneOff,
  PhoneIncoming,
  Mic,
  MicOff,
  Video,
  VideoOff,
  X,
} from "lucide-react";
import { CallType, CallStatus } from "@/hooks/useWebRTC";

interface CallModalProps {
  callStatus: CallStatus;
  callType: CallType;
  incomingCall: { from: string; callType: CallType; roomId: string } | null;
  isMuted: boolean;
  isCameraOff: boolean;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  displayName: string; // name of the other person
  onAccept: () => void;
  onReject: () => void;
  onEnd: () => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
}

export function CallModal({
  callStatus,
  callType,
  incomingCall,
  isMuted,
  isCameraOff,
  localVideoRef,
  remoteVideoRef,
  displayName,
  onAccept,
  onReject,
  onEnd,
  onToggleMute,
  onToggleCamera,
}: CallModalProps) {
  if (callStatus === "idle") return null;

  const isVideo = callType === "video";
  const isIncoming = callStatus === "incoming";
  const isCalling = callStatus === "calling";
  const isActive = callStatus === "active";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor:
          isActive && isVideo ? "transparent" : "rgba(0,0,0,0.75)",
        backdropFilter: isActive && isVideo ? "none" : "blur(8px)",
      }}
    >
      {/* ── Active video call — full screen ── */}
      {isActive && isVideo && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "#000" }}>
          {/* Remote video — full screen */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />

          {/* Local video — picture in picture */}
          <div
            style={{
              position: "absolute",
              bottom: 100,
              right: 16,
              width: 120,
              height: 160,
              borderRadius: 12,
              overflow: "hidden",
              border: "2px solid rgba(255,255,255,0.2)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
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
                  backgroundColor: "#1e1f22",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <VideoOff size={24} color="#949ba4" />
              </div>
            )}
          </div>

          {/* Call controls */}
          <div
            style={{
              position: "absolute",
              bottom: 32,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              gap: 16,
            }}
          >
            <CallControlButton
              onClick={onToggleMute}
              active={isMuted}
              icon={isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              label={isMuted ? "Unmute" : "Mute"}
            />
            <CallControlButton
              onClick={onToggleCamera}
              active={isCameraOff}
              icon={isCameraOff ? <VideoOff size={20} /> : <Video size={20} />}
              label={isCameraOff ? "Show cam" : "Hide cam"}
            />
            <CallControlButton
              onClick={onEnd}
              danger
              icon={<PhoneOff size={20} />}
              label="End"
            />
          </div>

          {/* Name label */}
          <div
            style={{
              position: "absolute",
              top: 24,
              left: 0,
              right: 0,
              textAlign: "center",
            }}
          >
            <p
              style={{
                color: "white",
                fontSize: 16,
                fontWeight: 600,
                margin: 0,
                textShadow: "0 2px 8px rgba(0,0,0,0.5)",
              }}
            >
              {displayName}
            </p>
          </div>
        </div>
      )}

      {/* ── Active audio call ── */}
      {isActive && !isVideo && (
        <div
          style={{
            background: "var(--dc-bg-secondary)",
            border: "1px solid var(--dc-separator)",
            borderRadius: 16,
            padding: "40px 48px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
            minWidth: 280,
            boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
          }}
        >
          <Avatar name={displayName} size={72} animate />
          <div style={{ textAlign: "center" }}>
            <p
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "var(--dc-header-primary)",
                margin: 0,
              }}
            >
              {displayName}
            </p>
            <p
              style={{
                fontSize: 13,
                color: "#23A55A",
                margin: "4px 0 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: "#23A55A",
                  display: "inline-block",
                  animation: "pulse 1.5s ease infinite",
                }}
              />
              Connected
            </p>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <CallControlButton
              onClick={onToggleMute}
              active={isMuted}
              icon={isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              label={isMuted ? "Unmute" : "Mute"}
            />
            <CallControlButton
              onClick={onEnd}
              danger
              icon={<PhoneOff size={20} />}
              label="End"
            />
          </div>
          {/* hidden audio element for remote stream */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{ display: "none" }}
          />
        </div>
      )}

      {/* ── Calling (waiting for answer) ── */}
      {isCalling && (
        <div
          style={{
            background: "var(--dc-bg-secondary)",
            border: "1px solid var(--dc-separator)",
            borderRadius: 16,
            padding: "40px 48px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
            minWidth: 280,
            boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
          }}
        >
          <Avatar name={displayName} size={72} animate />
          <div style={{ textAlign: "center" }}>
            <p
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "var(--dc-header-primary)",
                margin: 0,
              }}
            >
              {displayName}
            </p>
            <p
              style={{
                fontSize: 13,
                color: "var(--dc-text-muted)",
                margin: "4px 0 0",
              }}
            >
              {callType === "video" ? "📹" : "📞"} Calling…
            </p>
          </div>
          <button
            onClick={onEnd}
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              border: "none",
              backgroundColor: "#F23F43",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 16px rgba(242,63,67,0.4)",
              transition: "transform 0.15s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.08)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <PhoneOff size={22} color="white" />
          </button>
        </div>
      )}

      {/* ── Incoming call ── */}
      {isIncoming && (
        <div
          style={{
            background: "var(--dc-bg-secondary)",
            border: "1px solid var(--dc-separator)",
            borderRadius: 16,
            padding: "40px 48px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
            minWidth: 280,
            boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
            animation: "slideUp 0.25s ease-out",
          }}
        >
          <Avatar name={incomingCall?.from ?? "?"} size={72} animate />
          <div style={{ textAlign: "center" }}>
            <p
              style={{
                fontSize: 13,
                color: "var(--dc-text-muted)",
                margin: "0 0 4px",
              }}
            >
              Incoming {incomingCall?.callType === "video" ? "video" : "audio"}{" "}
              call
            </p>
            <p
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "var(--dc-header-primary)",
                margin: 0,
              }}
            >
              {incomingCall?.from}
            </p>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {/* Reject */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <button
                onClick={onReject}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  border: "none",
                  backgroundColor: "#F23F43",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 16px rgba(242,63,67,0.4)",
                  transition: "transform 0.15s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.08)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <PhoneOff size={22} color="white" />
              </button>
              <span style={{ fontSize: 11, color: "var(--dc-text-muted)" }}>
                Decline
              </span>
            </div>

            {/* Accept */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <button
                onClick={onAccept}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  border: "none",
                  backgroundColor: "#23A55A",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 16px rgba(35,165,90,0.4)",
                  transition: "transform 0.15s ease",
                  animation: "ring 1s ease infinite",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.08)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <Phone size={22} color="white" />
              </button>
              <span style={{ fontSize: 11, color: "var(--dc-text-muted)" }}>
                Accept
              </span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes ring  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ripple {
          0%   { transform:scale(1); opacity:0.6; }
          100% { transform:scale(1.8); opacity:0; }
        }
      `}</style>
    </div>
  );
}

/* ── Avatar ── */
function Avatar({
  name,
  size,
  animate,
}: {
  name: string;
  size: number;
  animate?: boolean;
}) {
  const initial = name?.charAt(0).toUpperCase() ?? "?";
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {animate && (
        <>
          <div
            style={{
              position: "absolute",
              inset: -8,
              borderRadius: "50%",
              border: "2px solid rgba(88,101,242,0.3)",
              animation: "ripple 2s ease infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: -16,
              borderRadius: "50%",
              border: "2px solid rgba(88,101,242,0.15)",
              animation: "ripple 2s ease infinite 0.5s",
            }}
          />
        </>
      )}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          backgroundColor: "#5865F2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.38,
          fontWeight: 800,
          color: "white",
          boxShadow: "0 8px 32px rgba(88,101,242,0.4)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {initial}
      </div>
    </div>
  );
}

/* ── Call control button ── */
function CallControlButton({
  onClick,
  icon,
  label,
  active,
  danger,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
      }}
    >
      <button
        onClick={onClick}
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          backgroundColor: danger
            ? "#F23F43"
            : active
              ? "rgba(255,255,255,0.2)"
              : "rgba(255,255,255,0.1)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: danger ? "0 4px 16px rgba(242,63,67,0.4)" : "none",
          transition: "transform 0.15s ease, background-color 0.15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {icon}
      </button>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>
        {label}
      </span>
    </div>
  );
}
