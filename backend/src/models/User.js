import mongoose from "mongoose";

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
      enum: ["student", "peer_mentor", "fye_teacher", "admin"],
      default: "student",
    },
    adminId: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
    },
    fullName: { type: String },
    school: { 
      type: String, 
      enum: ["SSE", "SHAS", "SBA"],
      default: null
    },
    major: { type: String, default: null }, // only for students
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

const User = mongoose.model("User", userSchema);

export default User;
