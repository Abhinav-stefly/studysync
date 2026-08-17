import { Router } from "express";
import { protect } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { createNoteSchema, updateNoteSchema } from "./note.validation.js";
import * as noteController from "./note.controller.js";

const router = Router();

router.use(protect);

router.post("/", validate(createNoteSchema), noteController.createNote);
router.get("/", noteController.listNotes);
router.get("/:id", noteController.getNote);
router.patch("/:id", validate(updateNoteSchema), noteController.updateNote);
router.delete("/:id", noteController.deleteNote);

export default router;