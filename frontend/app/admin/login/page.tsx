"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "@phosphor-icons/react";
import { adminAPI } from "../../../lib/api";

type FormState = {
  adminId: string;
  password: string;
};

type FormErrors = {
  adminId?: string;
  password?: string;
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>({ adminId: "", password: "" });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (storedUser && token) {
      try {
        const user = JSON.parse(storedUser);
        if (user?.role === "admin") {
          router.replace("/admin/dashboard");
        }
      } catch (error) {
        console.error("Failed to parse stored user:", error);
      }
    }

    // Clear any pending admin login state on first load
    if (typeof window !== "undefined") {
      localStorage.removeItem("adminLoginUserId");
      localStorage.removeItem("adminLoginAdminId");
      localStorage.removeItem("adminLoginEmail");
      localStorage.removeItem("adminLoginDevCode");
    }
  }, [router]);

  const sanitizeInput = (value: string) =>
    value.trim().replace(/[<>'";]/g, "").slice(0, 100);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const cleanValue = sanitizeInput(value);
    setFormState((prev) => ({ ...prev, [name]: cleanValue }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
    setGeneralError("");
  };

  const validate = () => {
    const errors: FormErrors = {};
    if (!formState.adminId) {
      errors.adminId = "Admin ID is required.";
    }
    if (!formState.password) {
      errors.password = "Password is required.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setGeneralError("");

    try {
      const response = await adminAPI.loginStep1(formState.adminId, formState.password);

      if (response?.success && response?.userId) {
        localStorage.setItem("adminLoginUserId", response.userId);
        localStorage.setItem("adminLoginAdminId", formState.adminId);
        if (response.email) {
          localStorage.setItem("adminLoginEmail", response.email);
        }
        if (response.loginCode) {
          localStorage.setItem("adminLoginDevCode", response.loginCode);
        } else {
          localStorage.removeItem("adminLoginDevCode");
        }
        router.replace("/admin/login/verify");
      } else {
        throw new Error(response?.message || "Unable to send verification code.");
      }
    } catch (error: any) {
      console.error("Admin login error:", error);
      let message =
        error?.response?.data?.message || error?.message || "Unable to log in. Please try again.";
      
      // If the error suggests creating an admin, add a helpful link
      if (message.includes("No admin user found") || message.includes("create an admin")) {
        message += " You can create one at /admin/create";
      }
      
      setGeneralError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--dark-navy)] via-[#0B1B4D] to-[#00112E] flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-4xl grid gap-8 rounded-3xl bg-white/5 p-8 shadow-2xl backdrop-blur-md lg:grid-cols-[1.1fr,0.9fr]">
        <section className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.08] px-10 py-12 text-white">
          <div>
            <div className="mb-8 inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm font-medium uppercase tracking-wide text-white/80">
              <ShieldCheck size={18} weight="duotone" />
              Admin Control Center
            </div>
            <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
              Welcome back, Administrator
            </h1>
            <p className="mt-4 text-white/70">
              Use the dedicated admin credentials to access mentoring and advising tools. Actions
              you take here will update student records immediately.
            </p>
          </div>
          <div className="mt-10 flex items-center gap-3 text-sm text-white/60">
            <span className="h-px w-12 bg-white/20" />
            Secure single-factor login with admin ID &amp; password
          </div>
        </section>

        <section className="rounded-2xl bg-white px-8 py-10 shadow-lg">
          <div className="mb-8 flex flex-col items-center gap-4">
            <Image
              src="/Project Assets/logo-cle-white.png"
              alt="DegreePlan.AI Logo"
              width={72}
              height={72}
              className="rounded-full border border-[var(--primary-blue)] bg-[var(--primary-blue)]/10 p-3"
              priority
            />
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-[var(--dark-navy)]">Admin Sign In</h2>
              <p className="mt-2 text-sm text-gray-500">
                Enter your admin ID and password to manage student mentoring.
              </p>
            </div>
          </div>

          {generalError && (
            <div className="mb-6 rounded-xl border border-red-400/40 bg-red-50 px-4 py-3 text-sm text-red-600">
              {generalError}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="adminId" className="mb-2 block text-sm font-medium text-gray-700">
                Admin ID
              </label>
              <input
                id="adminId"
                name="adminId"
                type="text"
                value={formState.adminId}
                onChange={handleChange}
                placeholder="e.g. admin001"
                className={`w-full rounded-xl border px-4 py-3 text-[var(--dark-navy)] shadow-sm focus:border-[var(--primary-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/20 ${
                  formErrors.adminId ? "border-red-400" : "border-gray-200"
                }`}
              />
              {formErrors.adminId && (
                <p className="mt-1 text-sm text-red-500">{formErrors.adminId}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formState.password}
                onChange={handleChange}
                placeholder="Enter password"
                className={`w-full rounded-xl border px-4 py-3 text-[var(--dark-navy)] shadow-sm focus:border-[var(--primary-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/20 ${
                  formErrors.password ? "border-red-400" : "border-gray-200"
                }`}
              />
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full rounded-xl bg-[var(--primary-blue)] py-3 font-semibold text-white transition-colors duration-200 ${
                isSubmitting ? "cursor-not-allowed opacity-75" : "hover:bg-[var(--primary-blue-light)]"
              }`}
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 space-y-2 text-center text-sm text-gray-500">
            <p>
              Not an admin?{" "}
              <Link href="/login" className="font-medium text-[var(--primary-blue)] hover:underline">
                Return to student login
              </Link>
            </p>
            <p>
              Need to create an admin user?{" "}
              <Link href="/admin/create" className="font-medium text-[var(--primary-blue)] hover:underline">
                Create Admin Account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

