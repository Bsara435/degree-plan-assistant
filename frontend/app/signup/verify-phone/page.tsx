"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { authAPI } from "../../../lib/api";

export default function VerifyPhone() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Get email from localStorage (set during signup)
  const [emailAddress, setEmailAddress] = useState("user@example.com");
  const [devCode, setDevCode] = useState<string | null>(null);
  
  useEffect(() => {
    const storedEmail = localStorage.getItem('signupEmail');
    const storedCode = localStorage.getItem('signupDevCode');
    if (storedEmail) {
      setEmailAddress(storedEmail);
    }
    if (storedCode) {
      setDevCode(storedCode);
      console.log('🔐 DEBUG: Verification code retrieved from localStorage:', storedCode);
    }
  }, []);

  // Handle OTP input changes
  const handleOtpChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) return;
    
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    
    setOtp(newOtp);
    
    // Focus the next empty input or the last one
    const nextEmptyIndex = newOtp.findIndex(digit => digit === "");
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const otpCode = otp.join("");
    
    if (otpCode.length !== 6) {
      alert("Please enter the complete 6-digit code");
      setIsSubmitting(false);
      return;
    }

    try {
      // Get userId from localStorage
      const userId = localStorage.getItem('signupUserId');
      if (!userId) {
        throw new Error('User ID not found. Please start the signup process again.');
      }

      // Call backend API to verify OTP
      const response = await authAPI.signupStep2(userId, otpCode);
      
      if (response.success) {
        alert("Email address verified successfully!");

        // Mark verification state for profile completion step
        localStorage.setItem('signupVerificationComplete', 'true');

        // Redirect to profile completion page
        window.location.href = "/signup/complete-profile";
      } else {
        throw new Error(response.message || 'Verification failed');
      }
      
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      const errorMessage = error.response?.data?.message || error.message || "Invalid verification code. Please try again.";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle resend
  const handleResend = async () => {
    setCanResend(false);
    setResendTimer(30);
    
    try {
      // Simulate sending new OTP
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert("New verification code sent!");
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("Failed to send verification code. Please try again.");
    }
  };

  // Resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      {/* Back Button */}
      <div className="w-full max-w-md mb-4">
        <Link
          href="/signup/create-account"
          className="inline-flex items-center text-[var(--dark-navy)] hover:text-[var(--primary-blue)] transition-colors duration-200"
        >
          <svg
            className="w-6 h-6 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </Link>
      </div>

      {/* Verification Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Title */}
        <h1 className="text-[var(--dark-navy)] text-2xl font-bold text-center mb-4">
          Verify Email Address
        </h1>

        {/* Instruction */}
        <p className="text-gray-600 text-center mb-6">
          We Have Sent Code To Your Email Address
        </p>

        {/* Email Display */}
        <div className="text-center mb-8">
          <span className="text-[var(--dark-navy)] font-medium text-lg">
            {emailAddress}
          </span>
        </div>

        {/* Debug: Display Verification Code */}
        {devCode && (
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4 mb-6">
            <p className="text-yellow-800 text-sm font-semibold mb-2 text-center">
              🐛 DEBUG MODE: Verification Code
            </p>
            <p className="text-2xl font-bold text-center text-yellow-900 tracking-wider">
              {devCode}
            </p>
            <p className="text-yellow-700 text-xs text-center mt-2">
              (This is displayed because email sending is not configured)
            </p>
          </div>
        )}

        {/* OTP Input Fields */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex justify-center space-x-3 mb-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[var(--primary-blue)] focus:ring-2 focus:ring-[var(--primary-blue)] focus:ring-opacity-20"
                autoComplete="off"
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Confirm Button */}
            <button
              type="submit"
              disabled={isSubmitting || otp.join("").length !== 6}
              className={`w-full py-4 px-6 rounded-xl font-bold transition-colors duration-200 ${
                isSubmitting || otp.join("").length !== 6
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-[var(--primary-blue)] hover:bg-[var(--primary-blue-light)] text-white"
              }`}
            >
              {isSubmitting ? "Verifying..." : "Confirm"}
            </button>

            {/* Resend Button */}
            <button
              type="button"
              onClick={handleResend}
              disabled={!canResend}
              className={`w-full py-4 px-6 rounded-xl font-bold transition-colors duration-200 ${
                canResend
                  ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
