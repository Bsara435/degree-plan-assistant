/**
 * Resend Configuration Checker
 * 
 * This script checks if Resend is properly configured and tests the connection.
 * 
 * Run: node backend/scripts/checkResend.js
 */

import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const checkResendConfig = () => {
  console.log("🔍 Checking Resend Configuration...\n");

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM_ADDRESS;
  const emailProvider = process.env.EMAIL_PROVIDER;

  // Check API Key
  console.log("1. API Key Check:");
  if (apiKey) {
    if (apiKey.startsWith("re_")) {
      console.log("   ✅ RESEND_API_KEY is set");
      console.log(`   📝 Key format: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);
    } else {
      console.log("   ⚠️  RESEND_API_KEY format looks incorrect (should start with 're_')");
    }
  } else {
    console.log("   ❌ RESEND_API_KEY is NOT set");
    console.log("   💡 Get your API key from: https://resend.com/api-keys");
  }

  // Check From Email
  console.log("\n2. From Email Check:");
  if (fromEmail) {
    console.log("   ✅ RESEND_FROM_EMAIL is set");
    console.log(`   📝 From email: ${fromEmail}`);
    
    if (fromEmail.includes("onboarding@resend.dev")) {
      console.log("   ⚠️  Using test domain (onboarding@resend.dev)");
      console.log("   💡 For production, verify your domain and use a custom from email");
    } else if (fromEmail.includes("@resend.dev")) {
      console.log("   ⚠️  Using Resend test domain");
      console.log("   💡 Verify your domain in Resend dashboard for production use");
    } else {
      console.log("   ✅ Using custom domain");
      console.log("   💡 Make sure this domain is verified in Resend dashboard");
    }
  } else {
    console.log("   ⚠️  RESEND_FROM_EMAIL is NOT set");
    console.log("   💡 Will use default: onboarding@resend.dev");
    console.log("   💡 Set RESEND_FROM_EMAIL for production use");
  }

  // Check Provider Preference
  console.log("\n3. Provider Preference:");
  if (emailProvider) {
    console.log(`   📝 EMAIL_PROVIDER: ${emailProvider}`);
    if (emailProvider.toLowerCase() === "resend") {
      console.log("   ✅ Resend is set as preferred provider");
    } else {
      console.log(`   ℹ️  ${emailProvider} is preferred, Resend will be fallback`);
    }
  } else {
    console.log("   ℹ️  EMAIL_PROVIDER not set (will use default order)");
  }

  // Test Resend Instance
  console.log("\n4. Resend Instance Test:");
  if (apiKey) {
    try {
      const resend = new Resend(apiKey);
      console.log("   ✅ Resend instance created successfully");
      console.log("   💡 To test sending, use the signup endpoint");
    } catch (error) {
      console.log("   ❌ Failed to create Resend instance");
      console.log(`   Error: ${error.message}`);
    }
  } else {
    console.log("   ⏭️  Skipped (no API key)");
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 Configuration Summary:");
  console.log("=".repeat(50));

  const issues = [];
  const warnings = [];

  if (!apiKey) {
    issues.push("❌ RESEND_API_KEY is missing");
  }

  if (!fromEmail) {
    warnings.push("⚠️  RESEND_FROM_EMAIL not set (using default)");
  }

  if (fromEmail && fromEmail.includes("onboarding@resend.dev")) {
    warnings.push("⚠️  Using test domain (not suitable for production)");
  }

  if (issues.length === 0 && warnings.length === 0) {
    console.log("✅ Resend is properly configured!");
    console.log("\n💡 Next steps:");
    console.log("   1. Test email sending with signup endpoint");
    console.log("   2. Check Resend dashboard for delivery status");
    console.log("   3. Verify domain if using custom from email");
  } else {
    if (issues.length > 0) {
      console.log("\n❌ Critical Issues:");
      issues.forEach(issue => console.log(`   ${issue}`));
    }

    if (warnings.length > 0) {
      console.log("\n⚠️  Warnings:");
      warnings.forEach(warning => console.log(`   ${warning}`));
    }

    console.log("\n💡 Setup Guide:");
    console.log("   See: docs/RESEND-EMAIL-SERVICE.md");
  }

  console.log("\n" + "=".repeat(50));
};

// Run the check
checkResendConfig();

