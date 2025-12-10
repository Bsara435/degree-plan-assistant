"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminHeader } from "../../../components/layout/AdminHeader";
import { AdminBottomNav } from "../../../components/layout/AdminBottomNav";
import { UsersThree, IdentificationBadge, CheckCircle, XCircle, Funnel, MagnifyingGlass, X, UserPlus } from "@phosphor-icons/react";
import { adminAPI } from "../../../lib/api";

type Student = {
  _id: string;
  fullName?: string;
  email: string;
  school?: string | null;
  major?: string | null;
  classification?: string | null;
};

type Mentor = {
  _id: string;
  fullName?: string;
  email: string;
  role: string;
  school?: string | null;
  major?: string | null;
  assignedStudentsCount: number;
  status: "available" | "assigned";
};

type Advisor = {
  _id: string;
  fullName?: string;
  email: string;
  role: string;
  school?: string | null;
  assignedStudentsCount: number;
  status: "available" | "assigned";
};

export default function AdminMentorsPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "assigned">("all");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [studentSearchQuery, setStudentSearchQuery] = useState<Record<string, string>>({});
  const [searchResults, setSearchResults] = useState<Record<string, Student[]>>({});
  const [isSearchingStudents, setIsSearchingStudents] = useState<Record<string, boolean>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  const fetchMentorsAndAdvisors = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
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
      const message = error?.response?.data?.message || "Unable to load mentors and advisors.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      fetchMentorsAndAdvisors();
    }
  }, [isAuthorized, fetchMentorsAndAdvisors]);

  // Filter mentors and advisors based on status
  const filteredMentors = mentors.filter((mentor) => {
    if (statusFilter === "all") return true;
    return mentor.status === statusFilter;
  });

  const filteredAdvisors = advisors.filter((advisor) => {
    if (statusFilter === "all") return true;
    return advisor.status === statusFilter;
  });

  const resetMessages = () => {
    setStatusMessage("");
    setErrorMessage("");
  };

  const searchStudents = useCallback(async (query: string, cardId: string) => {
    if (!query || query.trim() === "") {
      setSearchResults((prev) => ({ ...prev, [cardId]: [] }));
      setIsSearchingStudents((prev) => ({ ...prev, [cardId]: false }));
      return;
    }

    resetMessages();
    setIsSearchingStudents((prev) => ({ ...prev, [cardId]: true }));
    try {
      const response = await adminAPI.searchStudents(query.trim());
      if (response?.success) {
        setSearchResults((prev) => ({ ...prev, [cardId]: response.students ?? [] }));
      } else {
        throw new Error(response?.message || "Search failed");
      }
    } catch (error: any) {
      console.error("Failed to search students:", error);
      const message = error?.response?.data?.message || "Unable to search students.";
      setErrorMessage(message);
      setSearchResults((prev) => ({ ...prev, [cardId]: [] }));
    } finally {
      setIsSearchingStudents((prev) => ({ ...prev, [cardId]: false }));
    }
  }, []);

  const handleAssignMentor = async (mentorId: string, studentId: string) => {
    resetMessages();
    setActionLoading(`assign-mentor-${mentorId}-${studentId}`);
    try {
      const response = await adminAPI.assignMentor(studentId, mentorId);
      if (response?.success) {
        setStatusMessage("Mentor assigned successfully.");
        setExpandedCard(null);
        setStudentSearchQuery((prev) => ({ ...prev, [mentorId]: "" }));
        setSearchResults((prev) => ({ ...prev, [mentorId]: [] }));
        fetchMentorsAndAdvisors();
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

  const handleAssignAdvisor = async (advisorId: string, studentId: string) => {
    resetMessages();
    setActionLoading(`assign-advisor-${advisorId}-${studentId}`);
    try {
      const response = await adminAPI.assignAdvisor(studentId, advisorId);
      if (response?.success) {
        setStatusMessage("Advisor assigned successfully.");
        setExpandedCard(null);
        setStudentSearchQuery((prev) => ({ ...prev, [advisorId]: "" }));
        setSearchResults((prev) => ({ ...prev, [advisorId]: [] }));
        fetchMentorsAndAdvisors();
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
      
      <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-8 pb-24">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-[var(--dark-navy)] mb-2">Mentors & Advisors</h1>
              <p className="text-gray-600">View and manage all peer mentors and advisors with their assignment status.</p>
            </div>
            <div className="flex items-center gap-3">
              <Funnel size={20} className="text-gray-500" weight="duotone" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "available" | "assigned")}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-[var(--dark-navy)] focus:border-[var(--primary-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/20"
              >
                <option value="all">All</option>
                <option value="available">Available</option>
                <option value="assigned">Assigned</option>
              </select>
            </div>
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
          <div className="flex min-h-[400px] items-center justify-center text-[var(--primary-blue)]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-blue)] mb-4"></div>
              <p>Loading mentors and advisors...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Mentors Section */}
            <section>
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-[#FF8F6B] to-[#C64B27] p-3">
                  <UsersThree size={24} weight="duotone" className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-[var(--dark-navy)]">Peer Mentors</h2>
                  <p className="text-sm text-gray-500">
                    {filteredMentors.length} of {mentors.length} mentor{mentors.length !== 1 ? "s" : ""}
                    {statusFilter !== "all" && ` (${statusFilter})`}
                  </p>
                </div>
              </div>

              {filteredMentors.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-gray-500">
                  <UsersThree size={48} weight="duotone" className="mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">No mentors found</p>
                  <p>
                    {statusFilter === "all"
                      ? "No peer mentors have been created yet."
                      : `No ${statusFilter} mentors found. Try selecting a different filter.`}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMentors.map((mentor) => (
                    <div
                      key={mentor._id}
                      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-[var(--dark-navy)] mb-1">
                            {mentor.fullName || "Unnamed Mentor"}
                          </h3>
                          <p className="text-sm text-gray-500">{mentor.email}</p>
                        </div>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          mentor.status === "assigned"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {mentor.status === "assigned" ? (
                            <CheckCircle size={14} weight="fill" />
                          ) : (
                            <XCircle size={14} weight="fill" />
                          )}
                          {mentor.status === "assigned" ? "Assigned" : "Available"}
                        </div>
                      </div>

                      <div className="space-y-2">
                        {mentor.school && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">School:</span>
                            <span className="font-medium text-[var(--dark-navy)]">{mentor.school}</span>
                          </div>
                        )}
                        {mentor.major && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">Major:</span>
                            <span className="font-medium text-[var(--dark-navy)]">{mentor.major}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500">Students:</span>
                          <span className="font-semibold text-[var(--primary-blue)]">
                            {mentor.assignedStudentsCount}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        {expandedCard === mentor._id ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold text-[var(--dark-navy)]">Assign to Student</h4>
                              <button
                                onClick={() => {
                                  setExpandedCard(null);
                                  setStudentSearchQuery((prev) => ({ ...prev, [mentor._id]: "" }));
                                  setSearchResults((prev) => ({ ...prev, [mentor._id]: [] }));
                                }}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <X size={18} weight="bold" />
                              </button>
                            </div>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlass size={16} className="text-gray-400" weight="duotone" />
                              </div>
                              <input
                                type="text"
                                value={studentSearchQuery[mentor._id] || ""}
                                onChange={(e) => {
                                  const query = e.target.value;
                                  setStudentSearchQuery((prev) => ({ ...prev, [mentor._id]: query }));
                                  if (query.trim()) {
                                    searchStudents(query, mentor._id);
                                  } else {
                                    setSearchResults((prev) => ({ ...prev, [mentor._id]: [] }));
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    searchStudents(studentSearchQuery[mentor._id] || "", mentor._id);
                                  }
                                }}
                                placeholder="Search students by name, email..."
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[var(--primary-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/20"
                              />
                            </div>
                            {isSearchingStudents[mentor._id] && (
                              <div className="text-xs text-gray-500 text-center py-2">Searching...</div>
                            )}
                            {searchResults[mentor._id] && searchResults[mentor._id].length > 0 && (
                              <div className="max-h-48 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2">
                                {searchResults[mentor._id].map((student) => (
                                  <div
                                    key={student._id}
                                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer border border-transparent hover:border-gray-200"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-[var(--dark-navy)] truncate">
                                        {student.fullName || "Unnamed Student"}
                                      </p>
                                      <p className="text-xs text-gray-500 truncate">{student.email}</p>
                                      {student.major && (
                                        <p className="text-xs text-gray-400">{student.major}</p>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => handleAssignMentor(mentor._id, student._id)}
                                      disabled={actionLoading === `assign-mentor-${mentor._id}-${student._id}`}
                                      className={`ml-3 px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                                        actionLoading === `assign-mentor-${mentor._id}-${student._id}`
                                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                          : "bg-[var(--primary-blue)] text-white hover:bg-[var(--primary-blue-light)]"
                                      }`}
                                    >
                                      {actionLoading === `assign-mentor-${mentor._id}-${student._id}` ? "Assigning..." : "Assign"}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                            {searchResults[mentor._id] && searchResults[mentor._id].length === 0 && studentSearchQuery[mentor._id] && !isSearchingStudents[mentor._id] && (
                              <div className="text-xs text-gray-500 text-center py-2">No students found</div>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => setExpandedCard(mentor._id)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-[var(--primary-blue)] border border-[var(--primary-blue)] rounded-lg hover:bg-[var(--primary-blue)] hover:text-white transition"
                          >
                            <UserPlus size={16} weight="bold" />
                            Assign to Student
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Advisors Section */}
            <section>
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-[#54C1A9] to-[#1D8B73] p-3">
                  <IdentificationBadge size={24} weight="duotone" className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-[var(--dark-navy)]">Advisors</h2>
                  <p className="text-sm text-gray-500">
                    {filteredAdvisors.length} of {advisors.length} advisor{advisors.length !== 1 ? "s" : ""}
                    {statusFilter !== "all" && ` (${statusFilter})`}
                  </p>
                </div>
              </div>

              {filteredAdvisors.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-gray-500">
                  <IdentificationBadge size={48} weight="duotone" className="mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">No advisors found</p>
                  <p>
                    {statusFilter === "all"
                      ? "No advisors have been created yet."
                      : `No ${statusFilter} advisors found. Try selecting a different filter.`}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAdvisors.map((advisor) => (
                    <div
                      key={advisor._id}
                      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-[var(--dark-navy)] mb-1">
                            {advisor.fullName || "Unnamed Advisor"}
                          </h3>
                          <p className="text-sm text-gray-500">{advisor.email}</p>
                        </div>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          advisor.status === "assigned"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {advisor.status === "assigned" ? (
                            <CheckCircle size={14} weight="fill" />
                          ) : (
                            <XCircle size={14} weight="fill" />
                          )}
                          {advisor.status === "assigned" ? "Assigned" : "Available"}
                        </div>
                      </div>

                      <div className="space-y-2">
                        {advisor.school && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">School:</span>
                            <span className="font-medium text-[var(--dark-navy)]">{advisor.school}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500">Students:</span>
                          <span className="font-semibold text-[var(--primary-blue)]">
                            {advisor.assignedStudentsCount}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        {expandedCard === advisor._id ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold text-[var(--dark-navy)]">Assign to Student</h4>
                              <button
                                onClick={() => {
                                  setExpandedCard(null);
                                  setStudentSearchQuery((prev) => ({ ...prev, [advisor._id]: "" }));
                                  setSearchResults((prev) => ({ ...prev, [advisor._id]: [] }));
                                }}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <X size={18} weight="bold" />
                              </button>
                            </div>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlass size={16} className="text-gray-400" weight="duotone" />
                              </div>
                              <input
                                type="text"
                                value={studentSearchQuery[advisor._id] || ""}
                                onChange={(e) => {
                                  const query = e.target.value;
                                  setStudentSearchQuery((prev) => ({ ...prev, [advisor._id]: query }));
                                  if (query.trim()) {
                                    searchStudents(query, advisor._id);
                                  } else {
                                    setSearchResults((prev) => ({ ...prev, [advisor._id]: [] }));
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    searchStudents(studentSearchQuery[advisor._id] || "", advisor._id);
                                  }
                                }}
                                placeholder="Search students by name, email..."
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[var(--primary-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/20"
                              />
                            </div>
                            {isSearchingStudents[advisor._id] && (
                              <div className="text-xs text-gray-500 text-center py-2">Searching...</div>
                            )}
                            {searchResults[advisor._id] && searchResults[advisor._id].length > 0 && (
                              <div className="max-h-48 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2">
                                {searchResults[advisor._id].map((student) => (
                                  <div
                                    key={student._id}
                                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer border border-transparent hover:border-gray-200"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-[var(--dark-navy)] truncate">
                                        {student.fullName || "Unnamed Student"}
                                      </p>
                                      <p className="text-xs text-gray-500 truncate">{student.email}</p>
                                      {student.major && (
                                        <p className="text-xs text-gray-400">{student.major}</p>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => handleAssignAdvisor(advisor._id, student._id)}
                                      disabled={actionLoading === `assign-advisor-${advisor._id}-${student._id}`}
                                      className={`ml-3 px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                                        actionLoading === `assign-advisor-${advisor._id}-${student._id}`
                                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                          : "bg-[var(--primary-blue)] text-white hover:bg-[var(--primary-blue-light)]"
                                      }`}
                                    >
                                      {actionLoading === `assign-advisor-${advisor._id}-${student._id}` ? "Assigning..." : "Assign"}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                            {searchResults[advisor._id] && searchResults[advisor._id].length === 0 && studentSearchQuery[advisor._id] && !isSearchingStudents[advisor._id] && (
                              <div className="text-xs text-gray-500 text-center py-2">No students found</div>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => setExpandedCard(advisor._id)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-[var(--primary-blue)] border border-[var(--primary-blue)] rounded-lg hover:bg-[var(--primary-blue)] hover:text-white transition"
                          >
                            <UserPlus size={16} weight="bold" />
                            Assign to Student
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
      
      <AdminBottomNav />
    </div>
  );
}
