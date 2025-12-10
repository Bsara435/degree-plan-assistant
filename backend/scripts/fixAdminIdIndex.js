/**
 * Fix MongoDB adminId Index
 * 
 * This script fixes the adminId unique index issue by:
 * 1. Dropping the existing adminId index
 * 2. Recreating it as a sparse index
 * 3. Removing null adminId values from existing documents
 * 
 * Run this script once to fix the database:
 * 
 * From project root:
 *   cd backend && npm run fix:adminId
 * 
 * Or directly:
 *   node backend/scripts/fixAdminIdIndex.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("❌ MONGO_URI is missing in your .env file!");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "degree-plan-assistant",
    });
    console.log("✅ MongoDB connected successfully!");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

const fixAdminIdIndex = async () => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection("users");

    console.log("🔧 Fixing adminId index...");

    // Step 1: Drop existing adminId index if it exists
    try {
      await collection.dropIndex("adminId_1");
      console.log("✅ Dropped existing adminId index");
    } catch (error) {
      if (error.code === 27) {
        console.log("ℹ️  adminId index doesn't exist, skipping drop");
      } else {
        throw error;
      }
    }

    // Step 2: Remove adminId field from non-admin users (set to undefined/null)
    const result = await collection.updateMany(
      { 
        role: { $ne: "admin" },
        adminId: { $exists: true }
      },
      { 
        $unset: { adminId: "" }
      }
    );
    console.log(`✅ Removed adminId from ${result.modifiedCount} non-admin users`);

    // Step 3: Recreate the index as sparse
    await collection.createIndex(
      { adminId: 1 },
      { 
        unique: true,
        sparse: true,
        name: "adminId_1"
      }
    );
    console.log("✅ Created new sparse unique index on adminId");

    console.log("\n🎉 adminId index fix completed successfully!");
    console.log("You can now sign up users without the duplicate key error.");

  } catch (error) {
    console.error("❌ Error fixing adminId index:", error.message);
    throw error;
  }
};

const main = async () => {
  await connectDB();
  await fixAdminIdIndex();
  await mongoose.connection.close();
  console.log("\n✅ Database connection closed.");
  process.exit(0);
};

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

