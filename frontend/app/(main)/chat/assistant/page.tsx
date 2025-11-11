"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";

type Message = {
  id: string;
  sender: "assistant" | "user";
  content: string;
  timestamp: string;
};

const welcomeMessage =
  "Hi Ali! I'm your DegreePlan.AI assistant. Ask me anything about building your degree plan, understanding prerequisites, or getting the most from campus resources.";

const quickPrompts = [
  "Help me build next semester's schedule.",
  "Do I meet the prerequisites for CSIS 4201?",
  "Suggest electives that fit my AI concentration.",
];

function buildAssistantReply(userMessage: string): string {
  if (/prereq|prerequisite|eligible/i.test(userMessage)) {
    return "Let's check that! Make sure you've completed the listed prerequisite courses in the catalogue. If you're missing any, consider summer offerings or speak with your advisor about overrides.";
  }

  if (/schedule|semester|plan/i.test(userMessage)) {
    return "Balanced schedules usually combine 2-3 major courses, 1 core requirement, and 1 elective. I can draft a sample plan once you confirm the courses you want or your target credit load.";
  }

  if (/elective|recommend|suggest/i.test(userMessage)) {
    return "For AI-focused pathways, recent favorites include Machine Learning, Natural Language Processing, and Data Ethics. Remember to check availability and talk with your advisor for final approval.";
  }

  return "I've taken note. Share any constraints—credit load, prerequisites, or graduation goals—and I'll outline next steps or resources for you.";
}

function formatTimestamp() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function AssistantChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: "assistant-1",
      sender: "assistant",
      content: welcomeMessage,
      timestamp: formatTimestamp(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAssistantTyping]);

  const disableInput = useMemo(() => !inputValue.trim() || isAssistantTyping, [inputValue, isAssistantTyping]);

  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage();
  };

  const sendMessage = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: trimmed,
      timestamp: formatTimestamp(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsAssistantTyping(true);

    const replyContent = buildAssistantReply(trimmed);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          sender: "assistant",
          content: replyContent,
          timestamp: formatTimestamp(),
        },
      ]);
      setIsAssistantTyping(false);
    }, 800);
  };

  return (
    <div className="mx-auto flex min-h-full w-full max-w-xl flex-col bg-[#F4F6FF] px-6 pb-24 pt-6">
      <header className="flex items-center justify-between pb-4">
        <Link
          href="/home"
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--primary-blue)] shadow-md shadow-[rgba(18,8,75,0.08)] transition hover:-translate-y-1 hover:shadow-lg"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-[var(--primary-blue)]/70">AI Assistant</p>
          <p className="text-lg font-semibold text-[var(--dark-navy)]">DegreePlan.AI Chat</p>
        </div>
      </header>

      <section className="flex flex-1 flex-col gap-6 overflow-hidden rounded-3xl bg-white p-6 shadow-xl shadow-[rgba(18,8,75,0.08)]">
        <div className="flex flex-col gap-4 overflow-y-auto pb-2">
          {messages.map((message) => (
            <Fragment key={message.id}>
              <div
                className={`flex ${message.sender === "assistant" ? "justify-start" : "justify-end"}`}
                aria-live="polite"
              >
                <div
                  className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm leading-relaxed shadow ${
                    message.sender === "assistant"
                      ? "rounded-bl-md bg-[#E8EDFF] text-[var(--dark-navy)] shadow-[rgba(18,8,75,0.08)]"
                      : "rounded-br-md bg-[var(--primary-blue)] text-white shadow-[rgba(18,8,75,0.2)]"
                  }`}
                >
                  <p>{message.content}</p>
                  <span
                    className={`mt-2 block text-xs ${
                      message.sender === "assistant" ? "text-[var(--primary-blue)]/60" : "text-white/70"
                    }`}
                  >
                    {message.timestamp}
                  </span>
                </div>
              </div>
            </Fragment>
          ))}

          {isAssistantTyping && (
            <div className="flex justify-start">
              <div className="rounded-3xl rounded-bl-md bg-[#E8EDFF] px-4 py-3 text-sm font-medium text-[var(--primary-blue)]/90 shadow shadow-[rgba(18,8,75,0.08)]">
                <div className="flex items-center gap-2">
                  <span>Assistant is thinking</span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-[var(--primary-blue)]" />
                    <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-[var(--primary-blue)] delay-150" />
                    <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-[var(--primary-blue)] delay-300" />
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="space-y-3">
          <div className="grid gap-2 md:grid-cols-3">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handlePromptClick(prompt)}
                className="rounded-2xl border border-[var(--primary-blue)]/20 bg-[#F4F6FF] px-4 py-3 text-left text-xs font-medium text-[var(--primary-blue)] transition hover:bg-[#E8EDFF]"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex items-end gap-2 rounded-2xl bg-[#F4F6FF] p-3">
            <textarea
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              rows={2}
              placeholder="Ask a question about your degree plan, scheduling, or resources..."
              className="flex-1 resize-none rounded-2xl border border-transparent bg-white px-4 py-3 text-sm text-[var(--dark-navy)] shadow-inner focus:border-[var(--primary-blue)] focus:outline-none"
            />
            <button
              type="submit"
              disabled={disableInput}
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-blue)] text-white transition hover:bg-[var(--primary-blue-light)] disabled:cursor-not-allowed disabled:bg-[var(--primary-blue)]/60"
              aria-label="Send message"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>

          <p className="text-center text-xs text-gray-500">
            The assistant provides guidance based on academic policies but does not replace official advisor approval.
          </p>
        </div>
      </section>
    </div>
  );
}

