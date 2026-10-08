import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;
let currentToken: string | null = null;

export const connectSocket = (token: string): Socket => {
  if (socket && socket.connected && currentToken === token) {
    return socket;
  }

  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  currentToken = token;

  socket = io(import.meta.env.VITE_SOCKET_URL, {
    transports: ["websocket", "polling"],
    auth: { token },
    query: { token },
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1500,
    timeout: 10000,
    autoConnect: true,
  });

  socket.on("connect", () => console.log("[socket] connected", socket?.id));
  socket.on("disconnect", (r) => console.log("[socket] disconnected", r));
  socket.on("connect_error", (e) =>
    console.warn("[socket] connect_error", e.message)
  );

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }
  socket = null;
  currentToken = null;
};