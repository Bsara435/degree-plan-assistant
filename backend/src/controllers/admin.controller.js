import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { sendConfirmationEmail } from "../utils/emailService.js";

const baseStudentSelect =
  "fullName email role mentor advisor school major classification createdAt updatedAt";

export const adminLoginStep1 = async (req, res) => {
  try {
    const { adminId, password } = req.body;

    if (!adminId || !password) {
      return res
        .status(400)
        .json({ message: "Please provide both admin ID and password." });
    }

    const adminUser = await User.findOne({ adminId, role: "admin" }).select("+password");

    if (!adminUser) {
      // Check if any admin exists for better error message
      const anyAdmin = await User.findOne({ role: "admin" });
      if (!anyAdmin) {
        return res.status(401).json({ 
          message: "No admin user found. Please create an admin user first using POST /api/admin/create",
          hint: "Admin user does not exist. Create one first."
        });
      }
      return res.status(401).json({ 
        message: "Invalid admin ID or password.",
        hint: process.env.NODE_ENV === "development" ? `No admin found with adminId: "${adminId}"` : undefined
      });
    }

    const isPasswordValid = await bcrypt.compare(password, adminUser.password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: "Invalid admin ID or password.",
        hint: process.env.NODE_ENV === "development" ? "Password does not match" : undefined
      });
    }

    const loginCode = Math.floor(100000 + Math.random() * 900000).toString();
    const loginCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    adminUser.loginCode = loginCode;
    adminUser.loginCodeExpires = loginCodeExpires;
    await adminUser.save();

    try {
      await sendConfirmationEmail(adminUser.email, loginCode);
      console.log(`Admin login code sent to ${adminUser.email} (code: ${loginCode})`);
    } catch (emailError) {
      console.warn(
        `Admin login code email failed to send. Code: ${loginCode}. Error: ${emailError?.message}`
      );
    }

    return res.status(200).json({
      success: true,
      message: "Verification code sent to admin email.",
      userId: adminUser._id,
      email: adminUser.email,
      ...(process.env.NODE_ENV === "development"
        ? { loginCode, devNote: "Code included in response for development mode." }
        : {}),
    });
  } catch (error) {
    console.error("Admin login error:", error.message);
    res.status(500).json({ message: "Server error during admin login verification." });
  }
};

export const adminLoginStep2 = async (req, res) => {
  try {
    const { userId, loginCode, code } = req.body;
    const verificationCode = loginCode || code;

    if (!userId || !verificationCode) {
      return res
        .status(400)
        .json({ message: "Please provide both userId and verification code." });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId." });
    }

    const adminUser = await User.findById(userId);

    if (!adminUser || adminUser.role !== "admin") {
      return res.status(401).json({ message: "Admin account not found." });
    }

    if (!adminUser.loginCode) {
      return res.status(400).json({
        message: "No verification code found. Please restart the login process.",
      });
    }

    if (adminUser.loginCodeExpires && new Date() > adminUser.loginCodeExpires) {
      adminUser.loginCode = null;
      adminUser.loginCodeExpires = null;
      await adminUser.save();

      return res.status(400).json({
        message: "Verification code expired. Please restart the login process.",
      });
    }

    if (adminUser.loginCode !== verificationCode) {
      return res.status(401).json({ message: "Invalid verification code." });
    }

    adminUser.loginCode = null;
    adminUser.loginCodeExpires = null;
    await adminUser.save();

    const token = generateToken(adminUser._id);

    return res.status(200).json({
      success: true,
      message: "Admin login successful.",
      token,
      user: {
        id: adminUser._id,
        adminId: adminUser.adminId,
        email: adminUser.email,
        fullName: adminUser.fullName,
        role: adminUser.role,
      },
    });
  } catch (error) {
    console.error("Admin login verification error:", error.message);
    res.status(500).json({ message: "Server error during admin login verification." });
  }
};

export const makeStudentMentor = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid studentId." });
    }

    const student = await User.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    if (student.role !== "student") {
      return res.status(400).json({ message: "Only students can be promoted to mentors." });
    }

    student.role = "peer_mentor";
    await student.save();

    return res.status(200).json({
      success: true,
      message: "Student promoted to mentor successfully.",
      user: {
        id: student._id,
        email: student.email,
        fullName: student.fullName,
        role: student.role,
      },
    });
  } catch (error) {
    console.error("Promote student error:", error.message);
    res.status(500).json({ message: "Server error while promoting student to mentor." });
  }
};

