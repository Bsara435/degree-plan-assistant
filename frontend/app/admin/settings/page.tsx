"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminHeader } from "../../../components/layout/AdminHeader";
import { AdminBottomNav } from "../../../components/layout/AdminBottomNav";
import { Gear, User, Envelope, Building } from "@phosphor-icons/react";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token || !storedUser) {
      router.replace("/admin/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser?.role !== "admin") {
        router.replace("/login");
        return;
      }
      setUser(parsedUser);
      setIsAuthorized(true);
    } catch (error) {
      console.error("Failed to parse stored user:", error);
      router.replace("/admin/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/admin/login");
  };

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
          <h1 className="text-3xl font-semibold text-[var(--dark-navy)] mb-2">Settings</h1>
          <p className="text-gray-600">Manage your admin account and preferences.</p>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-[var(--dark-navy)] mb-4 flex items-center gap-2">
              <User size={24} weight="duotone" className="text-[var(--primary-blue)]" />
              Profile Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Envelope size={20} className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-[var(--dark-navy)]">{user?.email || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User size={20} className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium text-[var(--dark-navy)]">{user?.fullName || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building size={20} className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">School</p>
                  <p className="font-medium text-[var(--dark-navy)]">{user?.school || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Gear size={20} className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium text-[var(--dark-navy)]">{user?.role || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Section */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-[var(--dark-navy)] mb-4">Actions</h2>
            <button
              onClick={handleLogout}
              className="w-full rounded-xl bg-red-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-red-600"
            >
              Log Out
            </button>
          </div>
        </div>
      </main>
      
      <AdminBottomNav />
    </div>
  );
}

