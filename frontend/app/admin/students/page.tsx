"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AdminHeader } from "../../../components/layout/AdminHeader";
import { AdminBottomNav } from "../../../components/layout/AdminBottomNav";
import { adminAPI } from "../../../lib/api";
import {
  GraduationCap,
  Users,
  IdentificationBadge,
  ChartPie,
  TrendUp,
} from "@phosphor-icons/react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

type StudentSummary = {
  _id: string;
  fullName?: string;
  email: string;
  school?: string | null;
  major?: string | null;
  classification?: string | null;
  mentor?: any | null;
  advisor?: any | null;
  createdAt?: string;
};

const COLORS = ["#0345A0", "#FF8F6B", "#54C1A9", "#6B46C1", "#F59E0B", "#EF4444"];

export default function AdminStudentsAnalyticsPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    if (isAuthorized) {
      fetchStudents();
    }
  }, [isAuthorized]);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const response = await adminAPI.listStudents();
      if (response?.success) {
        setStudents(response.students ?? []);
      }
    } catch (error) {
      console.error("Failed to load students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate analytics data
  const analytics = useMemo(() => {
    const total = students.length;

    // By School
    const bySchool = students.reduce((acc, student) => {
      const school = student.school || "Unknown";
      acc[school] = (acc[school] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const schoolData = Object.entries(bySchool).map(([name, value]) => ({
      name,
      value,
    }));

    // By Classification
    const byClassification = students.reduce((acc, student) => {
      const classification = student.classification || "Unknown";
      acc[classification] = (acc[classification] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const classificationData = Object.entries(byClassification)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => {
        const order = ["Freshman", "Sophomore", "Junior", "Senior"];
        return order.indexOf(a.name) - order.indexOf(b.name);
      });

    // By Major
    const byMajor = students.reduce((acc, student) => {
      const major = student.major || "Unknown";
      acc[major] = (acc[major] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const majorData = Object.entries(byMajor)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 majors

    // Mentorship Status
    const withMentor = students.filter((s) => s.mentor).length;
    const withoutMentor = total - withMentor;
    const mentorshipData = [
      { name: "With Mentor", value: withMentor },
      { name: "Without Mentor", value: withoutMentor },
    ];

    // Advisor Status
    const withAdvisor = students.filter((s) => s.advisor).length;
    const withoutAdvisor = total - withAdvisor;
    const advisorData = [
      { name: "With Advisor", value: withAdvisor },
      { name: "Without Advisor", value: withoutAdvisor },
    ];

    // Growth over time (by month)
    const byMonth = students.reduce((acc, student) => {
      if (student.createdAt) {
        const date = new Date(student.createdAt);
        const month = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
        acc[month] = (acc[month] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    const growthData = Object.entries(byMonth)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());

    return {
      total,
      schoolData,
      classificationData,
      majorData,
      mentorshipData,
      advisorData,
      growthData,
      withMentor,
      withoutMentor,
      withAdvisor,
      withoutAdvisor,
    };
  }, [students]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[var(--dark-navy)] text-white flex items-center justify-center">
        <p className="text-lg font-medium">Verifying admin access...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F4F6FF] text-[var(--dark-navy)]">
        <AdminHeader />
        <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-8 pb-24 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-blue)] mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </main>
        <AdminBottomNav />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F6FF] text-[var(--dark-navy)]">
      <AdminHeader />
      
      <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-8 pb-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[var(--dark-navy)] mb-2 flex items-center gap-3">
            <ChartPie size={32} weight="duotone" className="text-[var(--primary-blue)]" />
            Student Analytics Dashboard
          </h1>
          <p className="text-gray-600">Comprehensive insights into student data and mentoring assignments.</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Students"
            value={analytics.total}
            icon={<GraduationCap size={24} weight="duotone" />}
            color="from-[#4A67FF] to-[#2F41AA]"
          />
          <MetricCard
            title="With Mentors"
            value={analytics.withMentor}
            subtitle={`${analytics.total > 0 ? Math.round((analytics.withMentor / analytics.total) * 100) : 0}%`}
            icon={<Users size={24} weight="duotone" />}
            color="from-[#FF8F6B] to-[#C64B27]"
          />
          <MetricCard
            title="With Advisors"
            value={analytics.withAdvisor}
            subtitle={`${analytics.total > 0 ? Math.round((analytics.withAdvisor / analytics.total) * 100) : 0}%`}
            icon={<IdentificationBadge size={24} weight="duotone" />}
            color="from-[#54C1A9] to-[#1D8B73]"
          />
          <MetricCard
            title="Unassigned"
            value={analytics.withoutMentor + analytics.withoutAdvisor}
            subtitle="Need attention"
            icon={<TrendUp size={24} weight="duotone" />}
            color="from-[#6B46C1] to-[#7C3AED]"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Students by School */}
          <ChartCard title="Students by School">
            {analytics.schoolData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.schoolData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.schoolData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                No data available
              </div>
            )}
          </ChartCard>

          {/* Students by Classification */}
          <ChartCard title="Students by Classification">
            {analytics.classificationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.classificationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0345A0" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                No data available
              </div>
            )}
          </ChartCard>

          {/* Mentorship Status */}
          <ChartCard title="Mentorship Status">
            {analytics.mentorshipData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.mentorshipData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.mentorshipData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? "#54C1A9" : "#FF8F6B"} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                No data available
              </div>
            )}
          </ChartCard>

          {/* Advisor Status */}
          <ChartCard title="Advisor Status">
            {analytics.advisorData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.advisorData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.advisorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? "#0345A0" : "#F59E0B"} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                No data available
              </div>
            )}
          </ChartCard>
        </div>

        {/* Full Width Charts */}
        <div className="grid grid-cols-1 gap-6">
          {/* Top Majors */}
          <ChartCard title="Top 10 Majors">
            {analytics.majorData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={analytics.majorData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0345A0" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-gray-400">
                No data available
              </div>
            )}
          </ChartCard>

          {/* Growth Over Time */}
          {analytics.growthData.length > 0 && (
            <ChartCard title="Student Growth Over Time">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#0345A0"
                    strokeWidth={3}
                    name="New Students"
                    dot={{ fill: "#0345A0", r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </div>
      </main>
      
      <AdminBottomNav />
    </div>
  );
}

const MetricCard = ({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
}) => (
  <div className="rounded-2xl border border-white/60 bg-white p-6 shadow-md">
    <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white`}>
      {icon}
    </div>
    <p className="text-sm uppercase tracking-[0.2em] text-gray-400">{title}</p>
    <div className="mt-2 flex items-baseline gap-2">
      <p className="text-3xl font-semibold text-[var(--dark-navy)]">{value}</p>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
  </div>
);

const ChartCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-white/70 bg-white p-6 shadow-xl">
    <h3 className="text-xl font-semibold text-[var(--dark-navy)] mb-4">{title}</h3>
    {children}
  </div>
);
