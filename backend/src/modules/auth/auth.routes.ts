import { Router } from "express";
import { register, login, logout } from "./auth.controller.js";
import { validate } from "../../middleware/validate.js";
import { registerSchema, loginSchema } from "./auth.validation.js";
import { protect } from "../../middleware/auth.js";
import { authorize } from "../../middleware/authorize.js";

const router = Router();


router.get("/admin-only", protect, authorize("ADMIN"), (req, res) => {
  res.json({ success: true, message: "Welcome, admin." });
});
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);

export default router;