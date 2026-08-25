import { Router } from "express";
import { protect } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AuthenticatedRequest } from "../../middleware/auth.js";
import { Response } from "express";
import { reportQueue } from "../../jobs/reportQueue.js";

const router = Router();
router.use(protect);

router.post(
  "/reports/generate",
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const job = await reportQueue.add("generate-report", { userId: req.user!.userId });
    res.status(202).json({ success: true, message: "Report generation started", jobId: job.id });
  })
);

export default router;