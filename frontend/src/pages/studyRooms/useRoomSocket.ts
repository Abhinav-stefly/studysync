import { useEffect, useRef, useState, useCallback } from "react";
import { io, type Socket } from "socket.io-client";
import { getAccessToken } from "../../api/axiosClient";
import type { RoomMessage } from "../../api/studyRooms.api";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const useRoomSocket = (roomId: string, initialMessages: RoomMessage[]) => {
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<RoomMessage[]>(initialMessages);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const [activeUserIds, setActiveUserIds] = useState<Set<string>>(new Set());
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    // Keep the message list in sync if history finishes loading AFTER
    // this effect already ran (e.g. REST fetch resolves slightly later
    // than the socket connecting) — without this, early-arriving live
    // messages could get silently overwritten once history lands.
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setConnectionError("Not authenticated");
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("room:join", roomId);
    });

    socket.on("message:new", (message: RoomMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("activity:userOnline", ({ userId }: { userId: string }) => {
      setOnlineUserIds((prev) => new Set(prev).add(userId));
    });

    socket.on("activity:userOffline", ({ userId }: { userId: string }) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    socket.on("activity:memberStarted", ({ userId }: { userId: string }) => {
      setActiveUserIds((prev) => new Set(prev).add(userId));
    });

    socket.on("activity:memberStopped", ({ userId }: { userId: string }) => {
      setActiveUserIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    socket.on("error", ({ message }: { message: string }) => {
      setConnectionError(message);
    });

    socket.on("connect_error", (err) => {
      setConnectionError(err.message);
    });

    // Cleanup: runs when roomId changes OR the component unmounts.
    // Explicitly leaving the room before disconnecting is technically
    // redundant (disconnect implies leaving every room server-side),
    // but it's honest about intent and matches the server's room:leave
    // handler which broadcasts activity:userOffline — disconnect alone
    // triggers Socket.IO's own 'disconnecting' event, not this handler.
    return () => {
      socket.emit("room:leave", roomId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId]);

  const sendMessage = useCallback((content: string) => {
    socketRef.current?.emit("message:send", { roomId, content });
  }, [roomId]);

  const startActivity = useCallback(() => {
    socketRef.current?.emit("activity:start", roomId);
  }, [roomId]);

  const stopActivity = useCallback(() => {
    socketRef.current?.emit("activity:stop", roomId);
  }, [roomId]);

  return { messages, onlineUserIds, activeUserIds, connectionError, sendMessage, startActivity, stopActivity };
};