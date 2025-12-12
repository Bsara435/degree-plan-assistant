"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { authAPI } from "../../../lib/api";

export default function CreateAccount() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sanitize input function
  const sanitizeInput = (input: string): string => {
    return input
      .trim()
      .replace(/[<>]/g, "") // Remove potential HTML tags
      .replace(/['"]/g, "") // Remove quotes
      .replace(/[;]/g, "") // Remove semicolons
      .slice(0, 255); // Limit length
  };

  // Validate email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate password strength
  const validatePassword = (password: string): boolean => {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /[0-9]/.test(password);
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
    setErrors({ email: "", password: "", confirmPassword: "" });

    // Validate email
    if (!formData.email) {
      setErrors(prev => ({ ...prev, email: "Email is required" }));
      setIsSubmitting(false);
      return;
    }
    if (!validateEmail(formData.email)) {
      setErrors(prev => ({ ...prev, email: "Please enter a valid email address" }));
      setIsSubmitting(false);
      return;
    }

    // Validate password
    if (!formData.password) {
      setErrors(prev => ({ ...prev, password: "Password is required" }));
      setIsSubmitting(false);
      return;
    }
    if (!validatePassword(formData.password)) {
      setErrors(prev => ({ 
        ...prev, 
        password: "Password must be at least 8 characters with uppercase, lowercase, and number" 
      }));
      setIsSubmitting(false);
      return;
    }

    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }));
      setIsSubmitting(false);
      return;
    }

    // If all validations pass, proceed with form submission
    try {
      // Get role from localStorage (set during role selection)
      const role = localStorage.getItem('signupRole') || 'student';
      
      // Call backend API to create account with role
      const response = await authAPI.signupStep1(formData.email, formData.password, role);
      
      if (response.success) {
        // Store userId for verification step
        localStorage.setItem('signupUserId', response.userId);
        
        // Store email for display in verification page
        localStorage.setItem('signupEmail', formData.email);
        
        // Keep role in localStorage for profile completion
        // (role is already stored, but ensure it persists)
        
        // Store confirmation code if provided (for debugging - development mode)
        if (response.confirmationCode) {
          localStorage.setItem('signupDevCode', response.confirmationCode);
          console.log('🔐 DEBUG: Verification code stored:', response.confirmationCode);
        }
        
        // Redirect to email verification page
        window.location.href = "/signup/verify-phone";
      } else {
        throw new Error(response.message || 'Account creation failed');
      }
      
    } catch (error: any) {
      console.error("Error creating account:", error);
      const errorMessage = error.response?.data?.message || error.message || "Error creating account. Please try again.";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      {/* Create Account Form */}
      <div className="w-full max-w-md">
        {/* Title */}
        <h1 className="text-[var(--dark-navy)] text-4xl font-bold mb-12 leading-tight text-center">
          Create your Account
        </h1>

        {/* Form Fields */}
        <form id="signup-form" onSubmit={handleSubmit} className="space-y-4 mb-8">
          {/* Email Field */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter Your Email"
              className={`w-full pl-12 pr-4 py-4 bg-white border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:border-transparent text-gray-900 placeholder-gray-400 ${
                errors.email ? 'border-red-500' : 'border-gray-200'
              }`}
              required
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              className={`w-full pl-12 pr-12 py-4 bg-white border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:border-transparent text-gray-900 placeholder-gray-400 ${
                errors.password ? 'border-red-500' : 'border-gray-200'
              }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
            >
              {showPassword ? (
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                  />
                </svg>
              )}
            </button>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm Password"
              className={`w-full pl-12 pr-12 py-4 bg-white border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:border-transparent text-gray-900 placeholder-gray-400 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-200'
              }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
            >
              {showConfirmPassword ? (
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                  />
                </svg>
              )}
            </button>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>
        </form>

        {/* Sign Up Button */}
        <button 
          type="submit" 
          form="signup-form"
          disabled={isSubmitting}
          className={`w-full text-white font-bold py-4 px-6 rounded-xl transition-colors duration-200 mb-6 ${
            isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-[var(--primary-blue)] hover:bg-[var(--primary-blue-light)]'
          }`}
        >
          {isSubmitting ? 'Creating Account...' : 'Sign Up'}
        </button>

        {/* Sign In Link */}
        <div className="text-center">
          <span className="text-gray-500">
            Already Have An Account?{" "}
          </span>
          <Link
            href="/login"
            className="text-[var(--dark-navy)] font-bold hover:underline"
          >
            Sign In
          </Link>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
