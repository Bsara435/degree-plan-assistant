"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NewConversationPage() {
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="mx-auto flex min-h-full w-full max-w-xl flex-col items-center justify-center bg-[#F4F6FF] px-6 pb-24 pt-10 text-center">
      <div className="rounded-3xl bg-white p-8 shadow-xl shadow-[rgba(18,8,75,0.08)]">
        <h1 className="text-2xl font-semibold text-[var(--dark-navy)]">Start a Conversation</h1>
        <p className="mt-3 text-sm text-gray-600">
          Conversation workflows are coming soon. In the meantime, contact your advisor directly via email or visit the
          Student Success Center for immediate support.
        </p>
      </div>
    </div>
  );
}



