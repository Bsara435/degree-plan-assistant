"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getRoleDestination } from "../../lib/auth";

export default function DashboardRedirect() {
  const router = useRouter();
  const [statusMessage, setStatusMessage] = useState("Preparing your home experience...");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setStatusMessage("Redirecting to login...");
      router.replace("/login");
      return;
    }

    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      setStatusMessage("Refreshing session...");
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      const destination = getRoleDestination(user?.role);
      router.replace(destination);
    } catch (error) {
      console.error("Failed to parse stored user:", error);
      setStatusMessage("Session data invalid. Redirecting to login...");
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-semibold text-[var(--dark-navy)] mb-2">Welcome back!</h1>
      <p className="text-gray-600 mb-6">{statusMessage}</p>
      <Link
        href="/home"
        className="text-[var(--primary-blue)] hover:text-[var(--primary-blue-light)] transition-colors duration-200"
      >
        Continue to your home
      </Link>
    </div>
  );
}

