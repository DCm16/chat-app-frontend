import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";
import { User } from "@/types";

export type UserRole = "admin" | "super-admin";

interface AuthState {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  role: UserRole | null;
  isSuperAdmin: boolean;
  setAuth: (user: User, token: string, role: UserRole) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAdmin: false,
      role: null,
      isSuperAdmin: false,
      setAuth: (user, token) => {
        Cookies.set("token", token, { expires: 7 });
        // Store role in a separate cookie for middleware access
        Cookies.set(
          "role",
          (user as User & { role?: string }).role ?? "admin",
          { expires: 7 },
        );
        set({
          user,
          token,
          isAdmin: true,
          isSuperAdmin:
            (user as User & { role?: string }).role === "super-admin",
        });
      },
      logout: () => {
        Cookies.remove("token");
        Cookies.remove("role");
        set({ user: null, token: null, isAdmin: false, isSuperAdmin: false });
      },
      isAuthenticated: () => !!get().token,
    }),
    {
      name: "auth-storage",
      partialize: (s) => ({
        user: s.user,
        token: s.token,
        isAdmin: s.isAdmin,
        isSuperAdmin: s.isSuperAdmin,
      }),
    },
  ),
);
