"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminHeader } from "../../../components/layout/AdminHeader";
import { AdminBottomNav } from "../../../components/layout/AdminBottomNav";
import { IdentificationBadge } from "@phosphor-icons/react";

export default function AdminMentorsPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token || !storedUser) {
      router.replace("/admin/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      if (user?.role !== "admin") {
        router.replace("/login");
        return;
      }
      setIsAuthorized(true);
    } catch (error) {
      console.error("Failed to parse stored user:", error);
      router.replace("/admin/login");
    }
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[var(--dark-navy)] text-white flex items-center justify-center">
        <p className="text-lg font-medium">Verifying admin access...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F6FF] text-[var(--dark-navy)]">
      <AdminHeader />
      
      <main className="flex-1 mx-auto w-full max-w-6xl px-6 py-8 pb-24">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[var(--dark-navy)] mb-2">Mentors</h1>
          <p className="text-gray-600">Manage peer mentors and their assignments.</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <IdentificationBadge size={48} weight="duotone" className="mx-auto mb-4 text-[var(--primary-blue)]" />
          <h2 className="text-xl font-semibold text-[var(--dark-navy)] mb-2">Mentors Page</h2>
          <p className="text-gray-500">This page is coming soon. For now, manage mentors from the Dashboard.</p>
        </div>
      </main>
      
      <AdminBottomNav />
    </div>
  );
}

