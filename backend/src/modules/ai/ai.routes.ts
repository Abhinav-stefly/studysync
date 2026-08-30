import { Router } from "express";
import { protect } from "../../middleware/auth.js";
import { rateLimiter } from "../../middleware/rateLimiter.js";
import { previewStudyPlan } from "./ai.controller.js";
import { explainResource } from "./ai.controller.js";
const router = Router();

const aiRateLimiter = rateLimiter({
  windowSeconds: 60 * 60, // 1 hour
  maxRequests: 10,
  keyPrefix: "ai-study-plan",
});

router.post("/study-plan/preview", protect, aiRateLimiter, previewStudyPlan);

const explainRateLimiter = rateLimiter({
  windowSeconds: 60 * 60,
  maxRequests: 15,
  keyPrefix: "ai-explain",
});

router.post("/explain", protect, explainRateLimiter, explainResource);
export default router;