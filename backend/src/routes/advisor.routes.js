import express from "express";
import { getAssignedStudents } from "../controllers/admin.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

// Get students assigned to the current advisor
router.get(
  "/assigned-students",
  protect,
  authorizeRoles("advisor"),
  getAssignedStudents
);

export default router;

