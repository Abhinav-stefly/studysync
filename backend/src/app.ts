import express from "express";
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

app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

const globalLimiter = rateLimiter({
  windowSeconds: 60,
  maxRequests: 100,
  keyPrefix: "global",
});
app.use(globalLimiter);

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