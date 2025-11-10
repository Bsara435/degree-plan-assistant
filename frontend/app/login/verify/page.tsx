"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authAPI } from "../../../lib/api";
import { getRoleDestination } from "../../../lib/auth";

export default function LoginVerify() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [emailAddress, setEmailAddress] = useState<string | null>(null);
  const [devLoginCode, setDevLoginCode] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const storedEmail = localStorage.getItem("loginEmail");
    const storedCode = localStorage.getItem("loginDevCode");
    if (storedEmail) {
      setEmailAddress(storedEmail);
    } else {
      router.replace("/login");
    }
    if (storedCode) {
      setDevLoginCode(storedCode);
    }
  }, [router]);

  // start resend countdown on mount
  useEffect(() => {
    if (!canResend && resendTimer <= 0) {
      setCanResend(true);
    }
  }, [canResend, resendTimer]);

  // Handle OTP input changes
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }

    setOtp(newOtp);

    const nextEmptyIndex = newOtp.findIndex((digit) => digit === "");
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  // Run resend countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit code.");
      setIsSubmitting(false);
      return;
    }

    try {
      const userId = localStorage.getItem("loginUserId");
      if (!userId) {
        throw new Error("User session expired. Please start the login process again.");
      }

      const response = await authAPI.loginStep2(userId, otpCode);

      if (response.success) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.removeItem("loginUserId");
        localStorage.removeItem("loginEmail");
        localStorage.removeItem("loginDevCode");

        setSuccessMessage("Login successful! Redirecting to your dashboard...");

        const destination = getRoleDestination(response.user?.role);
        setTimeout(() => {
          router.replace(destination);
        }, 1200);
      } else {
        throw new Error(response.message || "Login verification failed.");
      }
    } catch (error: any) {
      console.error("Error verifying login:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Invalid verification code. Please try again.";
      setErrorMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = () => {
    setCanResend(false);
    setResendTimer(30);
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md mb-4">
        <Link
          href="/login"
          className="inline-flex items-center text-[var(--dark-navy)] hover:text-[var(--primary-blue)] transition-colors duration-200"
        >
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-[var(--dark-navy)] text-2xl font-bold text-center mb-4">Verify Login</h1>

        <p className="text-gray-600 text-center mb-6">We have sent a code to your email address.</p>

        {emailAddress && (
          <div className="text-center mb-6">
            <span className="text-[var(--dark-navy)] font-medium text-lg">{emailAddress}</span>
          </div>
        )}

        {devLoginCode && (
          <div className="mb-6 rounded-xl border border-yellow-400/40 bg-yellow-400/10 px-4 py-3 text-sm text-yellow-700">
            <p className="font-semibold text-yellow-900">Development Mode</p>
            <p>
              Your verification code is{" "}
              <span className="font-mono text-base text-yellow-900">{devLoginCode}</span>
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-xl border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-700">
            {successMessage}
          </div>
        )}

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
                autoComplete="one-time-code"
              />
            ))}
          </div>

          <div className="space-y-4">
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
              {canResend ? "Resend" : `Resend in ${resendTimer}s`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}