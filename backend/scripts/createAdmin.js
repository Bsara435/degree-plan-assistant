import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";
import User from "../src/models/User.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parseArgs = () => {
  return process.argv.slice(2).reduce((acc, arg) => {
    if (!arg.startsWith("--")) return acc;
    const [key, value] = arg.replace(/^--/, "").split("=");
    if (key && value) {
      acc[key] = value;
    }
    return acc;
  }, {});
};

const args = parseArgs();

const adminId = args.adminId || process.env.ADMIN_ID;
const email = args.email || process.env.ADMIN_EMAIL;
const password = args.password || process.env.ADMIN_PASSWORD;
const fullName = args.fullName || process.env.ADMIN_FULL_NAME || "System Administrator";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not defined. Please add it to your environment variables.");
  process.exit(1);
}

if (!adminId || !email || !password) {
  console.error(
    "❌ Missing required fields. Provide adminId, email, and password via environment variables or CLI arguments."
  );
  console.info("Example:");
  console.info(
    "  node scripts/createAdmin.js --adminId=admin001 --email=admin@example.com --password=StrongPass123 --fullName=\"Admin User\""
  );
  process.exit(1);
}

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: process.env.MONGO_DB_NAME || "degree-plan-assistant",
    });
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }
};

const createOrUpdateAdmin = async () => {
  try {
    await connectDB();

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingAdmin = await User.findOne({ adminId });

    if (existingAdmin) {
      existingAdmin.email = email;
      existingAdmin.fullName = fullName;
      existingAdmin.password = hashedPassword;
      existingAdmin.role = "admin";
      existingAdmin.isConfirmed = true;
      await existingAdmin.save();

      console.log(`✅ Admin account updated successfully (adminId: ${adminId}).`);
    } else {
      await User.create({
        adminId,
        email,
        fullName,
        password: hashedPassword,
        role: "admin",
        isConfirmed: true,
      });
      console.log(`✅ Admin account created successfully (adminId: ${adminId}).`);
    }

    console.log("📧 Email:", email);
    console.log("🆔 Admin ID:", adminId);
  } catch (error) {
    console.error("❌ Error creating/updating admin:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
};

createOrUpdateAdmin();



