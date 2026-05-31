"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  ShieldAlert,
  Plus,
  Ban,
  CheckCircle,
  LogOut,
  RefreshCw,
  Users,
  ScrollText,
  X,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

interface AdminUser {
  _id: string;
  username: string;
  email: string;
  role: string;
  isDisabled: boolean;
  isOnline: boolean;
  createdAt: string;
}

interface ActivityLog {
  _id: string;
  performedBy: { username: string; email: string; role: string };
  targetUser?: { username: string; email: string };
  action: string;
  meta: Record<string, string>;
  createdAt: string;
}

type Tab = "admins" | "logs";

const ACTION_LABELS: Record<string, string> = {
  admin_created: "Created admin",
  admin_disabled: "Disabled admin",
  admin_enabled: "Enabled admin",
  admin_login: "Logged in",
  admin_logout: "Logged out",
};

const ACTION_COLORS: Record<string, string> = {
  admin_created: "#23A55A",
  admin_disabled: "#F23F43",
  admin_enabled: "#23A55A",
  admin_login: "#5865F2",
  admin_logout: "#949ba4",
};

export default function SuperAdminDashboard() {
  const { signOut, user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("admins");
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Create form
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [adminsRes, logsRes] = await Promise.all([
        api.get<{ admins: AdminUser[] }>("/api/admin/users"),
        api.get<{ logs: ActivityLog[] }>("/api/admin/logs"),
      ]);
      setAdmins(adminsRes.data.admins);
      setLogs(logsRes.data.logs);
    } catch {
      // token invalid — middleware will redirect
    } finally {
      setLoading(false);
    }
  }

  async function handleDisable(id: string) {
    setActionLoading(id + "_disable");
    try {
      await api.patch(`/api/admin/users/${id}/disable`);
      setAdmins((prev) =>
        prev.map((a) => (a._id === id ? { ...a, isDisabled: true } : a)),
      );
      fetchAll(); // refresh logs
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleEnable(id: string) {
    setActionLoading(id + "_enable");
    try {
      await api.patch(`/api/admin/users/${id}/enable`);
      setAdmins((prev) =>
        prev.map((a) => (a._id === id ? { ...a, isDisabled: false } : a)),
      );
      fetchAll();
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    if (!form.username || !form.email || !form.password) {
      setFormError("All fields are required.");
      return;
    }
    setFormLoading(true);
    try {
      const { data } = await api.post<{ user: AdminUser }>(
        "/api/admin/users",
        form,
      );
      setAdmins((prev) => [data.user, ...prev]);
      setShowModal(false);
      setForm({ username: "", email: "", password: "" });
      fetchAll();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      setFormError(msg || "Failed to create admin.");
    } finally {
      setFormLoading(false);
    }
  }

  const labelStyle = {
    fontSize: 11,
    fontWeight: 700 as const,
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    color: "var(--dc-header-secondary)",
    marginBottom: 6,
    display: "block",
  };

  const inputStyle = {
    width: "100%",
    height: 40,
    background: "var(--dc-bg-tertiary)",
    border: "1px solid var(--dc-separator)",
    borderRadius: 8,
    color: "var(--dc-text-normal)",
    fontSize: 14,
    padding: "0 12px",
    outline: "none",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--dc-bg-tertiary)",
        fontFamily: "var(--font-discord)",
      }}
    >
      {/* Top nav */}
      <div
        style={{
          height: 56,
          backgroundColor: "var(--dc-bg-secondary)",
          borderBottom: "1px solid var(--dc-separator)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "#5865F2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShieldAlert size={16} color="white" />
          </div>
          <div>
            <span
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: "var(--dc-header-primary)",
              }}
            >
              Super Admin
            </span>
            <span
              style={{
                fontSize: 12,
                color: "var(--dc-text-muted)",
                marginLeft: 8,
              }}
            >
              @{user?.username}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={fetchAll}
            style={{
              background: "var(--dc-bg-accent)",
              border: "none",
              borderRadius: 6,
              color: "var(--dc-text-normal)",
              cursor: "pointer",
              padding: "6px 10px",
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 13,
            }}
          >
            <RefreshCw size={13} />
            Refresh
          </button>
          <button
            onClick={signOut}
            style={{
              background: "rgba(242,63,67,0.12)",
              border: "1px solid rgba(242,63,67,0.3)",
              borderRadius: 6,
              color: "#F23F43",
              cursor: "pointer",
              padding: "6px 10px",
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 13,
            }}
          >
            <LogOut size={13} />
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
            marginBottom: 28,
          }}
        >
          {[
            { label: "Total Admins", value: admins.length, color: "#5865F2" },
            {
              label: "Active",
              value: admins.filter((a) => !a.isDisabled).length,
              color: "#23A55A",
            },
            {
              label: "Disabled",
              value: admins.filter((a) => a.isDisabled).length,
              color: "#F23F43",
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "var(--dc-bg-secondary)",
                borderRadius: 10,
                border: "1px solid var(--dc-separator)",
                padding: "16px 20px",
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>
                {s.value}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--dc-text-muted)",
                  marginTop: 2,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
          {(["admins", "logs"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "7px 16px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                background:
                  tab === t ? "var(--dc-brand)" : "var(--dc-bg-secondary)",
                color: tab === t ? "white" : "var(--dc-text-muted)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {t === "admins" ? <Users size={13} /> : <ScrollText size={13} />}
              {t === "admins" ? "Admins" : "Activity Logs"}
            </button>
          ))}
          {tab === "admins" && (
            <button
              onClick={() => setShowModal(true)}
              style={{
                marginLeft: "auto",
                padding: "7px 14px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
                background: "linear-gradient(135deg, #5865F2 0%, #4752C4 100%)",
                color: "white",
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 4px 12px rgba(88,101,242,0.3)",
              }}
            >
              <Plus size={14} />
              Create Admin
            </button>
          )}
        </div>

        {/* Content */}
        <div
          style={{
            background: "var(--dc-bg-secondary)",
            borderRadius: 10,
            border: "1px solid var(--dc-separator)",
            overflow: "hidden",
          }}
        >
          {loading ? (
            <div
              style={{ display: "flex", justifyContent: "center", padding: 48 }}
            >
              <Loader2
                size={24}
                color="#5865F2"
                style={{ animation: "spin 1s linear infinite" }}
              />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : tab === "admins" ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--dc-separator)" }}>
                  {["Username", "Email", "Status", "Created", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 16px",
                          textAlign: "left",
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: "var(--dc-text-muted)",
                        }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr
                    key={admin._id}
                    style={{ borderBottom: "1px solid var(--dc-separator)" }}
                    onMouseEnter={(e) =>
                      ((
                        e.currentTarget as HTMLTableRowElement
                      ).style.backgroundColor = "var(--dc-bg-modifier-hover)")
                    }
                    onMouseLeave={(e) =>
                      ((
                        e.currentTarget as HTMLTableRowElement
                      ).style.backgroundColor = "transparent")
                    }
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            backgroundColor: admin.isDisabled
                              ? "var(--dc-bg-accent)"
                              : "#5865F2",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 700,
                            color: "white",
                          }}
                        >
                          {admin.username.charAt(0).toUpperCase()}
                        </div>
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "var(--dc-text-normal)",
                          }}
                        >
                          {admin.username}
                        </span>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 13,
                        color: "var(--dc-text-muted)",
                      }}
                    >
                      {admin.email}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 4,
                          background: admin.isDisabled
                            ? "rgba(242,63,67,0.12)"
                            : "rgba(35,165,90,0.12)",
                          color: admin.isDisabled ? "#F23F43" : "#23A55A",
                        }}
                      >
                        {admin.isDisabled ? "Disabled" : "Active"}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 12,
                        color: "var(--dc-text-muted)",
                      }}
                    >
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {admin.isDisabled ? (
                        <button
                          onClick={() => handleEnable(admin._id)}
                          disabled={actionLoading === admin._id + "_enable"}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "5px 10px",
                            borderRadius: 5,
                            border: "none",
                            background: "rgba(35,165,90,0.12)",
                            color: "#23A55A",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {actionLoading === admin._id + "_enable" ? (
                            <Loader2
                              size={12}
                              style={{ animation: "spin 1s linear infinite" }}
                            />
                          ) : (
                            <CheckCircle size={12} />
                          )}
                          Enable
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDisable(admin._id)}
                          disabled={actionLoading === admin._id + "_disable"}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "5px 10px",
                            borderRadius: 5,
                            border: "none",
                            background: "rgba(242,63,67,0.08)",
                            color: "#F23F43",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {actionLoading === admin._id + "_disable" ? (
                            <Loader2
                              size={12}
                              style={{ animation: "spin 1s linear infinite" }}
                            />
                          ) : (
                            <Ban size={12} />
                          )}
                          Disable
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {admins.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        padding: 32,
                        textAlign: "center",
                        color: "var(--dc-text-muted)",
                        fontSize: 14,
                      }}
                    >
                      No admins found. Create one to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <div>
              {logs.map((log) => (
                <div
                  key={log._id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--dc-separator)",
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: ACTION_COLORS[log.action] ?? "#949ba4",
                      marginTop: 6,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{ fontSize: 13, color: "var(--dc-text-normal)" }}
                    >
                      <strong style={{ color: ACTION_COLORS[log.action] }}>
                        {ACTION_LABELS[log.action] ?? log.action}
                      </strong>
                      {log.targetUser &&
                        log.targetUser.username !==
                          log.performedBy?.username && (
                          <span style={{ color: "var(--dc-text-muted)" }}>
                            {" "}
                            →{" "}
                            <strong style={{ color: "var(--dc-text-normal)" }}>
                              {log.targetUser.username}
                            </strong>
                          </span>
                        )}
                      <span style={{ color: "var(--dc-text-muted)" }}>
                        {" "}
                        by{" "}
                        <strong style={{ color: "var(--dc-header-secondary)" }}>
                          {log.performedBy?.username}
                        </strong>
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--dc-text-muted)",
                        marginTop: 2,
                      }}
                    >
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <div
                  style={{
                    padding: 32,
                    textAlign: "center",
                    color: "var(--dc-text-muted)",
                    fontSize: 14,
                  }}
                >
                  No activity logs yet.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Admin Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 16,
          }}
        >
          <div
            style={{
              background: "var(--dc-bg-secondary)",
              borderRadius: 12,
              border: "1px solid var(--dc-separator)",
              width: "100%",
              maxWidth: 400,
              overflow: "hidden",
              boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                height: 3,
                background: "linear-gradient(90deg, #5865F2 0%, #EB459E 100%)",
              }}
            />
            <div style={{ padding: "24px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: 800,
                      color: "var(--dc-header-primary)",
                    }}
                  >
                    Create Admin
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--dc-text-muted)",
                      marginTop: 2,
                    }}
                  >
                    New admin account with chat access
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setFormError("");
                    setForm({ username: "", email: "", password: "" });
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--dc-text-muted)",
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={handleCreate}
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                <div>
                  <label style={labelStyle}>Username</label>
                  <input
                    style={inputStyle}
                    placeholder="johndoe"
                    value={form.username}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, username: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input
                    style={inputStyle}
                    type="email"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, email: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      style={{ ...inputStyle, paddingRight: 40 }}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, password: e.target.value }))
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--dc-text-muted)",
                      }}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {formError && (
                  <p style={{ fontSize: 12, color: "#F23F43", margin: 0 }}>
                    {formError}
                  </p>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    justifyContent: "flex-end",
                    marginTop: 4,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setFormError("");
                    }}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 6,
                      border: "none",
                      background: "var(--dc-bg-accent)",
                      color: "var(--dc-text-normal)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    style={{
                      padding: "8px 20px",
                      borderRadius: 6,
                      border: "none",
                      background:
                        "linear-gradient(135deg, #5865F2 0%, #4752C4 100%)",
                      color: "white",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: formLoading ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      boxShadow: "0 4px 12px rgba(88,101,242,0.3)",
                    }}
                  >
                    {formLoading ? (
                      <>
                        <Loader2
                          size={13}
                          style={{ animation: "spin 1s linear infinite" }}
                        />
                        Creating…
                      </>
                    ) : (
                      <>
                        <Plus size={13} />
                        Create
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
