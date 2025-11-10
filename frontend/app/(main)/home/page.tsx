"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type StoredUser = {
  fullName?: string;
  firstName?: string;
};

const quickResources = [
  { title: "Academic Flowcharts", href: "/resources#flowcharts" },
  { title: "Academic Catalogue", href: "/resources#catalogue" },
  { title: "Degree Plan", href: "/resources#degree-plan" },
];

export default function HomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState("User");

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
        const friendlyName =
          parsed.firstName ||
          (parsed.fullName ? parsed.fullName.split(" ")[0] : undefined);
        if (friendlyName) {
          setUserName(friendlyName);
        }
      } catch (error) {
        console.warn("Unable to parse stored user", error);
      }
    }
  }, [router]);

  const greeting = useMemo(() => `Welcome ${userName}!`, [userName]);

  return (
    <div className="flex min-h-full flex-col bg-[#F4F6FF] pb-20">
      <header className="relative overflow-hidden rounded-b-3xl bg-[var(--primary-blue)] pb-16 pt-14 text-white">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-6">
          <div className="flex items-center justify-between">
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
                <p className="text-lg font-semibold">Your journey, guided.</p>
              </div>
            </div>
            <Link
              href="/settings"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Open settings"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.4 15a1.9 1.9 0 0 0 .38 2.09l.05.05a2.3 2.3 0 0 1-3.25 3.25l-.05-.05a1.9 1.9 0 0 0-2.09-.38 1.9 1.9 0 0 0-1.15 1.74V22a2.3 2.3 0 0 1-4.6 0v-.06a1.9 1.9 0 0 0-1.15-1.73 1.9 1.9 0 0 0-2.09.37l-.05.05a2.3 2.3 0 0 1-3.25-3.25l.05-.05A1.9 1.9 0 0 0 5 15.05a1.9 1.9 0 0 0-1.74-1.15H3.2a2.3 2.3 0 0 1 0-4.6h.06A1.9 1.9 0 0 0 5 8.15a1.9 1.9 0 0 0-.37-2.09l-.05-.05a2.3 2.3 0 0 1 3.25-3.25l.05.05A1.9 1.9 0 0 0 10.05 3a1.9 1.9 0 0 0 1.15-1.74V1.2a2.3 2.3 0 0 1 4.6 0v.06A1.9 1.9 0 0 0 17 3a1.9 1.9 0 0 0 2.09-.37l.05-.05a2.3 2.3 0 0 1 3.25 3.25l-.05.05A1.9 1.9 0 0 0 20.8 8.2h-.06A1.9 1.9 0 0 0 19 10.05c0 .73.42 1.37 1.05 1.7.15.08.3.15.46.2"
                />
              </svg>
            </Link>
          </div>
          <div>
            <p className="text-2xl font-semibold">{greeting}</p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/80">
              Keep track of your degree plan, explore academic resources, and reach out to advisors whenever you need a hand.
            </p>
          </div>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8 px-6 pb-10 pt-6">
        <Link
          href="/chat"
          className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-lg shadow-[rgba(18,8,75,0.08)] transition hover:-translate-y-1 hover:shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[var(--dark-navy)]">Start A Conversation</h2>
              <p className="mt-2 text-sm text-gray-500">
                Get matched with an advisor to answer questions about your academic path.
              </p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8EDFF] text-[var(--primary-blue)]">
              <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth={1.6}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 11a8 8 0 1 0-15.46 3.24L3 21l6.76-2.54A8 8 0 0 0 21 11Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 10h.01M12 10h.01M15 10h.01"
                />
              </svg>
            </div>
          </div>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary-blue)]">
            Start chatting
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </Link>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[var(--dark-navy)]">Resources</h3>
            <Link href="/resources" className="text-sm font-medium text-[var(--primary-blue)] hover:text-[var(--primary-blue-light)]">
              View all
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {quickResources.map((resource) => (
              <Link
                key={resource.title}
                href={resource.href}
                className="flex min-w-[160px] flex-col gap-3 rounded-2xl bg-white p-4 text-[var(--dark-navy)] shadow-md shadow-[rgba(18,8,75,0.05)] transition hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="text-sm font-semibold">{resource.title}</span>
                <div className="flex items-center gap-2 text-xs font-medium text-[var(--primary-blue)]">
                  Open
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17 17 7M9 7h8v8" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}



