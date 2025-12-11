"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { chatAPI, Conversation, Contact } from "../../../lib/api";

export default function ChatPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/login");
      return;
    }

    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both conversations and assigned contacts in parallel
      const [conversationsResponse, contactsResponse] = await Promise.all([
        chatAPI.getConversations(),
        chatAPI.getAssignedContacts(),
      ]);

      if (conversationsResponse.success) {
        setConversations(conversationsResponse.conversations);
      }

      if (contactsResponse.success) {
        setContacts(contactsResponse.contacts);
      }
    } catch (err: any) {
      console.error("Failed to fetch data:", err);
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInMs / (1000 * 60));
      return minutes <= 0 ? "Just now" : `${minutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      student: "Student",
      peer_mentor: "Peer Mentor",
      advisor: "Advisor",
      fye_teacher: "FYE Teacher",
      admin: "Admin",
    };
    return roleMap[role] || role;
  };

  const getRelationshipLabel = (relationship: string) => {
    const relationshipMap: Record<string, string> = {
      advisor: "Your Advisor",
      mentor: "Your Mentor",
      student: "Student",
    };
    return relationshipMap[relationship] || relationship;
  };

  // Filter out contacts that already have conversations
  const conversationPartnerIds = new Set(conversations.map((conv) => conv.partner._id));
  const availableContacts = contacts.filter((contact) => !conversationPartnerIds.has(contact._id));

  if (loading) {
    return (
      <div className="mx-auto flex min-h-full w-full max-w-xl flex-col items-center justify-center bg-[#F4F6FF] px-6 pb-24 pt-10">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--primary-blue)] border-r-transparent"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex min-h-full w-full max-w-xl flex-col bg-[#F4F6FF] px-6 pb-24 pt-10">
        <div className="rounded-3xl bg-red-50 p-5 text-center shadow-lg">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 rounded-xl bg-[var(--primary-blue)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--primary-blue-light)]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-xl flex-col bg-[#F4F6FF] px-6 pb-24 pt-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-[var(--dark-navy)]">Chat</h1>
        <p className="text-sm text-gray-600">
          Connect with your mentor and advisor. Conversations stay synced across devices.
        </p>
      </header>

      {/* Available Contacts Section */}
      {availableContacts.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-[var(--dark-navy)]">Start a Conversation</h2>
          <div className="space-y-3">
            {availableContacts.map((contact) => (
              <div
                key={contact._id}
                className="flex items-center justify-between rounded-3xl bg-white p-5 shadow-lg shadow-[rgba(18,8,75,0.05)]"
              >
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-[var(--dark-navy)]">
                    {contact.fullName || contact.email}
                  </h3>
                  <p className="text-sm font-medium text-[var(--primary-blue)]">
                    {getRelationshipLabel(contact.relationship)}
                  </p>
                  {contact.major && (
                    <p className="mt-1 text-xs text-gray-500">
                      {contact.major} • {contact.classification}
                    </p>
                  )}
                </div>
                <Link
                  href={`/chat/${contact._id}`}
                  className="ml-4 rounded-xl bg-[var(--primary-blue)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-blue-light)]"
                >
                  Start Conversation
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Existing Conversations Section */}
      <section className={availableContacts.length > 0 ? "mt-8" : "mt-8"}>
        <h2 className="mb-4 text-lg font-semibold text-[var(--dark-navy)]">
          {conversations.length > 0 ? "Conversations" : ""}
        </h2>
        {conversations.length === 0 && availableContacts.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-center shadow-lg shadow-[rgba(18,8,75,0.05)]">
            <p className="text-gray-600">No conversations yet.</p>
            <p className="mt-2 text-sm text-gray-500">
              {contacts.length === 0
                ? "You don't have any assigned contacts yet. Contact an administrator for assistance."
                : "Start a conversation with your assigned contacts above."}
            </p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="rounded-3xl bg-white p-6 text-center shadow-lg shadow-[rgba(18,8,75,0.05)]">
            <p className="text-sm text-gray-500">No active conversations yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <Link
                key={conversation.partner._id}
                href={`/chat/${conversation.partner._id}`}
                className="block w-full rounded-3xl bg-white p-5 text-left shadow-lg shadow-[rgba(18,8,75,0.05)] transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h2 className="text-base font-semibold text-[var(--dark-navy)]">
                      {conversation.partner.fullName || conversation.partner.email}
                    </h2>
                    <p className="text-sm font-medium text-[var(--primary-blue)]">
                      {getRoleLabel(conversation.partner.role)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-xs text-gray-500">
                    <span>{formatTimestamp(conversation.lastMessageTime)}</span>
                    {conversation.unreadCount > 0 && (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary-blue)] text-xs font-semibold text-white">
                        {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-gray-600">{conversation.lastMessage}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <footer className="mt-10 rounded-3xl bg-white p-5 text-sm text-gray-500 shadow-lg shadow-[rgba(18,8,75,0.05)]">
        Looking for help? Your advisor typically replies within one business day. If you need urgent assistance,
        visit the <span className="font-semibold text-[var(--primary-blue)]">Student Success Center</span>.
      </footer>
    </div>
  );
}
