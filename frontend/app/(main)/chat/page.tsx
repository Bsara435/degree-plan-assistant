"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Conversation = {
  id: string;
  advisorName: string;
  subject: string;
  lastMessage: string;
  timestamp: string;
  unread?: boolean;
};

const sampleConversations: Conversation[] = [
  {
    id: "1",
    advisorName: "Dr. Khalid Idrissi",
    subject: "Degree Audit Review",
    lastMessage: "Let's review your remaining core requirements this week.",
    timestamp: "2h ago",
    unread: true,
  },
  {
    id: "2",
    advisorName: "Prof. Sofia El Fassi",
    subject: "FYE Check-in",
    lastMessage: "Remember to register for the leadership workshop by Friday.",
    timestamp: "Yesterday",
  },
  {
    id: "3",
    advisorName: "Mentor Aya",
    subject: "Peer Mentor Support",
    lastMessage: "Happy to share my elective list if it helps!",
    timestamp: "Mon",
  },
];

export default function ChatPage() {
  const router = useRouter();
  const [conversations] = useState(sampleConversations);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="mx-auto flex min-h-full w-full max-w-xl flex-col bg-[#F4F6FF] px-6 pb-24 pt-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-[var(--dark-navy)]">Chat with Advisors</h1>
        <p className="text-sm text-gray-600">
          Connect with faculty advisors, FYE mentors, or peer supporters. Conversations stay synced across devices.
        </p>
        <Link
          href="/chat/new"
          className="mt-4 inline-flex items-center justify-center gap-2 self-start rounded-2xl bg-[var(--primary-blue)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-blue-light)]"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
          </svg>
          Start a new conversation
        </Link>
      </header>

      <section className="mt-8 space-y-4">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            className="w-full rounded-3xl bg-white p-5 text-left shadow-lg shadow-[rgba(18,8,75,0.05)] transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-[var(--dark-navy)]">
                  {conversation.advisorName}
                </h2>
                <p className="text-sm font-medium text-[var(--primary-blue)]">{conversation.subject}</p>
              </div>
              <div className="flex flex-col items-end gap-2 text-xs text-gray-500">
                <span>{conversation.timestamp}</span>
                {conversation.unread && (
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[var(--primary-blue)]" aria-hidden="true" />
                )}
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-600">{conversation.lastMessage}</p>
          </button>
        ))}
      </section>

      <footer className="mt-10 rounded-3xl bg-white p-5 text-sm text-gray-500 shadow-lg shadow-[rgba(18,8,75,0.05)]">
        Looking for help? Your advisor typically replies within one business day. If you need urgent assistance,
        visit the <span className="font-semibold text-[var(--primary-blue)]">Student Success Center</span>.
      </footer>
    </div>
  );
}


