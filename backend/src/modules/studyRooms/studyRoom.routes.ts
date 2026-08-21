// studyRoom.routes.ts
import { Router } from "express";
import { protect } from "../../middleware/auth.js";
import { getMessages } from "./studyRoom.controller.js";

const router = Router();
router.use(protect);
router.get("/:id/messages", getMessages);

export default router;