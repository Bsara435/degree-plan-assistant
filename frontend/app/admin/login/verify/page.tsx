"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminAPI } from "../../../../lib/api";

const OTP_LENGTH = 6;

export default function AdminLoginVerifyPage() {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [emailAddress, setEmailAddress] = useState<string | null>(null);
  const [devLoginCode, setDevLoginCode] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const storedEmail = localStorage.getItem("adminLoginEmail");
    const storedDevCode = localStorage.getItem("adminLoginDevCode");
    const storedUserId = localStorage.getItem("adminLoginUserId");

    if (!storedUserId) {
      router.replace("/admin/login");
      return;
    }

    if (storedEmail) {
      setEmailAddress(storedEmail);
    }
    if (storedDevCode) {
      setDevLoginCode(storedDevCode);
    }
  }, [router]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedData = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < OTP_LENGTH; i++) {
      newOtp[i] = pastedData[i];
    }

    setOtp(newOtp);

    const nextIndex = newOtp.findIndex((digit) => digit === "");
    inputRefs.current[nextIndex === -1 ? OTP_LENGTH - 1 : nextIndex]?.focus();
  };

  const resetMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetMessages();

    const code = otp.join("");
    if (code.length !== OTP_LENGTH) {
      setErrorMessage("Please enter the 6-digit verification code.");
      return;
    }

    const userId = localStorage.getItem("adminLoginUserId");
    if (!userId) {
      setErrorMessage("Session expired. Please restart the login process.");
      router.replace("/admin/login");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await adminAPI.loginStep2(userId, code);
      if (response?.success && response?.token && response?.user) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.removeItem("adminLoginUserId");
        localStorage.removeItem("adminLoginAdminId");
        localStorage.removeItem("adminLoginEmail");
        localStorage.removeItem("adminLoginDevCode");

        setSuccessMessage("Verification successful. Redirecting...");
        setTimeout(() => {
          router.replace("/admin/dashboard");
        }, 1200);
      } else {
        throw new Error(response?.message || "Verification failed.");
      }
    } catch (error: any) {
      console.error("Admin verification error:", error);
      const message =
        error?.response?.data?.message || error?.message || "Invalid code. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = () => {
    setCanResend(false);
    setResendTimer(30);
    router.replace("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md mb-4">
        <Link
          href="/admin/login"
          className="inline-flex items-center text-[var(--dark-navy)] hover:text-[var(--primary-blue)] transition-colors duration-200"
        >
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-[var(--dark-navy)] text-2xl font-bold text-center mb-4">
          Verify Admin Login
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Enter the verification code sent to your admin email to continue.
        </p>

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
                onChange={(event) => handleOtpChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[var(--primary-blue)] focus:ring-2 focus:ring-[var(--primary-blue)] focus:ring-opacity-20"
                autoComplete="one-time-code"
              />
            ))}
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={isSubmitting || otp.join("").length !== OTP_LENGTH}
              className={`w-full py-4 px-6 rounded-xl font-bold transition-colors duration-200 ${
                isSubmitting || otp.join("").length !== OTP_LENGTH
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



