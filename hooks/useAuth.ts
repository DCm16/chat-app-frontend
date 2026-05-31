"use client";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { AuthResponse } from "@/types";

export const useAuth = () => {
  const { setAuth, logout, user, token, isAdmin, isAuthenticated } =
    useAuthStore();
  const router = useRouter();

  const login = async (email: string, password: string) => {
    const { data } = await api.post<AuthResponse>("/api/auth/login", {
      email,
      password,
    });
    const role = (data.user as { role?: string }).role as
      | "admin"
      | "super-admin"
      | undefined;
    setAuth(data.user, data.token, role ?? "admin");
    if (role === "super-admin") {
      router.push("/super-admin/dashboard");
    } else {
      router.push("/admin/dashboard/chats");
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
  ) => {
    const { data } = await api.post<AuthResponse>("/api/auth/register", {
      username,
      email,
      password,
    });
    const role = (data.user as { role?: string }).role as
      | "admin"
      | "super-admin"
      | undefined;
    setAuth(data.user, data.token, role ?? "admin");
    if (role === "super-admin") {
      router.push("/super-admin/dashboard");
    } else {
      router.push("/admin/dashboard/chats");
    }
  };

  const signOut = () => {
    logout();
    router.push("/admin/login");
  };

  return {
    login,
    register,
    signOut,
    user,
    token,
    isAdmin,
    isAuthenticated,
  };
};
