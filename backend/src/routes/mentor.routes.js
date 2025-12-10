import express from "express";
import { getMentorAssignedStudents } from "../controllers/admin.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

// Get students assigned to the current mentor
router.get(
  "/assigned-students",
  protect,
  authorizeRoles("peer_mentor"),
  getMentorAssignedStudents
);

export default router;

