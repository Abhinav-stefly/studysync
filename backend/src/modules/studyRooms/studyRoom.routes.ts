import { Router } from "express";
import { protect } from "../../middleware/auth.js";
import { getMessages, createRoom, listRooms, joinRoom } from "./studyRoom.controller.js";

const router = Router();
router.use(protect);

router.post("/", createRoom);
router.get("/", listRooms);
router.post("/:id/join", joinRoom);
router.get("/:id/messages", getMessages);

export default router;