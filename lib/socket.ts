import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";

let socket: Socket | null = null;

const getSocket = (): Socket => {
  if (socket) return socket;

  socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000", {
    autoConnect: false,
    transports: ["websocket"],
    auth: (cb) => {
      // Use guest token if present, otherwise admin token
      const guestToken = Cookies.get("guest_token");
      const adminToken = Cookies.get("token");
      cb({ token: guestToken || adminToken });
    },
  });

  socket.on("connect", () => {
    console.log("🔌 connected:", socket?.id);
  });

  socket.on("connect_error", (err) => {
    console.error("❌ connect_error:", err.message);
  });

  return socket;
};

export const resetSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default getSocket;
