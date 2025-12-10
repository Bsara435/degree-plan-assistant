"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useCallback } from "react";
import { advisorAPI } from "../../../lib/api";

type StoredUser = {
  fullName?: string;
  firstName?: string;
  role?: string;
  _id?: string;
};

type Student = {
  _id: string;
  fullName: string;
  email: string;
  major?: string;
  classification?: string;
  school?: string;
  mentor?: {
    fullName: string;
    email: string;
  };
};

const quickResources = [
  { title: "Academic Flowcharts", href: "/resources#flowcharts" },
  { title: "Academic Catalogue", href: "/resources#catalogue" },
  { title: "Degree Plan", href: "/resources#degree-plan" },
];

const isAdvisorRole = (role?: string): boolean => {
  return role === "advisor";
};

export default function HomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState("User");
  const [user, setUser] = useState<StoredUser | null>(null);
  const [assignedStudents, setAssignedStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const fetchAssignedStudents = useCallback(async () => {
    setLoadingStudents(true);
    try {
      const response = await advisorAPI.getAssignedStudents();
      if (response.success) {
        setAssignedStudents(response.students || []);
      }
    } catch (error) {
      console.error("Failed to fetch assigned students:", error);
    } finally {
      setLoadingStudents(false);
    }
  }, []);

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
        const friendlyName =
          parsed.firstName ||
          (parsed.fullName ? parsed.fullName.split(" ")[0] : undefined);
        if (friendlyName) {
          setUserName(friendlyName);
        }

        // Fetch assigned students if user is an advisor
        if (isAdvisorRole(parsed.role)) {
          fetchAssignedStudents();
        }
      } catch (error) {
        console.warn("Unable to parse stored user", error);
      }
    }
  }, [router, fetchAssignedStudents]);

  const greeting = useMemo(() => `Welcome ${userName}!`, [userName]);
  const isAdvisor = isAdvisorRole(user?.role);

  // Advisor view with assigned students
  if (isAdvisor) {
    return (
      <div className="flex min-h-full flex-col bg-[#F4F6FF] pb-20">
        <section className="relative overflow-hidden bg-[var(--primary-blue)] pb-16 pt-24 text-white shadow-[0_6px_30px_rgba(18,8,75,0.2)]">
          <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-6">
            <div>
              <p className="text-sm text-white/70">Welcome back to DegreePlan.AI</p>
              <p className="text-2xl font-semibold">{greeting}</p>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/80">
                Manage your assigned students, review their progress, and provide academic guidance.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8 px-6 pb-10 pt-6">
          <div className="rounded-3xl bg-white p-6 shadow-lg shadow-[rgba(18,8,75,0.08)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[var(--dark-navy)]">Assigned Students</h2>
              <span className="rounded-full bg-[var(--primary-blue)]/10 px-3 py-1 text-sm font-semibold text-[var(--primary-blue)]">
                {assignedStudents.length}
              </span>
            </div>
            
            {loadingStudents ? (
              <div className="py-8 text-center text-gray-500">Loading students...</div>
            ) : assignedStudents.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500">No students assigned yet.</p>
                <p className="mt-2 text-sm text-gray-400">
                  Students will appear here once they are assigned to you by an administrator.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignedStudents.map((student) => (
                  <Link
                    key={student._id}
                    href={`/chat?student=${student._id}`}
                    className="block rounded-2xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-[var(--primary-blue)]/30 hover:bg-gray-50 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-[var(--dark-navy)]">{student.fullName}</h3>
                        <p className="mt-1 text-sm text-gray-600">{student.email}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {student.major && (
                            <span className="rounded-full bg-[var(--primary-blue)]/10 px-2 py-1 text-xs font-medium text-[var(--primary-blue)]">
                              {student.major}
                            </span>
                          )}
                          {student.classification && (
                            <span className="rounded-full bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700">
                              {student.classification}
                            </span>
                          )}
                          {student.school && (
                            <span className="rounded-full bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700">
                              {student.school}
                            </span>
                          )}
                        </div>
                        {student.mentor && (
                          <p className="mt-2 text-xs text-gray-500">
                            Mentor: {student.mentor.fullName}
                          </p>
                        )}
                      </div>
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.6}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

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

  // Student view (original)
  return (
    <div className="flex min-h-full flex-col bg-[#F4F6FF] pb-20">
      <section className="relative overflow-hidden bg-[var(--primary-blue)] pb-16 pt-24 text-white shadow-[0_6px_30px_rgba(18,8,75,0.2)]">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-6">
          <div>
            <p className="text-sm text-white/70">Welcome back to DegreePlan.AI</p>
            <p className="text-2xl font-semibold">{greeting}</p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/80">
              Keep track of your degree plan, explore academic resources, and reach out to advisors whenever you need a hand.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8 px-6 pb-10 pt-6">
        <Link
          href="/chat/assistant"
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



