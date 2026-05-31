"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Loader2, UserPlus, Ticket, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { useChatStore } from "@/store/chatStore";
import { InviteCreateResponse } from "@/types";

type ModalState = "form" | "loading" | "code" | "updating";

interface InviteUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialUsername?: string;
  initialCode?: string;
  conversationId?: string; // needed for refresh
}

export function InviteUserModal({
  open,
  onOpenChange,
  initialUsername,
  initialCode,
  conversationId,
}: InviteUserModalProps) {
  const [modalState, setModalState] = useState<ModalState>(initialCode ? "code" : "form");
  const [username, setUsername] = useState(initialUsername ?? "");
  const [inviteCode, setInviteCode] = useState(initialCode ?? "");
  const [activeConversationId, setActiveConversationId] = useState(conversationId ?? "");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setModalState(initialCode ? "code" : "form");
      setUsername(initialUsername ?? "");
      setInviteCode(initialCode ?? "");
      setActiveConversationId(conversationId ?? "");
      setCopied(false);
      setError("");
    }
  }, [open, initialCode, initialUsername, conversationId]);

  function handleClose(value: boolean) {
    if (!value) {
      setTimeout(() => {
        setModalState(initialCode ? "code" : "form");
        setUsername(initialUsername ?? "");
        setInviteCode(initialCode ?? "");
        setCopied(false);
        setError("");
      }, 200);
    }
    onOpenChange(value);
  }

  async function handleSave() {
    if (!username.trim()) return;
    setModalState("loading");
    setError("");
    try {
      const { data } = await api.post<InviteCreateResponse>("/api/invites", {
        guestUsername: username.trim(),
      });
      setInviteCode(data.code);
      setActiveConversationId(data.conversationId);
      // Add new conversation to store
      useChatStore.getState().setConversations([
        ...useChatStore.getState().conversations,
        {
          _id: data.conversationId,
          adminUser: "",
          guestUsername: data.guestUsername,
          status: "active",
          createdAt: new Date().toISOString(),
          unreadCount: 0,
          activeCode: data.code,
        },
      ]);
      setModalState("code");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(msg || "Failed to create invite.");
      setModalState("form");
    }
  }

  async function handleUpdateCode() {
    setModalState("updating");
    setCopied(false);
    setError("");
    try {
      const { data } = await api.put<{ code: string }>(`/api/invites/${activeConversationId}/refresh`);
      setInviteCode(data.code);
      // Update code in store
      useChatStore.getState().updateConversation(activeConversationId, { activeCode: data.code });
      setModalState("code");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(msg || "Failed to refresh code.");
      setModalState("code");
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent style={{ background: "var(--dc-bg-secondary)", border: "1px solid var(--dc-separator)", borderRadius: 12, boxShadow: "0 24px 64px rgba(0,0,0,0.5)", maxWidth: 420, padding: 0, overflow: "hidden", fontFamily: "var(--font-discord)" }}>
        <div style={{ height: 3, background: "linear-gradient(90deg, #5865F2 0%, #EB459E 100%)" }} />
        <div style={{ padding: "24px 24px 28px" }}>
          <DialogHeader style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(88,101,242,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <UserPlus size={18} color="#5865F2" />
              </div>
              <div>
                <DialogTitle style={{ fontSize: 17, fontWeight: 800, color: "var(--dc-header-primary)", letterSpacing: "-0.01em", lineHeight: 1.2 }}>Invite User</DialogTitle>
                <DialogDescription style={{ fontSize: 12, color: "var(--dc-text-muted)", marginTop: 2 }}>Generate an invite code for a specific user.</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* FORM */}
          {modalState === "form" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <Label htmlFor="invite-username" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--dc-header-secondary)" }}>Username</Label>
                <Input id="invite-username" placeholder="e.g. johndoe" value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSave()} autoFocus style={{ background: "var(--dc-bg-tertiary)", border: "1px solid var(--dc-separator)", borderRadius: 8, color: "var(--dc-text-normal)", fontSize: 14, height: 40 }} />
              </div>
              {error && <p style={{ fontSize: 12, color: "var(--dc-status-dnd)", margin: 0 }}>{error}</p>}
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <Button type="button" onClick={() => handleClose(false)} style={{ background: "var(--dc-bg-accent)", color: "var(--dc-text-normal)", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, height: 36, padding: "0 16px", cursor: "pointer" }}>Cancel</Button>
                <Button type="button" onClick={handleSave} disabled={!username.trim()} style={{ background: username.trim() ? "linear-gradient(135deg, #5865F2 0%, #4752C4 100%)" : "var(--dc-bg-accent)", color: username.trim() ? "white" : "var(--dc-interactive-muted)", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 700, height: 36, padding: "0 20px", cursor: username.trim() ? "pointer" : "not-allowed", boxShadow: username.trim() ? "0 4px 16px rgba(88,101,242,0.3)" : "none", transition: "all 0.2s ease" }}>Save</Button>
              </div>
            </div>
          )}

          {/* LOADING / UPDATING */}
          {(modalState === "loading" || modalState === "updating") && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: "24px 0 8px" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(88,101,242,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Loader2 size={24} color="#5865F2" style={{ animation: "spin 1s linear infinite" }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--dc-header-primary)", margin: 0 }}>{modalState === "updating" ? "Updating code…" : "Generating invite…"}</p>
                <p style={{ fontSize: 12, color: "var(--dc-text-muted)", margin: "4px 0 0" }}>{modalState === "updating" ? "Generating a new code for " : "Creating code for "}<strong style={{ color: "var(--dc-text-normal)" }}>{username}</strong></p>
              </div>
            </div>
          )}

          {/* CODE */}
          {modalState === "code" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ background: "var(--dc-bg-tertiary)", borderRadius: 10, padding: "16px 20px", border: "1px solid var(--dc-separator)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <Ticket size={14} color="var(--dc-text-muted)" />
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--dc-text-muted)" }}>Invite Code for <span style={{ color: "var(--dc-brand)" }}>{username}</span></span>
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 16 }}>
                  {inviteCode.split("").map((char, i) => (
                    <div key={i} style={{ width: 44, height: 52, borderRadius: 8, background: "var(--dc-bg-secondary)", border: "1px solid var(--dc-separator)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "var(--dc-header-primary)", fontFamily: "var(--font-mono, monospace)", animation: `slideUp 0.3s ease-out ${i * 0.05}s both` }}>{char}</div>
                  ))}
                  <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
                </div>
                <button onClick={handleCopy} style={{ width: "100%", height: 38, borderRadius: 7, border: `1px solid ${copied ? "#23A55A" : "var(--dc-separator)"}`, background: copied ? "rgba(35,165,90,0.12)" : "var(--dc-bg-accent)", color: copied ? "#23A55A" : "var(--dc-text-normal)", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.2s ease" }}>
                  {copied ? <><Check size={14} />Copied!</> : <><Copy size={14} />Copy Code</>}
                </button>
                <div style={{ height: 1, background: "var(--dc-separator)", margin: "10px 0" }} />
                <button onClick={handleUpdateCode} style={{ width: "100%", height: 38, borderRadius: 7, border: "1px solid var(--dc-separator)", background: "transparent", color: "var(--dc-text-muted)", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.2s ease" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(88,101,242,0.08)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#5865F2"; (e.currentTarget as HTMLButtonElement).style.color = "#5865F2"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--dc-separator)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--dc-text-muted)"; }}>
                  <RefreshCw size={14} />Update Code
                </button>
              </div>
              {error && <p style={{ fontSize: 12, color: "var(--dc-status-dnd)", margin: 0 }}>{error}</p>}
              <p style={{ fontSize: 12, color: "var(--dc-text-muted)", margin: 0 }}>Share this code with <strong style={{ color: "var(--dc-text-normal)" }}>{username}</strong> so they can join. This code can only be used once.</p>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button onClick={() => handleClose(false)} style={{ background: "linear-gradient(135deg, #5865F2 0%, #4752C4 100%)", color: "white", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 700, height: 36, padding: "0 20px", cursor: "pointer", boxShadow: "0 4px 16px rgba(88,101,242,0.3)" }}>Done</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
