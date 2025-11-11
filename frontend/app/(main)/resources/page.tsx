"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const resourceSections = [
  {
    id: "flowcharts",
    title: "Academic Flowcharts",
    description: "Visual pathways to help you understand course sequencing for each program.",
    documents: [
      { label: "SSE", href: "/resources/flowcharts/cs.html" },
      { label: "SBA", href: "/resources/flowcharts/sba.html" },
      { label: "SHAS", href: "/resources/flowcharts/engineering.html" },
    ],
  },
  {
    id: "catalogue",
    title: "Academic Catalogue",
    description: "Policies, course descriptions, and requirements for the current academic year.",
    documents: [
      { label: "Undergraduate Catalogue", href: "/resources/catalogue/undergraduate.html" },
      { label: "Graduate Catalogue", href: "/resources/catalogue/graduate.html" },
    ],
  },
  {
    id: "degree-plan",
    title: "Degree Plan Templates",
    description: "Editable templates to map out your personalized academic journey.",
    documents: [
      { label: "Blank Degree Plan Template", href: "/resources/degree-plan/blank.html" },
      { label: "Sample Degree Plan", href: "/resources/degree-plan/sample.html" },
    ],
  },
];

export default function ResourcesPage() {
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col gap-8 bg-[#F4F6FF] px-6 pb-24 pt-10">
      <header>
        <h1 className="text-2xl font-semibold text-[var(--dark-navy)]">Resources</h1>
        <p className="mt-2 text-sm text-gray-600">
          Everything you need to plan ahead with confidence. Save, download, or share materials with your advisors.
        </p>
      </header>

      <div className="space-y-6">
        {resourceSections.map((section) => (
          <section key={section.id} id={section.id} className="rounded-3xl bg-white p-6 shadow-lg shadow-[rgba(18,8,75,0.05)]">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-[var(--dark-navy)]">{section.title}</h2>
              <p className="mt-1 text-sm text-gray-500">{section.description}</p>
            </div>
            <ul className="space-y-3">
              {section.documents.map((doc) => (
                <li key={doc.label}>
                  <Link
                    href={doc.href}
                    target="_blank"
                    className="flex items-center justify-between rounded-2xl border border-gray-200 p-4 text-[var(--dark-navy)] transition hover:border-[var(--primary-blue)] hover:text-[var(--primary-blue)]"
                  >
                    <span className="text-sm font-medium">{doc.label}</span>
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.6}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17 17 7M9 7h8v8" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}


