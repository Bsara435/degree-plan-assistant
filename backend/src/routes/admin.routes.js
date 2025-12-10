import express from "express";
import {
  adminLoginStep1,
  adminLoginStep2,
  makeStudentMentor,
  assignMentorToStudent,
  assignAdvisorToStudent,
  listStudents,
  searchStudents,
  listMentors,
  listAdvisors,
  createAdmin,
} from "../controllers/admin.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

// Create admin user (no authentication required for initial setup)
router.post("/create", createAdmin);

// Admin login routes
router.post("/login/step1", adminLoginStep1);
router.post("/login/verify", adminLoginStep2);

router.get(
  "/students",
  protect,
  authorizeRoles("admin"),
  listStudents
);

router.get(
  "/students/search",
  protect,
  authorizeRoles("admin"),
  searchStudents
);

router.get(
  "/mentors",
  protect,
  authorizeRoles("admin"),
  listMentors
);

router.get(
  "/advisors",
  protect,
  authorizeRoles("admin"),
  listAdvisors
);

router.post(
  "/students/:studentId/make-mentor",
  protect,
  authorizeRoles("admin"),
  makeStudentMentor
);

router.post(
  "/students/:studentId/assign-mentor",
  protect,
  authorizeRoles("admin"),
  assignMentorToStudent
);

router.post(
  "/students/:studentId/assign-advisor",
  protect,
  authorizeRoles("admin"),
  assignAdvisorToStudent
);

export default router;

