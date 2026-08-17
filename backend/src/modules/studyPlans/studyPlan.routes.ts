import { Router } from "express";
import { protect } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { createStudyPlanSchema, updateStudyPlanSchema, updateTaskSchema } from "./studyPlan.validation.js";
import * as studyPlanController from "./studyPlan.controller.js";

const router = Router();

router.use(protect);

router.post("/", validate(createStudyPlanSchema), studyPlanController.createStudyPlan);
router.get("/", studyPlanController.listStudyPlans);
router.get("/:id", studyPlanController.getStudyPlan);
router.patch("/:id", validate(updateStudyPlanSchema), studyPlanController.updateStudyPlan);
router.delete("/:id", studyPlanController.deleteStudyPlan);
router.patch("/:id/tasks/:taskId", validate(updateTaskSchema), studyPlanController.updateTaskStatus);

export default router;