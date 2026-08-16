import { Router } from "express";
import { protect } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { createProblemSchema, updateProblemSchema } from "./problem.validation.js";
import * as problemController from "./problem.controller.js";

const router = Router();

router.use(protect); // every route below requires authentication

router.post("/", validate(createProblemSchema), problemController.createProblem);
router.get("/", problemController.listProblems);
router.get("/:id", problemController.getProblem);
router.patch("/:id", validate(updateProblemSchema), problemController.updateProblem);
router.delete("/:id", problemController.deleteProblem);

export default router;