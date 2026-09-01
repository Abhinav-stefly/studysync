import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { requestLogger } from "./middleware/requestLogger.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { rateLimiter } from "./middleware/rateLimiter.js";
import authRoutes from "./modules/auth/auth.routes.js";
import problemRoutes from "./modules/problems/problem.routes.js";
import noteRoutes from "./modules/notes/note.routes.js";
import studyPlanRoutes from "./modules/studyPlans/studyPlan.routes.js";
import studyRoomRoutes from "./modules/studyRooms/studyRoom.routes.js";
import analyticsRoutes from "./modules/analytics/analytics.routes.js";
import aiRoutes from "./modules/ai/ai.routes.js";
// ...

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "").split(",").map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, curl, server-to-server) —
      // browsers always send an Origin header for cross-origin requests,
      // so this only affects non-browser tools, not real CORS enforcement.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // required: your refresh token is an httpOnly cookie,
                        // and cookies are only sent cross-origin if this is true
                        // on BOTH the server (here) and the client (fetch's credentials: "include")
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

const globalLimiter = rateLimiter({
  windowSeconds: 60,
  maxRequests: 100,
  keyPrefix: "global",
});
app.use(globalLimiter);
app.use(helmet());

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/study-plans", studyPlanRoutes);
app.use("/api/study-rooms", studyRoomRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai", aiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;