"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type StoredUser = {
  fullName?: string;
  email?: string;
  role?: string;
};

const roleLabels: Record<string, string> = {
  student: "Student",
  mentor: "Mentor",
  "fye-teacher": "FYE Teacher",
};

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/login");
      return;
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed: StoredUser = JSON.parse(storedUser);
        setUser(parsed);
      } catch (error) {
        console.warn("Unable to parse stored user", error);
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/login");
  };

  const prettyRole = user?.role ? roleLabels[user.role.toLowerCase()] || "Member" : "Member";

  return (
    <div className="mx-auto flex min-h-full w-full max-w-xl flex-col gap-8 bg-[#F4F6FF] px-6 pb-24 pt-10">
      <header>
        <h1 className="text-2xl font-semibold text-[var(--dark-navy)]">Settings</h1>
        <p className="mt-2 text-sm text-gray-600">Manage your profile, preferences, and session.</p>
      </header>

      <section className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-lg shadow-[rgba(18,8,75,0.05)]">
          <h2 className="text-base font-semibold text-[var(--dark-navy)]">Profile</h2>
          <div className="mt-4 space-y-3 text-sm text-gray-600">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">Name</p>
              <p className="text-[var(--dark-navy)] text-sm font-medium">{user?.fullName ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">Email</p>
              <p className="text-[var(--dark-navy)] text-sm font-medium">{user?.email ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">Role</p>
              <p className="text-[var(--dark-navy)] text-sm font-medium">{prettyRole}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-lg shadow-[rgba(18,8,75,0.05)]">
          <h2 className="text-base font-semibold text-[var(--dark-navy)]">Notifications</h2>
          <p className="mt-2 text-sm text-gray-500">
            Manage how you receive updates from advisors and the DegreePlan.AI team. Notification preferences will be
            available soon.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-lg shadow-[rgba(18,8,75,0.05)]">
          <h2 className="text-base font-semibold text-[var(--dark-navy)]">Support</h2>
          <p className="mt-2 text-sm text-gray-500">
            Need help? Email{" "}
            <a className="font-semibold text-[var(--primary-blue)]" href="mailto:support@degreeplan.ai">
              support@degreeplan.ai
            </a>{" "}
            or visit the Student Success Center.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="mt-2 inline-flex items-center justify-center rounded-2xl border border-red-400 px-5 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50"
        >
          Log out
        </button>
      </section>
    </div>
  );
}



