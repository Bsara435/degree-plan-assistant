"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, CheckCircle, XCircle } from "@phosphor-icons/react";
import { adminAPI } from "../../../lib/api";

type FormData = {
  email: string;
  fullName: string;
  school: string;
};

export default function CreateAdminPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    fullName: "",
    school: "SSE",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [createdAdmin, setCreatedAdmin] = useState<any>(null);

  const schools = [
    { value: "SSE", label: "School of Science and Engineering (SSE)" },
    { value: "SHAS", label: "School of Humanities and Social Sciences (SHAS)" },
    { value: "SBA", label: "School of Business Administration (SBA)" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const response = await adminAPI.createAdmin({
        email: formData.email || undefined,
        fullName: formData.fullName || undefined,
        school: formData.school || undefined,
      });

      if (response.success) {
        setSuccess(true);
        setCreatedAdmin(response);
      } else {
        throw new Error(response.message || "Failed to create admin user");
      }
    } catch (err: any) {
      console.error("Create admin error:", err);
      const message =
        err?.response?.data?.message || err?.message || "Failed to create admin user. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success && createdAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--dark-navy)] via-[#0B1B4D] to-[#00112E] flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 rounded-full bg-green-100 p-4">
              <CheckCircle size={48} weight="fill" className="text-green-600" />
            </div>
            <h1 className="text-3xl font-semibold text-[var(--dark-navy)] mb-4">
              Admin User Created Successfully!
            </h1>
            <p className="text-gray-600 mb-8">
              The admin user has been created with the default credentials.
            </p>

            <div className="w-full bg-gray-50 rounded-xl p-6 mb-6">
              <h2 className="text-lg font-semibold text-[var(--dark-navy)] mb-4">Admin Credentials</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Admin ID:</p>
                  <p className="font-mono text-lg font-semibold text-[var(--primary-blue)]">
                    {createdAdmin.credentials?.adminId || "admin"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Password:</p>
                  <p className="font-mono text-lg font-semibold text-[var(--primary-blue)]">
                    {createdAdmin.credentials?.password || "Test1234"}
                  </p>
                </div>
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ <strong>Important:</strong> Save these credentials securely. The password will not be shown again.
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full bg-blue-50 rounded-xl p-6 mb-6">
              <h2 className="text-lg font-semibold text-[var(--dark-navy)] mb-3">Admin Details</h2>
              <div className="space-y-2 text-left">
                <p>
                  <span className="font-medium">Email:</span> {createdAdmin.user?.email}
                </p>
                <p>
                  <span className="font-medium">Full Name:</span> {createdAdmin.user?.fullName}
                </p>
                <p>
                  <span className="font-medium">School:</span> {createdAdmin.user?.school}
                </p>
                <p>
                  <span className="font-medium">Role:</span> {createdAdmin.user?.role}
                </p>
              </div>
            </div>

            <div className="flex gap-4 w-full">
              <Link
                href="/admin/login"
                className="flex-1 rounded-xl bg-[var(--primary-blue)] py-3 font-semibold text-white text-center transition-colors duration-200 hover:bg-[var(--primary-blue-light)]"
              >
                Go to Admin Login
              </Link>
              <button
                onClick={() => {
                  setSuccess(false);
                  setCreatedAdmin(null);
                  setFormData({ email: "", fullName: "", school: "SSE" });
                }}
                className="flex-1 rounded-xl border-2 border-[var(--primary-blue)] py-3 font-semibold text-[var(--primary-blue)] transition-colors duration-200 hover:bg-[var(--primary-blue)] hover:text-white"
              >
                Create Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--dark-navy)] via-[#0B1B4D] to-[#00112E] flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 inline-flex items-center gap-3 rounded-full bg-[var(--primary-blue)]/10 px-4 py-2 text-sm font-medium text-[var(--primary-blue)]">
            <ShieldCheck size={18} weight="duotone" />
            Admin Setup
          </div>
          <Image
            src="/Project Assets/logo-cle-white.png"
            alt="DegreePlan.AI Logo"
            width={64}
            height={64}
            className="mb-4 rounded-full border-2 border-[var(--primary-blue)] bg-[var(--primary-blue)]/10 p-2"
            priority
          />
          <h1 className="text-3xl font-semibold text-[var(--dark-navy)] text-center mb-2">
            Create Admin User
          </h1>
          <p className="text-gray-600 text-center">
            Create the initial admin user with default credentials (admin/Test1234)
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-400/40 bg-red-50 px-4 py-3 flex items-start gap-3">
            <XCircle size={20} weight="fill" className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
              Email <span className="text-gray-400">(optional)</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[var(--dark-navy)] shadow-sm focus:border-[var(--primary-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/20"
            />
            <p className="mt-1 text-xs text-gray-500">
              If not provided, defaults to admin@degreeplan.local
            </p>
          </div>

          <div>
            <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-gray-700">
              Full Name <span className="text-gray-400">(optional)</span>
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Admin User"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[var(--dark-navy)] shadow-sm focus:border-[var(--primary-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/20"
            />
            <p className="mt-1 text-xs text-gray-500">
              If not provided, defaults to "Admin User"
            </p>
          </div>

          <div>
            <label htmlFor="school" className="mb-2 block text-sm font-medium text-gray-700">
              School <span className="text-gray-400">(optional)</span>
            </label>
            <select
              id="school"
              name="school"
              value={formData.school}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[var(--dark-navy)] shadow-sm focus:border-[var(--primary-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/20"
            >
              {schools.map((school) => (
                <option key={school.value} value={school.value}>
                  {school.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              If not provided, defaults to "SSE"
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              <strong>Default Credentials:</strong>
            </p>
            <ul className="mt-2 space-y-1 text-sm text-blue-700">
              <li>• Admin ID: <code className="bg-blue-100 px-1 rounded">admin</code></li>
              <li>• Password: <code className="bg-blue-100 px-1 rounded">Test1234</code></li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full rounded-xl bg-[var(--primary-blue)] py-3 font-semibold text-white transition-colors duration-200 ${
              isSubmitting
                ? "cursor-not-allowed opacity-75"
                : "hover:bg-[var(--primary-blue-light)]"
            }`}
          >
            {isSubmitting ? "Creating Admin..." : "Create Admin User"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/admin/login"
            className="text-sm text-gray-600 hover:text-[var(--primary-blue)] transition-colors"
          >
            ← Back to Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}

