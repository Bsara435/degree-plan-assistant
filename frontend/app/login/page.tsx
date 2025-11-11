"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { authAPI } from "../../lib/api";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({
    email: "",
    password: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [devLoginCode, setDevLoginCode] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      router.replace("/home");
    }
  }, [router]);

  // Sanitize input function
  const sanitizeInput = (input: string): string => {
    return input
      .trim()
      .replace(/[<>]/g, "")
      .replace(/['"]/g, "")
      .replace(/[;]/g, "")
      .slice(0, 255);
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(value);
    
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Reset errors
    setErrors({ email: "", password: "" });
    setGeneralError("");
    setDevLoginCode(null);

    // Validate inputs
    if (!formData.email) {
      setErrors(prev => ({ ...prev, email: "Email is required" }));
      setIsSubmitting(false);
      return;
    }
    if (!formData.password) {
      setErrors(prev => ({ ...prev, password: "Password is required" }));
      setIsSubmitting(false);
      return;
    }

    try {
      // Call backend API for login step 1
      const response = await authAPI.loginStep1(formData.email, formData.password);
      
      if (response.success) {
        // Store userId for verification step
        localStorage.setItem('loginUserId', response.userId);
        localStorage.setItem('loginEmail', formData.email);
        if (response.loginCode) {
          setDevLoginCode(response.loginCode);
          localStorage.setItem('loginDevCode', response.loginCode);
        } else {
          localStorage.removeItem('loginDevCode');
        }
        
        // Redirect to login verification page
        router.push("/login/verify");
      } else {
        throw new Error(response.message || 'Login failed');
      }
      
    } catch (error: any) {
      console.error("Error logging in:", error);
      const errorMessage = error.response?.data?.message || error.message || "Login failed. Please try again.";
      setGeneralError(errorMessage);
      localStorage.removeItem('loginDevCode');
    } finally {
      setIsSubmitting(false);
    }
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

      {/* Login Form */}
      <div className="w-full max-w-md">
        <h1 className="text-white text-2xl font-semibold text-center mb-8">
          Log In
        </h1>

        {generalError && (
          <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {generalError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email address"
              className={`w-full bg-white/10 border rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#0345A0] ${
                errors.email ? 'border-red-500' : 'border-white/20'
              }`}
              required
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          
          <div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              className={`w-full bg-white/10 border rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#0345A0] ${
                errors.password ? 'border-red-500' : 'border-white/20'
              }`}
              required
            />
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {devLoginCode && (
            <div className="rounded-xl border border-yellow-400/40 bg-yellow-400/10 px-4 py-3 text-sm text-yellow-100">
              <p className="font-semibold">Development Mode</p>
              <p>Your verification code is <span className="font-mono text-base">{devLoginCode}</span></p>
            </div>
          )}

          {/* Login Button */}
          <button 
            type="submit"
            disabled={isSubmitting}
            className={`w-full font-medium py-4 px-6 rounded-xl transition-colors duration-200 mb-4 ${
              isSubmitting 
                ? 'bg-gray-500 cursor-not-allowed text-white' 
                : 'bg-[#6B46C1] hover:bg-[#7C3AED] text-white'
            }`}
          >
            {isSubmitting ? 'Logging In...' : 'Log In'}
          </button>
        </form>

        <div className="text-center space-y-3 mb-6">
          {/* Forgot Password Link */}
          <div>
            <Link
              href="/forgot-password"
              className="text-white hover:text-gray-300 transition-colors duration-200 text-sm"
            >
              Forgot Password?
            </Link>
          </div>
          {/* Admin Login Shortcut */}
          <div>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-white hover:text-gray-300 transition-colors duration-200"
            >
              <span className="inline-flex h-2 w-2 rounded-full bg-[#6B46C1]" />
              Admin? Sign in here
            </Link>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Link
            href="/"
            className="text-white hover:text-gray-300 transition-colors duration-200"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}