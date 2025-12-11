import mongoose from "mongoose";
import { ALL_MAJORS } from "../constants/majors.js";

// Major alias mapping - maps common aliases to full enum values
const MAJOR_ALIASES = {
  // Computer Science aliases
  "Computer Science": "Computer Science (BSCS / BSCSC)", // Default to undergraduate
  "CS": "Computer Science (BSCS / BSCSC)",
  "Computer Science Undergraduate": "Computer Science (BSCS / BSCSC)",
  "Computer Science Graduate": "Computer Science (MSc)",
  
  // Business Administration aliases
  "Business Administration": "Bachelor of Business Administration (BBA) - Management", // Default to Management
  "BBA": "Bachelor of Business Administration (BBA) - Management",
  "Business Admin": "Bachelor of Business Administration (BBA) - Management",
  "MBA": "Master of Business Administration (MBA)",
  "Master of Business Administration": "Master of Business Administration (MBA)",
  
  // Engineering aliases
  "Engineering": "General Engineering (BSGE)",
  "General Engineering": "General Engineering (BSGE)",
  
  // International Studies aliases
  "International Studies": "International Studies (B.A.)",
  "IS": "International Studies (B.A.)",
  
  // Communication Studies aliases
  "Communication Studies": "Communication Studies (B.A.)",
  "Communication": "Communication Studies (B.A.)",
  
  // Psychology aliases
  "Psychology": "Psychology (B.A.)",
  
  // Human Resource Development aliases
  "Human Resource Development": "Human Resource Development (B.Sc.)",
  "HRD": "Human Resource Development (B.Sc.)",
  "Human Resources": "Human Resource Development (B.Sc.)",
};

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    confirmationCode: { type: String, default: null },
    isConfirmed: { type: Boolean, default: false },
    loginCode: { type: String, default: null },
    loginCodeExpires: { type: Date, default: null },
    role: {
      type: String,
      enum: ["student", "peer_mentor", "fye_teacher", "advisor", "admin"],
      default: "student",
    },
    adminId: {
      type: String,
      unique: true,
      sparse: true,
      // No default - only set for admin users
    },
    fullName: { type: String },
    school: { 
      type: String, 
      enum: ["SSE", "SHAS", "SBA"],
      default: null
    },
    major: { 
      type: String, 
      enum: [...ALL_MAJORS, ...Object.keys(MAJOR_ALIASES)],
      default: null 
    }, // only for students
    classification: { 
      type: String, 
      enum: ["Freshman", "Sophomore", "Junior", "Senior"],
      default: null 
    }, // only for students
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    advisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

// Pre-save hook to normalize major aliases to full enum values
userSchema.pre("save", function (next) {
  if (this.major && MAJOR_ALIASES[this.major]) {
    this.major = MAJOR_ALIASES[this.major];
  }
  next();
});

// Pre-update hook for findOneAndUpdate, updateOne, etc.
userSchema.pre(["findOneAndUpdate", "updateOne", "updateMany"], function (next) {
  const update = this.getUpdate();
  if (update && update.major && MAJOR_ALIASES[update.major]) {
    update.major = MAJOR_ALIASES[update.major];
  }
  // Handle $set operator
  if (update && update.$set && update.$set.major && MAJOR_ALIASES[update.$set.major]) {
    update.$set.major = MAJOR_ALIASES[update.$set.major];
  }
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
