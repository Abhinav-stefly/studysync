import { Router } from "express";
import { register, login, logout } from "./auth.controller.js";
import { validate } from "../../middleware/validate.js";
import { registerSchema, loginSchema } from "./auth.validation.js";
import { protect } from "../../middleware/auth.js";
import { authorize } from "../../middleware/authorize.js";
import {rateLimiter} from "../../middleware/rateLimiter.js";

/*
const loginLimiter = rateLimiter({
  windowSeconds: 60,
  maxRequests: 5,
  keyPrefix: "login",
});
*/
const router = Router();


router.get("/admin-only", protect, authorize("ADMIN"), (req, res) => {
  res.json({ success: true, message: "Welcome, admin." });
});
//router.post("/login", loginLimiter, validate(loginSchema), login);
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);

export default router;