export const assignMentorToStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { mentorId } = req.body;

    if (!mentorId) {
      return res.status(400).json({ message: "Please provide a mentorId." });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid studentId." });
    }

    if (!mongoose.Types.ObjectId.isValid(mentorId)) {
      return res.status(400).json({ message: "Invalid mentorId." });
    }

    const [student, mentor] = await Promise.all([
      User.findById(studentId),
      User.findById(mentorId),
    ]);

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found." });
    }

    if (student.role !== "student") {
      return res.status(400).json({ message: "Mentors can only be assigned to students." });
    }

    if (mentor.role !== "peer_mentor") {
      return res.status(400).json({ message: "Selected user is not a mentor." });
    }

    student.mentor = mentor._id;
    await student.save();

    return res.status(200).json({
      success: true,
      message: "Mentor assigned to student successfully.",
      student: {
        id: student._id,
        fullName: student.fullName,
        email: student.email,
        mentor: student.mentor,
      },
    });
  } catch (error) {
    console.error("Assign mentor error:", error.message);
    res.status(500).json({ message: "Server error while assigning mentor." });
  }
};

export const assignAdvisorToStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { advisorId } = req.body;

    if (!advisorId) {
      return res.status(400).json({ message: "Please provide an advisorId." });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid studentId." });
    }

    if (!mongoose.Types.ObjectId.isValid(advisorId)) {
      return res.status(400).json({ message: "Invalid advisorId." });
    }

    const [student, advisor] = await Promise.all([
      User.findById(studentId),
      User.findById(advisorId),
    ]);

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    if (!advisor) {
      return res.status(404).json({ message: "Advisor not found." });
    }

    if (student.role !== "student") {
      return res.status(400).json({ message: "Advisors can only be assigned to students." });
    }

    if (!["fye_teacher", "peer_mentor", "admin"].includes(advisor.role)) {
      return res.status(400).json({ message: "Selected user cannot be assigned as an advisor." });
    }

    student.advisor = advisor._id;
    await student.save();

    return res.status(200).json({
      success: true,
      message: "Advisor assigned to student successfully.",
      student: {
        id: student._id,
        fullName: student.fullName,
        email: student.email,
        advisor: student.advisor,
      },
    });
  } catch (error) {
    console.error("Assign advisor error:", error.message);
    res.status(500).json({ message: "Server error while assigning advisor." });
  }
};

export const listStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select(baseStudentSelect)
      .populate("mentor", "fullName email role")
      .populate("advisor", "fullName email role")
      .sort({ fullName: 1 });

    res.status(200).json({ success: true, students });
  } catch (error) {
    console.error("List students error:", error.message);
    res.status(500).json({ message: "Server error while fetching students." });
  }
};

export const searchStudents = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide a search query." 
      });
    }

    const searchTerm = query.trim();
    
    // Search by name, email, major, or school
    const students = await User.find({
      role: "student",
      $or: [
        { fullName: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
        { major: { $regex: searchTerm, $options: "i" } },
        { school: { $regex: searchTerm, $options: "i" } },
        { classification: { $regex: searchTerm, $options: "i" } },
      ],
    })
      .select(baseStudentSelect)
      .populate("mentor", "fullName email role")
      .populate("advisor", "fullName email role")
      .sort({ fullName: 1 })
      .limit(50); // Limit results to 50

    res.status(200).json({ 
      success: true, 
      students,
      count: students.length,
      query: searchTerm
    });
  } catch (error) {
    console.error("Search students error:", error.message);
    res.status(500).json({ message: "Server error while searching students." });
  }
};

export const listMentors = async (req, res) => {
  try {
    const mentors = await User.find({ role: "peer_mentor" })
      .select("fullName email role school major")
      .sort({ fullName: 1 });

    res.status(200).json({ success: true, mentors });
  } catch (error) {
    console.error("List mentors error:", error.message);
    res.status(500).json({ message: "Server error while fetching mentors." });
  }
};

export const listAdvisors = async (req, res) => {
  try {
    const advisors = await User.find({ role: { $in: ["fye_teacher", "peer_mentor", "admin"] } })
      .select("fullName email role school")
      .sort({ fullName: 1 });

    res.status(200).json({ success: true, advisors });
  } catch (error) {
    console.error("List advisors error:", error.message);
    res.status(500).json({ message: "Server error while fetching advisors." });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { email, fullName, school } = req.body;
    const adminId = "admin";
    const password = "Test1234";

    // Check if admin with this adminId already exists
    const existingAdmin = await User.findOne({ adminId });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin user with adminId 'admin' already exists.",
      });
    }

    // Check if email is already registered
    if (email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email is already registered.",
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const adminUser = await User.create({
      email: email || `admin@degreeplan.local`,
      password: hashedPassword,
      adminId: adminId,
      role: "admin",
      fullName: fullName || "Admin User",
      school: school || "SSE",
      isConfirmed: true, // Admin can login immediately
    });

    console.log(`✅ Admin user created successfully with adminId: ${adminId}`);

    return res.status(201).json({
      success: true,
      message: "Admin user created successfully.",
      user: {
        id: adminUser._id,
        adminId: adminUser.adminId,
        email: adminUser.email,
        fullName: adminUser.fullName,
        role: adminUser.role,
        school: adminUser.school,
      },
      credentials: {
        adminId: adminId,
        password: password,
        note: "Save these credentials securely. Password will not be shown again.",
      },
    });
  } catch (error) {
    console.error("Create admin error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while creating admin user.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

