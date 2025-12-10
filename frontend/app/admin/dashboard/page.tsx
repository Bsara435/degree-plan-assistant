"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  UsersThree,
  IdentificationBadge,
  ArrowSquareOut,
  ShieldCheck,
  MagnifyingGlass,
  X,
} from "@phosphor-icons/react";
import { adminAPI } from "../../../lib/api";
import { AdminHeader } from "../../../components/layout/AdminHeader";
import { AdminBottomNav } from "../../../components/layout/AdminBottomNav";

type UserSummary = {
  _id: string;
  fullName?: string;
  email: string;
  role: string;
  school?: string | null;
  major?: string | null;
};

type StudentSummary = UserSummary & {
  mentor?: UserSummary | null;
  advisor?: UserSummary | null;
  classification?: string | null;
};

type SelectMap = Record<string, string>;

export default function AdminDashboardPage() {
  const router = useRouter();
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [mentors, setMentors] = useState<UserSummary[]>([]);
  const [advisors, setAdvisors] = useState<UserSummary[]>([]);
  const [selectedMentors, setSelectedMentors] = useState<SelectMap>({});
  const [selectedAdvisors, setSelectedAdvisors] = useState<SelectMap>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

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

  const resetMessages = () => {
    setStatusMessage("");
    setErrorMessage("");
  };

  const fetchMentorsAndAdvisors = useCallback(async () => {
    try {
      const [mentorsResponse, advisorsResponse] = await Promise.all([
        adminAPI.listMentors(),
        adminAPI.listAdvisors(),
      ]);

      if (mentorsResponse?.success) {
        setMentors(mentorsResponse.mentors ?? []);
      }
      if (advisorsResponse?.success) {
        setAdvisors(advisorsResponse.advisors ?? []);
      }
    } catch (error: any) {
      console.error("Failed to load mentors/advisors:", error);
    }
  }, []);

  const searchStudents = useCallback(async (query: string) => {
    if (!query || query.trim() === "") {
      setStudents([]);
      setIsSearching(false);
      return;
    }

    resetMessages();
    setIsLoading(true);
    setIsSearching(true);
    try {
      const response = await adminAPI.searchStudents(query.trim());
      if (response?.success) {
        setStudents(response.students ?? []);
      } else {
        throw new Error(response?.message || "Search failed");
      }
    } catch (error: any) {
      console.error("Failed to search students:", error);
      const message = error?.response?.data?.message || "Unable to search students.";
      setErrorMessage(message);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      fetchMentorsAndAdvisors();
    }
  }, [isAuthorized, fetchMentorsAndAdvisors]);

  const handlePromoteToMentor = async (studentId: string) => {
    resetMessages();
    setActionLoading(`promote-${studentId}`);
    try {
      const response = await adminAPI.promoteStudentToMentor(studentId);
      if (response?.success) {
        setStatusMessage("Student promoted to mentor successfully.");
        if (searchQuery) {
          searchStudents(searchQuery);
        }
        fetchMentorsAndAdvisors();
      } else {
        throw new Error(response?.message || "Unable to promote student.");
      }
    } catch (error: any) {
      console.error("Promotion error:", error);
      const message = error?.response?.data?.message || error?.message || "Failed to promote student.";
      setErrorMessage(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAssignMentor = async (studentId: string) => {
    const mentorId = selectedMentors[studentId];
    resetMessages();

    if (!mentorId) {
      setErrorMessage("Please choose a mentor before assigning.");
      return;
    }

    setActionLoading(`assign-mentor-${studentId}`);
    try {
      const response = await adminAPI.assignMentor(studentId, mentorId);
      if (response?.success) {
        setStatusMessage("Mentor assigned successfully.");
        if (searchQuery) {
          searchStudents(searchQuery);
        }
      } else {
        throw new Error(response?.message || "Unable to assign mentor.");
      }
    } catch (error: any) {
      console.error("Assign mentor error:", error);
      const message = error?.response?.data?.message || error?.message || "Failed to assign mentor.";
      setErrorMessage(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAssignAdvisor = async (studentId: string) => {
    const advisorId = selectedAdvisors[studentId];
    resetMessages();

    if (!advisorId) {
      setErrorMessage("Please choose an advisor before assigning.");
      return;
    }

    setActionLoading(`assign-advisor-${studentId}`);
    try {
      const response = await adminAPI.assignAdvisor(studentId, advisorId);
      if (response?.success) {
        setStatusMessage("Advisor assigned successfully.");
        if (searchQuery) {
          searchStudents(searchQuery);
        }
      } else {
        throw new Error(response?.message || "Unable to assign advisor.");
      }
    } catch (error: any) {
      console.error("Assign advisor error:", error);
      const message = error?.response?.data?.message || error?.message || "Failed to assign advisor.";
      setErrorMessage(message);
    } finally {
      setActionLoading(null);
    }
  };

  const mentorOptions = useMemo(
    () =>
      mentors.map((mentor) => ({
        value: mentor._id,
        label: mentor.fullName || mentor.email,
      })),
    [mentors]
  );

  const advisorOptions = useMemo(
    () =>
      advisors.map((advisor) => ({
        value: advisor._id,
        label: `${advisor.fullName || advisor.email} · ${advisor.role}`,
      })),
    [advisors]
  );

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
      
      <div className="bg-gradient-to-br from-[var(--dark-navy)] via-[#14225D] to-[#001737] text-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-3 flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/70">
              <ShieldBadge /> Mentor &amp; Advisor Console
            </p>
            <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
              Admin Dashboard
            </h1>
            <p className="mt-4 max-w-2xl text-base text-white/80">
              Promote students to mentors, assign peer mentors, and connect students with advisors — all from a single dashboard.
            </p>
          </div>
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-3 rounded-xl border border-white/20 px-4 py-3 text-sm font-medium text-white transition hover:border-white/40 hover:bg-white/10"
          >
            Switch account
            <ArrowSquareOut size={16} weight="bold" />
          </Link>
        </div>
      </div>

      <main className="flex-1 mx-auto w-full max-w-6xl px-6 pb-20">
        <section className="-mt-12 grid gap-6 md:grid-cols-3">
          <DashboardMetric
            title={isSearching ? "Search Results" : "Active Students"}
            icon={<GraduationCap size={28} weight="duotone" />}
            value={students.length}
            accent="from-[#4A67FF] to-[#2F41AA]"
          />
          <DashboardMetric
            title="Peer Mentors"
            icon={<UsersThree size={28} weight="duotone" />}
            value={mentors.length}
            accent="from-[#FF8F6B] to-[#C64B27]"
          />
          <DashboardMetric
            title="Advisors"
            icon={<IdentificationBadge size={28} weight="duotone" />}
            value={advisors.length}
            accent="from-[#54C1A9] to-[#1D8B73]"
          />
        </section>

        <section className="mt-10 rounded-3xl border border-white/70 bg-white p-8 shadow-xl">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-[var(--dark-navy)] mb-2">
              Student Mentoring Overview
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Search for students by name, email, major, school, or classification to manage their mentoring assignments.
            </p>
            
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlass size={20} className="text-gray-400" weight="duotone" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim() === "") {
                    setStudents([]);
                    setIsSearching(false);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    searchStudents(searchQuery);
                  }
                }}
                placeholder="Search by name, email, major, school, or classification..."
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:border-transparent text-[var(--dark-navy)]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setStudents([]);
                    setIsSearching(false);
                  }}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <X size={20} weight="bold" />
                </button>
              )}
            </div>
            
            {/* Search Button */}
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => searchStudents(searchQuery)}
                disabled={!searchQuery.trim() || isLoading}
                className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition ${
                  !searchQuery.trim() || isLoading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[var(--primary-blue)] text-white hover:bg-[var(--primary-blue-light)]"
                }`}
              >
                <MagnifyingGlass size={16} weight="bold" />
                {isLoading ? "Searching..." : "Search Students"}
              </button>
              {isSearching && (
                <div className="flex items-center text-sm text-gray-500">
                  Found {students.length} result{students.length !== 1 ? "s" : ""}
                </div>
              )}
            </div>
          </div>

          {statusMessage && (
            <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {statusMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {errorMessage}
            </div>
          )}

          {isLoading ? (
            <div className="flex min-h-[200px] items-center justify-center text-[var(--primary-blue)]">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-blue)] mb-4"></div>
                <p>Searching students...</p>
              </div>
            </div>
          ) : !isSearching ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-gray-500">
              <MagnifyingGlass size={48} weight="duotone" className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Search for Students</p>
              <p>Enter a search query above to find and manage students.</p>
              <p className="text-sm mt-2">You can search by name, email, major, school, or classification.</p>
            </div>
          ) : students.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-gray-500">
              <MagnifyingGlass size={48} weight="duotone" className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">No students found</p>
              <p>No students match your search query: <strong>"{searchQuery}"</strong></p>
              <p className="text-sm mt-2">Try a different search term or check your spelling.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {students.map((student) => {
                const studentId = student._id;
                return (
                  <div
                    key={studentId}
                    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--dark-navy)]">
                          {student.fullName || "Unnamed Student"}
                        </h3>
                        <p className="text-sm text-gray-500">{student.email}</p>
                        <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--primary-blue)]">
                          {student.school && (
                            <span className="rounded-full bg-[var(--primary-blue)]/10 px-3 py-1">
                              {student.school}
                            </span>
                          )}
                          {student.major && (
                            <span className="rounded-full bg-[var(--primary-blue)]/10 px-3 py-1">
                              {student.major}
                            </span>
                          )}
                          {student.classification && (
                            <span className="rounded-full bg-[var(--primary-blue)]/10 px-3 py-1">
                              {student.classification}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right text-sm text-gray-500">
                          <p>Current mentor</p>
                          <p className="font-medium text-[var(--dark-navy)]">
                            {student.mentor?.fullName || "Not assigned"}
                          </p>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <p>Advisor</p>
                          <p className="font-medium text-[var(--dark-navy)]">
                            {student.advisor?.fullName || "Not assigned"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                        <h4 className="text-sm font-semibold text-[var(--dark-navy)]">
                          Promote student to mentor
                        </h4>
                        <p className="mt-1 text-xs text-gray-500">
                          Graduates this student to the mentor role instantly.
                        </p>
                        <button
                          type="button"
                          onClick={() => handlePromoteToMentor(studentId)}
                          disabled={actionLoading === `promote-${studentId}`}
                          className={`mt-4 w-full rounded-lg bg-gradient-to-r from-[#6B46C1] to-[#7C3AED] px-4 py-2 text-sm font-semibold text-white transition ${
                            actionLoading === `promote-${studentId}`
                              ? "cursor-not-allowed opacity-70"
                              : "hover:opacity-90"
                          }`}
                        >
                          {actionLoading === `promote-${studentId}` ? "Promoting..." : "Make Mentor"}
                        </button>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                          <h4 className="text-sm font-semibold text-[var(--dark-navy)]">Assign mentor</h4>
                          <select
                            value={selectedMentors[studentId] || ""}
                            onChange={(event) =>
                              setSelectedMentors((prev) => ({
                                ...prev,
                                [studentId]: event.target.value,
                              }))
                            }
                            className="mt-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[var(--primary-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/20"
                          >
                            <option value="">Select mentor</option>
                            {mentorOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleAssignMentor(studentId)}
                            disabled={actionLoading === `assign-mentor-${studentId}`}
                            className={`mt-3 w-full rounded-lg border border-[var(--primary-blue)] px-4 py-2 text-sm font-semibold text-[var(--primary-blue)] transition ${
                              actionLoading === `assign-mentor-${studentId}`
                                ? "cursor-not-allowed opacity-70"
                                : "hover:bg-[var(--primary-blue)] hover:text-white"
                            }`}
                          >
                            {actionLoading === `assign-mentor-${studentId}` ? "Assigning..." : "Assign Mentor"}
                          </button>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                          <h4 className="text-sm font-semibold text-[var(--dark-navy)]">Assign advisor</h4>
                          <select
                            value={selectedAdvisors[studentId] || ""}
                            onChange={(event) =>
                              setSelectedAdvisors((prev) => ({
                                ...prev,
                                [studentId]: event.target.value,
                              }))
                            }
                            className="mt-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[var(--primary-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/20"
                          >
                            <option value="">Select advisor</option>
                            {advisorOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleAssignAdvisor(studentId)}
                            disabled={actionLoading === `assign-advisor-${studentId}`}
                            className={`mt-3 w-full rounded-lg border border-[var(--primary-blue)] px-4 py-2 text-sm font-semibold text-[var(--primary-blue)] transition ${
                              actionLoading === `assign-advisor-${studentId}`
                                ? "cursor-not-allowed opacity-70"
                                : "hover:bg-[var(--primary-blue)] hover:text-white"
                            }`}
                          >
                            {actionLoading === `assign-advisor-${studentId}` ? "Assigning..." : "Assign Advisor"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
      
      <AdminBottomNav />
    </div>
  );
}

const DashboardMetric = ({
  title,
  value,
  icon,
  accent,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
}) => (
  <div className="rounded-2xl border border-white/60 bg-white p-6 shadow-md">
    <div
      className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white`}
    >
      {icon}
    </div>
    <p className="text-sm uppercase tracking-[0.2em] text-gray-400">{title}</p>
    <p className="mt-1 text-3xl font-semibold text-[var(--dark-navy)]">{value}</p>
  </div>
);

const ShieldBadge = () => (
  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10">
    <IdentificationBadge size={22} weight="duotone" />
  </span>
);





