"use client";

import { User } from "@/types";
import { StatusIndicator } from "./StatusIndicator";

interface AvatarProps {
  user: User;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showStatus?: boolean;
  className?: string;
}

const AVATAR_SIZES = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 80,
};

const STATUS_SIZES = {
  xs: "sm" as const,
  sm: "sm" as const,
  md: "sm" as const,
  lg: "md" as const,
  xl: "lg" as const,
};

const FONT_SIZES = {
  xs: "10px",
  sm: "13px",
  md: "15px",
  lg: "18px",
  xl: "30px",
};

export function Avatar({
  user,
  size = "md",
  showStatus = true,
  className = "",
}: AvatarProps) {
  const avatarSize = AVATAR_SIZES[size];
  const statusSize = STATUS_SIZES[size];
  const fontSize = FONT_SIZES[size];

  const statusOffset = size === "xl" ? -2 : size === "lg" ? -1 : 0;

  return (
    <div
      className={`relative flex-shrink-0 ${className}`}
      style={{ width: avatarSize, height: avatarSize }}
    >
      <div
        style={{
          width: avatarSize,
          height: avatarSize,
          borderRadius: "50%",
          // backgroundColor: user.avatarColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize,
          fontWeight: 600,
          color: "white",
          userSelect: "none",
          overflow: "hidden",
        }}
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.username}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          user.username[0]
        )}
      </div>

      {showStatus && (
        <div
          style={{
            position: "absolute",
            bottom: statusOffset,
            right: statusOffset,
          }}
        >
          <StatusIndicator
            status={user.isOnline ? "online" : "offline"}
            size={statusSize}
          />
        </div>
      )}
    </div>
  );
}
