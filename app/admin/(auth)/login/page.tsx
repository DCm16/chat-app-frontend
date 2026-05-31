"use client";

import { useState } from "react";
import { Loader2, ShieldAlert, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card, CardContent, CardDescription,
  CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

type State = "idle" | "loading" | "error" | "success";

export default function AdminLoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const isLoading = state === "loading";
  const isError = state === "error";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email || !password) {
      setState("error");
      setErrorMsg("Please fill in all fields.");
      return;
    }
    setState("loading");
    setErrorMsg("");
    try {
      await login(email, password);
      setState("success");
    } catch (err: unknown) {
      setState("error");
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setErrorMsg(msg || "Invalid email or password.");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse at 50% 0%, #23265a 0%, var(--dc-bg-tertiary) 60%)",
        fontFamily: "var(--font-discord)",
        padding: "16px",
      }}
    >
      <div aria-hidden style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(88,101,242,0.04) 1px, transparent 1px),linear-gradient(90deg, rgba(88,101,242,0.04) 1px, transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none" }} />
      <div aria-hidden style={{ position: "fixed", top: "10%", left: "50%", transform: "translateX(-50%)", width: 480, height: 240, borderRadius: "50%", background: "rgba(88,101,242,0.1)", filter: "blur(80px)", pointerEvents: "none" }} />

      <div style={{ position: "relative", width: "100%", maxWidth: 400 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--dc-brand)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 32px rgba(88,101,242,0.45)" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M19.73 4.87a18.2 18.2 0 0 0-4.6-1.44c-.21.4-.4.8-.58 1.21-1.69-.25-3.35-.25-5.04 0-.18-.41-.37-.82-.59-1.21-1.6.27-3.14.75-4.6 1.44C.75 9.12-.46 13.25.14 17.33a18.33 18.33 0 0 0 5.63 2.87 13.16 13.16 0 0 0 1.06-1.72c-.57-.23-1.14-.5-1.67-.82.14-.1.28-.2.41-.3a12.95 12.95 0 0 0 11.07 0l.42.3c-.53.32-1.1.59-1.68.82.29.63.65 1.21 1.06 1.72a18.18 18.18 0 0 0 5.64-2.87c.7-4.67-.72-8.75-3.05-12.46zM8.02 14.91c-1.08 0-1.96-1.01-1.96-2.26S6.93 10.4 8.02 10.4c1.1 0 1.98 1.01 1.96 2.25 0 1.25-.87 2.26-1.96 2.26zm7.96 0c-1.08 0-1.96-1.01-1.96-2.26s.87-2.25 1.96-2.25c1.1 0 1.97 1.01 1.96 2.25 0 1.25-.86 2.26-1.96 2.26z" /></svg>
          </div>
        </div>

        <Card style={{ background: "var(--dc-bg-secondary)", border: "1px solid var(--dc-separator)", borderRadius: 16, boxShadow: "0 24px 64px rgba(0,0,0,0.5)", overflow: "hidden" }}>
          <div style={{ height: 3, background: "linear-gradient(90deg, #5865F2 0%, #EB459E 100%)" }} />
          <CardHeader style={{ padding: "28px 28px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <ShieldAlert size={15} color="var(--dc-text-muted)" />
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--dc-text-muted)" }}>Admin Portal</span>
            </div>
            <CardTitle style={{ fontSize: 22, fontWeight: 800, color: "var(--dc-header-primary)", letterSpacing: "-0.02em" }}>Welcome back</CardTitle>
            <CardDescription style={{ color: "var(--dc-text-muted)", fontSize: 13 }}>Sign in to access the admin dashboard.</CardDescription>
          </CardHeader>

          <CardContent style={{ padding: "24px 28px" }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <Label htmlFor="email" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--dc-header-secondary)" }}>Email address</Label>
                <Input id="email" type="email" placeholder="admin@example.com" value={email} onChange={(e) => { setEmail(e.target.value); if (isError) setState("idle"); }} disabled={isLoading} autoComplete="email" style={{ background: "var(--dc-bg-tertiary)", border: `1px solid ${isError ? "var(--dc-status-dnd)" : "var(--dc-separator)"}`, borderRadius: 8, color: "var(--dc-text-normal)", fontSize: 14, height: 42 }} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <Label htmlFor="password" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--dc-header-secondary)" }}>Password</Label>
                <div style={{ position: "relative" }}>
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => { setPassword(e.target.value); if (isError) setState("idle"); }} disabled={isLoading} autoComplete="current-password" style={{ background: "var(--dc-bg-tertiary)", border: `1px solid ${isError ? "var(--dc-status-dnd)" : "var(--dc-separator)"}`, borderRadius: 8, color: "var(--dc-text-normal)", fontSize: 14, height: 42, paddingRight: 40 }} />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--dc-text-muted)", display: "flex", alignItems: "center", padding: 0 }} tabIndex={-1}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {isError && errorMsg && (
                <p style={{ fontSize: 13, color: "var(--dc-status-dnd)", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                  <ShieldAlert size={13} />{errorMsg}
                </p>
              )}

              <Button type="submit" disabled={isLoading} style={{ width: "100%", height: 42, borderRadius: 8, border: "none", fontSize: 14, fontWeight: 700, cursor: isLoading ? "not-allowed" : "pointer", background: isLoading ? "var(--dc-bg-accent)" : "linear-gradient(135deg, #5865F2 0%, #4752C4 100%)", color: "white", boxShadow: isLoading ? "none" : "0 4px 20px rgba(88,101,242,0.35)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 }}>
                {isLoading ? (<><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />Signing in…<style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></>) : "Sign in"}
              </Button>
            </form>
          </CardContent>

          <CardFooter style={{ padding: "0 28px 24px", display: "flex", justifyContent: "center" }}>
            <p style={{ fontSize: 12, color: "var(--dc-interactive-muted)", margin: 0 }}>
              Use your registered admin account to sign in.
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
