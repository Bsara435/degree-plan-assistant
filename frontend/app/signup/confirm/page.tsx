"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { mapFrontendToBackendRole, getRoleDisplayName } from "../../../lib/auth";

export default function SignupConfirmation() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get("role");

  // Store role in localStorage and redirect to create-account
  useEffect(() => {
    if (role) {
      const backendRole = mapFrontendToBackendRole(role);
      localStorage.setItem("signupRole", backendRole);
      // Store frontend role for display purposes
      localStorage.setItem("signupRoleDisplay", role);
    } else {
      // If no role, default to student
      localStorage.setItem("signupRole", "student");
      localStorage.setItem("signupRoleDisplay", "student");
    }
  }, [role]);

  const handleContinue = () => {
    router.push("/signup/create-account");
  };

  return (
    <div className="min-h-screen bg-[var(--dark-navy)] flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="mb-8">
        <Image
          src="/Project Assets/logo-cle-white.png"
          alt="DegreePlan.AI Logo"
          width={80}
          height={80}
          priority
          className="mx-auto"
        />
      </div>

      {/* Confirmation Content */}
      <div className="w-full max-w-md text-center">
        <h1 className="text-white text-2xl font-semibold mb-4">
          Sign Up as {getRoleDisplayName(role)}
        </h1>
        
        <p className="text-gray-300 mb-8">
          Complete your registration to get started with DegreePlan.AI
        </p>

        {/* Signup Form Placeholder */}
        <div className="space-y-4 mb-8">
          <input
            type="email"
            placeholder="Email address"
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[var(--primary-blue)]"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[var(--primary-blue)]"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[var(--primary-blue)]"
          />
        </div>

        {/* Submit Button */}
        <button 
          onClick={handleContinue}
          className="w-full bg-[var(--primary-blue)] hover:bg-[var(--primary-blue-light)] text-white font-medium py-4 px-6 rounded-xl transition-colors duration-200 mb-4"
        >
          Continue to Create Account
        </button>

        {/* Back Button */}
        <div className="text-center">
          <Link
            href="/signup/role"
            className="text-white hover:text-gray-300 transition-colors duration-200"
          >
            ← Back to Role Selection
          </Link>
        </div>
      </div>
    </div>
  );
}








