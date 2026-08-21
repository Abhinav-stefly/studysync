import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { verifyAccessToken } from "../modules/auth/token.utils.js";
import { isRoomMember, createMessage } from "../modules/studyRooms/studyRoom.service.js";

interface SocketUser {
  userId: string;
  role: string;
}

declare module "socket.io" {
  interface Socket {
    user?: SocketUser;
  }
}

export const initSocketServer = (httpServer: HTTPServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required"));

    try {
      const decoded = verifyAccessToken(token);
      socket.user = { userId: decoded.userId, role: decoded.role };
      next();
    } catch (error) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user!.userId;
    console.log(`Socket connected: ${socket.id} (user: ${userId})`);

    socket.on("room:join", async (roomId: string) => {
      const isMember = await isRoomMember(roomId, userId);
      if (!isMember) {
        socket.emit("error", { message: "Not a member of this room" });
        return;
      }

      socket.join(roomId);
      socket.to(roomId).emit("activity:userOnline", { userId });
    });

    socket.on("room:leave", (roomId: string) => {
      socket.leave(roomId);
      socket.to(roomId).emit("activity:userOffline", { userId });
    });

    socket.on("message:send", async ({ roomId, content }: { roomId: string; content: string }) => {
      const isMember = await isRoomMember(roomId, userId);
      if (!isMember) {
        socket.emit("error", { message: "Not a member of this room" });
        return;
      }

      if (!content || content.trim().length === 0) {
        socket.emit("error", { message: "Message content required" });
        return;
      }

      const message = await createMessage(roomId, userId, content.trim());
      io.to(roomId).emit("message:new", {
        _id: message._id,
        roomId,
        userId,
        content: message.content,
        createdAt: message.createdAt,
      });
    });

    socket.on("activity:start", (roomId: string) => {
      socket.to(roomId).emit("activity:memberStarted", { userId });
    });

    socket.on("activity:stop", (roomId: string) => {
      socket.to(roomId).emit("activity:memberStopped", { userId });
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id} (user: ${userId})`);
    });
  });

  return io;
};