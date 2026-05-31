"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useGuestStore } from "@/store/guestStore";
import { GuestJoinResponse } from "@/types";

const CODE_LENGTH = 6;
type State = "idle" | "verifying" | "success" | "error";

export default function InvitePage() {
  const router = useRouter();
  const { setGuest } = useGuestStore();
  const [code, setCode] = useState("");
  const [state, setState] = useState<State>("idle");
  const [shake, setShake] = useState(false);
  const [errorMsg, setErrorMsg] = useState(
    "Invalid invite code. Please try again.",
  );
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (code.length === CODE_LENGTH) handleVerify(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  async function handleVerify(value: string) {
    setState("verifying");
    try {
      const { data } = await api.post<GuestJoinResponse>("/api/guest/join", {
        code: value,
      });
      setGuest(data.token, data.conversationId, data.guestUsername);
      setState("success");
      await new Promise((r) => setTimeout(r, 600));
      router.push(`/chats/${data.conversationId}`);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      setErrorMsg(msg || "Invalid invite code. Please try again.");
      setState("error");
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setState("idle");
        setCode("");
        setTimeout(() => inputRef.current?.focus(), 50);
      }, 1400);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH);
    setCode(val);
    if (state === "error") setState("idle");
  }

  const isVerifying = state === "verifying";
  const isError = state === "error";
  const isSuccess = state === "success";

  const borderColor = isError ? "#F23F43" : isSuccess ? "#23A55A" : "#3f4147";

  const focusBorderColor = isError
    ? "#F23F43"
    : isSuccess
      ? "#23A55A"
      : "#5865F2";

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse at 50% 0%, #23265a 0%, #1e1f22 55%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
          "'gg sans','Noto Sans','Helvetica Neue',Helvetica,Arial,sans-serif",
        padding: "16px",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(88,101,242,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(88,101,242,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: "15%",
          left: "20%",
          width: 340,
          height: 340,
          borderRadius: "50%",
          background: "rgba(88,101,242,0.12)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "fixed",
          bottom: "20%",
          right: "18%",
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: "rgba(235,69,158,0.09)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 440,
          background: "#2b2d31",
          borderRadius: 16,
          border: "1px solid #3f4147",
          boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: 4,
            background: "linear-gradient(90deg,#5865F2 0%,#EB459E 100%)",
          }}
        />

        <div style={{ padding: "40px 32px 36px" }}>
          {/* Logo + heading */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 24,
                background: "#5865F2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                boxShadow: "0 8px 32px rgba(88,101,242,0.4)",
              }}
            >
              <svg width="42" height="42" viewBox="0 0 24 24" fill="white">
                <path d="M19.73 4.87a18.2 18.2 0 0 0-4.6-1.44c-.21.4-.4.8-.58 1.21-1.69-.25-3.35-.25-5.04 0-.18-.41-.37-.82-.59-1.21-1.6.27-3.14.75-4.6 1.44C.75 9.12-.46 13.25.14 17.33a18.33 18.33 0 0 0 5.63 2.87 13.16 13.16 0 0 0 1.06-1.72c-.57-.23-1.14-.5-1.67-.82.14-.1.28-.2.41-.3a12.95 12.95 0 0 0 11.07 0l.42.3c-.53.32-1.1.59-1.68.82.29.63.65 1.21 1.06 1.72a18.18 18.18 0 0 0 5.64-2.87c.7-4.67-.72-8.75-3.05-12.46zM8.02 14.91c-1.08 0-1.96-1.01-1.96-2.26S6.93 10.4 8.02 10.4c1.1 0 1.98 1.01 1.96 2.25 0 1.25-.87 2.26-1.96 2.26zm7.96 0c-1.08 0-1.96-1.01-1.96-2.26s.87-2.25 1.96-2.25c1.1 0 1.97 1.01 1.96 2.25 0 1.25-.86 2.26-1.96 2.26z" />
              </svg>
            </div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "#f2f3f5",
                marginBottom: 8,
                letterSpacing: "-0.02em",
              }}
            >
              Enter your invite code
            </h1>
            <p style={{ fontSize: 14, color: "#949ba4", lineHeight: 1.5 }}>
              You need an invite code to access this server.
              <br />
              Ask your admin for the 6-digit code.
            </p>
          </div>

          {/* Input */}
          <div
            style={{
              marginBottom: 16,
              animation: shake
                ? "shake 0.45s cubic-bezier(.36,.07,.19,.97) both"
                : "none",
            }}
          >
            <style>{`
              @keyframes shake {
                10%,90%{transform:translate3d(-3px,0,0)}
                20%,80%{transform:translate3d(5px,0,0)}
                30%,50%,70%{transform:translate3d(-6px,0,0)}
                40%,60%{transform:translate3d(6px,0,0)}
              }
              @keyframes spin { to { transform: rotate(360deg); } }
              .code-input:focus {
                outline: none;
                border-color: ${focusBorderColor} !important;
                box-shadow: 0 0 0 3px ${isError ? "rgba(242,63,67,0.15)" : isSuccess ? "rgba(35,165,90,0.15)" : "rgba(88,101,242,0.2)"};
              }
            `}</style>
            <input
              ref={inputRef}
              className="code-input"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              placeholder="000000"
              value={code}
              onChange={handleChange}
              disabled={isVerifying || isSuccess}
              maxLength={CODE_LENGTH}
              style={{
                width: "100%",
                height: 64,
                background: "#1e1f22",
                border: `2px solid ${borderColor}`,
                borderRadius: 10,
                color: isError ? "#F23F43" : isSuccess ? "#23A55A" : "#f2f3f5",
                fontSize: 32,
                fontWeight: 800,
                textAlign: "center",
                letterSpacing: "0.4em",
                paddingLeft: "0.4em", // compensate for letter-spacing on last char
                transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                fontFamily: "monospace",
              }}
            />
          </div>

          {/* Character count indicator */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 6,
              marginBottom: 20,
            }}
          >
            {Array.from({ length: CODE_LENGTH }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor:
                    i < code.length
                      ? isError
                        ? "#F23F43"
                        : isSuccess
                          ? "#23A55A"
                          : "#5865F2"
                      : "#3f4147",
                  transition: "background-color 0.15s ease",
                }}
              />
            ))}
          </div>

          {/* Status message */}
          <div style={{ minHeight: 20, textAlign: "center", marginBottom: 24 }}>
            {isVerifying && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  color: "#949ba4",
                  fontSize: 13,
                }}
              >
                <Loader2
                  size={14}
                  style={{ animation: "spin 1s linear infinite" }}
                />
                Verifying code…
              </div>
            )}
            {isError && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  color: "#F23F43",
                  fontSize: 13,
                }}
              >
                <AlertCircle size={14} />
                {errorMsg}
              </div>
            )}
            {isSuccess && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  color: "#23A55A",
                  fontSize: 13,
                }}
              >
                <ShieldCheck size={14} />
                Code verified! Redirecting…
              </div>
            )}
            {state === "idle" && code.length === 0 && (
              <p style={{ fontSize: 12, color: "#5c5f66" }}>
                Enter the 6-digit numeric code from your admin
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={() => code.length === CODE_LENGTH && handleVerify(code)}
            disabled={code.length !== CODE_LENGTH || isVerifying || isSuccess}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 8,
              border: "none",
              fontSize: 15,
              fontWeight: 700,
              cursor:
                code.length === CODE_LENGTH && !isVerifying && !isSuccess
                  ? "pointer"
                  : "not-allowed",
              background: isSuccess
                ? "#23A55A"
                : code.length === CODE_LENGTH && !isVerifying
                  ? "linear-gradient(135deg,#5865F2 0%,#4752C4 100%)"
                  : "#3a3d44",
              color: code.length === CODE_LENGTH ? "white" : "#5c5f66",
              transition: "all 0.2s ease",
              boxShadow:
                code.length === CODE_LENGTH && !isVerifying && !isSuccess
                  ? "0 4px 20px rgba(88,101,242,0.35)"
                  : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {isVerifying ? (
              <>
                <Loader2
                  size={16}
                  style={{ animation: "spin 1s linear infinite" }}
                />
                Verifying…
              </>
            ) : isSuccess ? (
              <>
                <ShieldCheck size={16} />
                Joining…
              </>
            ) : (
              "Join Server"
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
