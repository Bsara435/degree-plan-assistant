"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function AdminHeader() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/admin/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-[var(--primary-blue)] text-white shadow-md shadow-[rgba(18,8,75,0.2)]">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
            <Image
              src="/Project Assets/logo-cle-white.png"
              alt="DegreePlan.AI Logo"
              width={32}
              height={32}
              priority
            />
          </div>
          <div>
            <p className="text-sm text-white/70">DegreePlan.AI</p>
            <p className="text-lg font-semibold leading-tight">Admin Dashboard</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--primary-blue)]"
          aria-label="Logout"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}

