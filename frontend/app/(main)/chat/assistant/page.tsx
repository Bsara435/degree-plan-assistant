"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { FileText, CheckCircle, AlertTriangle, X, UploadCloud } from "lucide-react";
import { sendAdvisingRequest } from "../../../../lib/api"; 

type Message = {
  id: string;
  sender: "assistant" | "user";
  content: string;
  timestamp: string;
  isError?: boolean;
};

const welcomeMessage =
  "Hi Ali! I'm your DegreePlan.AI assistant. Please **upload your transcript PDF** so I can review your academic history.";

const quickPrompts = [
  "Help me build next semester's schedule.",
  "Do I meet the prerequisites for CSIS 4201?",
  "Suggest electives that fit my AI concentration.",
];

function formatTimestamp() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function AssistantChatPage() {
  const router = useRouter();

  // --- Chat State ---
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "assistant-1",
      sender: "assistant",
      content: welcomeMessage,
      timestamp: formatTimestamp(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);

  // --- Transcript State ---
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
  const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(false);
  
  const endRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // --- Effects ---
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) router.replace("/login");
  }, [router]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAssistantTyping]);

  const disableInput = useMemo(() => !inputValue.trim() || isAssistantTyping, [inputValue, isAssistantTyping]);

  // --- Handlers ---
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Please upload a valid PDF file.");
      return;
    }
    setTranscriptFile(file);
  };

  const handlePromptClick = (prompt: string) => {
    if (isAssistantTyping) return;
    setInputValue(prompt);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage();
  };

  const sendMessage = async (overrideContent?: string) => {
    const contentToSend = overrideContent || inputValue.trim();
    if (!contentToSend) return;

    if (!transcriptFile) {
      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          sender: "user",
          content: contentToSend,
          timestamp: formatTimestamp(),
        },
        {
          id: `assistant-error-${Date.now()}`,
          sender: "assistant",
          content: "⚠️ **Transcript Missing:** Please upload your PDF transcript first.",
          timestamp: formatTimestamp(),
          isError: true,
        },
      ]);
      setInputValue("");
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: "user",
        content: contentToSend,
        timestamp: formatTimestamp(),
      },
    ]);
    
    setInputValue("");
    setIsAssistantTyping(true);

    // --- DEBUGGING START ---
    try {
      console.log("🚀 STEP 1: Sending Request to API...");
      
      const rawResponse = await sendAdvisingRequest(contentToSend, transcriptFile);
      
      console.log("✅ STEP 2: API Returned:", rawResponse);
      console.log("   Type of response:", typeof rawResponse);

      // --- INLINE CLEANING LOGIC (Forcing execution) ---
      let finalText = "";
      let isSuccess = true;

      // Logic A: It's an Object with 'analysis'
      if (typeof rawResponse === "object" && rawResponse !== null) {
        if (rawResponse.analysis) {
           finalText = typeof rawResponse.analysis === "string" 
             ? rawResponse.analysis 
             : JSON.stringify(rawResponse.analysis);
           isSuccess = rawResponse.success !== false;
           console.log("🧹 STEP 3: Extracted 'analysis' key.");
        } else {
           // Fallback if object but no 'analysis'
           finalText = JSON.stringify(rawResponse, null, 2);
           console.log("⚠️ STEP 3: Object has no 'analysis' key. Using full JSON.");
        }
      } 
      // Logic B: It's a String (Maybe JSON string?)
      else if (typeof rawResponse === "string") {
        console.log("🧹 STEP 3: Response is a string. Attempting to clean...");
        let trimmed = rawResponse.trim();
        
        // Remove Markdown blocks
        trimmed = trimmed.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "");
        
        // Try parsing JSON
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
          try {
            const parsed = JSON.parse(trimmed);
            if (parsed.analysis) {
               finalText = parsed.analysis;
               isSuccess = parsed.success !== false;
               console.log("✨ STEP 4: Successfully parsed JSON string!");
            } else {
               finalText = trimmed; 
            }
          } catch (e) {
            console.log("❌ STEP 4: JSON Parse failed (it might just be text). Using raw text.");
            finalText = trimmed;
          }
        } else {
           finalText = trimmed;
        }
      } 
      // Logic C: Unknown
      else {
        finalText = String(rawResponse);
      }

      console.log("🏁 STEP 5: Final Text to Display:", finalText);

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          sender: "assistant",
          content: finalText,
          timestamp: formatTimestamp(),
          isError: !isSuccess,
        },
      ]);
    } catch (err) {
      console.error("🔥 ERROR CAUGHT IN COMPONENT:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-fail-${Date.now()}`,
          sender: "assistant",
          content: "**System Error:** Connection failed. Check console for details.",
          timestamp: formatTimestamp(),
          isError: true,
        },
      ]);
    } finally {
      setIsAssistantTyping(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-full w-full max-w-xl flex-col bg-[#F4F6FF] px-6 pb-24 pt-6 relative">
      
      {/* Header */}
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
        
        <button
          onClick={() => setIsTranscriptModalOpen(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all shadow-md ${
            transcriptFile
              ? "bg-green-100 text-green-700 border border-green-200"
              : "bg-amber-100 text-amber-700 border border-amber-200 animate-pulse"
          }`}
        >
          {transcriptFile ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {transcriptFile ? "PDF Loaded" : "Upload PDF"}
        </button>
      </header>

      {/* Chat Section */}
      <section className="flex flex-1 flex-col gap-6 overflow-hidden rounded-3xl bg-white p-6 shadow-xl shadow-[rgba(18,8,75,0.08)]">
        <div className="flex flex-col gap-4 overflow-y-auto pb-2 px-2">
          {messages.map((message) => (
            <Fragment key={message.id}>
              <div
                className={`flex w-full ${message.sender === "assistant" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`
                    relative max-w-[90%] rounded-3xl px-5 py-4 text-sm leading-relaxed shadow-sm
                    min-w-0 
                    ${message.sender === "assistant"
                      ? message.isError
                        ? "rounded-bl-md bg-red-50 text-red-800 border border-red-100"
                        : "rounded-bl-md bg-[#E8EDFF] text-[var(--dark-navy)]"
                      : "rounded-br-md bg-[var(--primary-blue)] text-white"
                    }
                  `}
                >
                  <div className="prose prose-sm max-w-none break-words whitespace-pre-wrap overflow-hidden">
                    <ReactMarkdown
                      components={{
                         strong: ({node, ...props}) => <span className="font-bold" {...props} />,
                         ul: ({node, ...props}) => <ul className="list-disc pl-4 space-y-1 my-2" {...props} />,
                         li: ({node, ...props}) => <li className="pl-1" {...props} />,
                         h2: ({node, ...props}) => <h2 className="text-base font-bold mt-4 mb-2 border-b border-gray-300/30 pb-1" {...props} />,
                         h3: ({node, ...props}) => <h3 className="text-sm font-bold mt-3 text-[var(--primary-blue)]" {...props} />,
                         p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  
                  <span className={`mt-2 block text-[10px] opacity-70 text-right`}>
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
                  <span>Thinking...</span>
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

        {/* Input Area */}
        <div className="space-y-3">
          <div className="grid gap-2 md:grid-cols-3">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handlePromptClick(prompt)}
                className="rounded-2xl border border-[var(--primary-blue)]/20 bg-[#F4F6FF] px-3 py-2 text-left text-[11px] font-medium text-[var(--primary-blue)] transition hover:bg-[#E8EDFF] truncate"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex items-end gap-2 rounded-2xl bg-[#F4F6FF] p-3">
            <textarea
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              rows={2}
              placeholder={transcriptFile ? "Ask a question..." : "Upload PDF first..."}
              className="flex-1 resize-none rounded-2xl border border-transparent bg-white px-4 py-3 text-sm text-[var(--dark-navy)] shadow-inner focus:border-[var(--primary-blue)] focus:outline-none"
            />
            <button
              type="submit"
              disabled={disableInput}
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-blue)] text-white transition hover:bg-[var(--primary-blue-light)] disabled:cursor-not-allowed disabled:bg-[var(--primary-blue)]/60"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>
        </div>
      </section>

      {/* PDF Upload Modal */}
      {isTranscriptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--dark-navy)]/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-[#F4F6FF]">
              <h3 className="font-bold text-[var(--dark-navy)] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[var(--primary-blue)]" />
                Upload Transcript
              </h3>
              <button onClick={() => setIsTranscriptModalOpen(false)} className="text-gray-400 hover:text-[var(--primary-blue)]">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 flex flex-col items-center justify-center space-y-4">
              <input
                type="file"
                accept="application/pdf"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />

              {!transcriptFile ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-48 border-2 border-dashed border-[var(--primary-blue)]/30 bg-blue-50/50 hover:bg-blue-50 hover:border-[var(--primary-blue)] rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all"
                >
                  <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                    <UploadCloud className="w-8 h-8 text-[var(--primary-blue)]" />
                  </div>
                  <p className="text-sm font-semibold text-[var(--dark-navy)]">Click to Upload PDF</p>
                  <p className="text-xs text-gray-500 mt-1">Supported file: .pdf</p>
                </div>
              ) : (
                <div className="w-full h-48 border-2 border-solid border-green-200 bg-green-50 rounded-2xl flex flex-col items-center justify-center">
                  <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-sm font-bold text-green-800">Ready to Analyze</p>
                  <p className="text-xs text-green-700 mt-1">{transcriptFile.name}</p>
                  <button 
                    onClick={() => setTranscriptFile(null)} 
                    className="mt-4 text-xs underline text-green-700 hover:text-green-900"
                  >
                    Remove File
                  </button>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-100 bg-white flex justify-end gap-3">
              <button
                onClick={() => setIsTranscriptModalOpen(false)}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-[var(--primary-blue)] hover:bg-[var(--primary-blue)]/90 rounded-xl shadow-lg transition-all"
              >
                {transcriptFile ? "Save" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}