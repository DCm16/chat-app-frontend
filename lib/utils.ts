import { UserStatus } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStatusColor(status: UserStatus): string {
  switch (status) {
    case "online":
      return "#23A55A";
    case "idle":
      return "#F0B232";
    case "dnd":
      return "#F23F43";
    case "streaming":
      return "#593695";
    case "offline":
      return "#80848E";
    default:
      return "#80848E";
  }
}

export function getStatusLabel(status: UserStatus): string {
  switch (status) {
    case "online":
      return "Online";
    case "idle":
      return "Idle";
    case "dnd":
      return "Do Not Disturb";
    case "streaming":
      return "Streaming";
    case "offline":
      return "Offline";
    default:
      return "Offline";
  }
}
