"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

const suggestedPrompts = [
  "Can you review my degree plan for prerequisites?",
  "What core classes do I still need next semester?",
  "Suggest electives that fit my schedule.",
];

export default function AssistantChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I’m your DegreePlan.AI advisor. Ask me about prerequisites, course sequencing, or planning advice and I’ll guide you.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  const isInputDisabled = useMemo(() => isSending || inputValue.trim().length === 0, [inputValue, isSending]);

  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsSending(true);

    try {
      // Placeholder response. Replace with API call to the AI backend when available.
      await new Promise((resolve) => setTimeout(resolve, 600));

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content:
          "Thanks for the question! I’m still getting fully wired into the planning tools, so for now I’ll summarize what you asked and point you to key resources. (Replace this placeholder with the live AI response.)",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-full w-full max-w-xl flex-col bg-[#F4F6FF] px-6 pb-24 pt-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-[var(--dark-navy)]">AI Academic Advisor</h1>
        <p className="text-sm text-gray-600">
          Chat with DegreePlan.AI for instant guidance about prerequisites, schedules, and program requirements.
        </p>
      </header>

      <section className="mt-6 flex flex-1 flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handlePromptClick(prompt)}
              className="rounded-full border border-[var(--primary-blue)] bg-white px-4 py-2 text-xs font-semibold text-[var(--primary-blue)] transition hover:bg-[var(--primary-blue)] hover:text-white"
              type="button"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto rounded-3xl bg-white p-5 shadow-lg shadow-[rgba(18,8,75,0.05)]">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "bg-[var(--primary-blue)] text-white"
                    : "bg-[#F4F6FF] text-[var(--dark-navy)]"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isSending && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-[#F4F6FF] px-4 py-3 text-sm text-[var(--dark-navy)]">
                Thinking&hellip;
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="sticky bottom-20 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-lg shadow-[rgba(18,8,75,0.08)]"
        >
          <textarea
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Ask about prerequisites, schedules, or planning tips..."
            className="h-20 flex-1 resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-[var(--dark-navy)] focus:border-[var(--primary-blue)] focus:outline-none"
          />
          <button
            type="submit"
            disabled={isInputDisabled}
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-blue)] text-white transition hover:bg-[var(--primary-blue-light)] disabled:cursor-not-allowed disabled:bg-gray-300"
            aria-label="Send message"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 12L20 4l-5 16-3-7-8-1z" />
            </svg>
          </button>
        </form>
      </section>
    </div>
  );
}

