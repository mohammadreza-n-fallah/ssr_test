"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  MessageCircle,
  X,
  Send,
  LoaderCircle,
  Sparkles,
  Headset,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/api";
import type { ChatMessage } from "@/types";

/**
 * Floating AI support chat. Talks to the `/chat/` endpoints (Claude-powered on
 * the backend, with a rule-based fallback). Auth-gated because conversations —
 * and the AI's order lookups — are tied to the signed-in customer.
 *
 * Sync REST + light polling (no websockets): optimistic user bubble on send,
 * then pull the authoritative messages; poll every few seconds so a human
 * agent's replies show up after an escalation.
 */
export default function ChatWidget() {
  const { isAuthenticated } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isBotHandled, setIsBotHandled] = useState(true);
  const [input, setInput] = useState("");

  const lastIdRef = useRef(0);
  const tempIdRef = useRef(-1);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    });
  };

  const loadConversation = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/chat/conversation/");
      const msgs: ChatMessage[] = data.messages || [];
      setMessages(msgs);
      setIsBotHandled(data.is_bot_handled);
      lastIdRef.current = msgs.reduce((max, m) => Math.max(max, m.id), 0);
      setLoaded(true);
      scrollToBottom();
    } catch {
      /* keep unloaded — the panel shows a retry affordance */
    } finally {
      setLoading(false);
    }
  };

  // Fetch any messages newer than what we've seen (real, server-assigned ids).
  // Drops optimistic placeholders (negative ids) once the real ones land.
  const pull = async () => {
    try {
      const { data } = await api.get(`/chat/messages/?after=${lastIdRef.current}`);
      const incoming: ChatMessage[] = data || [];
      if (incoming.length) {
        lastIdRef.current = incoming.reduce(
          (max, m) => Math.max(max, m.id),
          lastIdRef.current
        );
        setMessages((prev) => [...prev.filter((m) => m.id > 0), ...incoming]);
        scrollToBottom();
      }
    } catch {
      /* transient — next poll retries */
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setInput("");

    const optimistic: ChatMessage = {
      id: tempIdRef.current--,
      role: "user",
      role_display: "کاربر",
      body: text,
      is_read: true,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    scrollToBottom();

    setSending(true);
    try {
      const { data } = await api.post("/chat/send/", { body: text });
      if (typeof data.is_bot_handled === "boolean") setIsBotHandled(data.is_bot_handled);
      await pull();
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: tempIdRef.current--,
          role: "bot",
          role_display: "دستیار",
          body: "ارسال پیام ناموفق بود. لطفاً دوباره تلاش کنید.",
          is_read: true,
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
      scrollToBottom();
    }
  };

  const handleEscalate = async () => {
    try {
      await api.post("/chat/escalate/");
      setIsBotHandled(false);
      await pull();
    } catch {
      /* ignore — user can retry */
    }
  };

  // Load the conversation the first time the panel opens (authenticated only).
  useEffect(() => {
    if (open && isAuthenticated && !loaded && !loading) loadConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isAuthenticated]);

  // Poll for new messages while the panel is open (picks up agent replies).
  useEffect(() => {
    if (!open || !isAuthenticated || !loaded) return;
    const t = setInterval(pull, 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isAuthenticated, loaded]);

  // Floating launcher button (shown when the panel is closed).
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="گفتگو با پشتیبانی"
        className="fixed bottom-5 left-5 z-50 flex items-center gap-2 bg-gradient-accent text-white rounded-full ps-4 pe-5 py-3.5 shadow-glow hover:brightness-110 active:scale-95 transition-all animate-fade-in"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="hidden sm:inline text-sm font-semibold">پشتیبانی</span>
      </button>
    );
  }

  return (
    <div
      dir="rtl"
      className="fixed bottom-5 left-5 z-50 flex flex-col w-[calc(100vw-2.5rem)] sm:w-96 h-[70vh] max-h-[560px] bg-gray-50 rounded-3xl shadow-elevated overflow-hidden ring-1 ring-black/5 animate-fade-in"
    >
      {/* Header */}
      <div className="bg-gradient-primary text-white px-4 py-3 flex items-center gap-3 shadow-soft">
        <div className="w-10 h-10 rounded-2xl bg-white/15 ring-1 ring-white/20 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-orange-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm leading-tight">دستیار پشتیبانی مِین استوریج</div>
          <div className="text-[11px] text-blue-100/90 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            {isBotHandled ? "دستیار هوشمند • آنلاین" : "در انتظار کارشناس"}
          </div>
        </div>
        {isAuthenticated && isBotHandled && (
          <button
            onClick={handleEscalate}
            title="ارتباط با کارشناس"
            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <Headset className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={() => setOpen(false)}
          aria-label="بستن"
          className="p-2 rounded-xl hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      {!isAuthenticated ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 px-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
            <MessageCircle className="w-7 h-7 text-[#1e3a8a]" />
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            برای گفتگو با پشتیبانی لطفاً وارد حساب کاربری خود شوید.
          </p>
          <Link
            href="/auth"
            className="bg-gradient-accent text-white text-sm font-semibold rounded-xl px-5 py-2.5 shadow-glow hover:brightness-110 transition-all"
          >
            ورود / ثبت‌نام
          </Link>
        </div>
      ) : (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
            {loading && messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400">
                <LoaderCircle className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              messages.map((m) => {
                const isUser = m.role === "user";
                return (
                  <div key={m.id} className="flex">
                    <div
                      className={
                        isUser
                          ? "me-auto max-w-[85%] bg-gradient-accent text-white rounded-2xl rounded-tr-md px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words shadow-soft"
                          : m.role === "agent"
                            ? "ms-auto max-w-[85%] bg-blue-50 text-gray-800 ring-1 ring-blue-100 rounded-2xl rounded-tl-md px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words"
                            : "ms-auto max-w-[85%] bg-white text-gray-800 ring-1 ring-gray-100 rounded-2xl rounded-tl-md px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words shadow-soft"
                      }
                    >
                      {!isUser && (
                        <div className="text-[10px] font-medium text-gray-400 mb-1">
                          {m.role === "agent" ? "کارشناس" : "دستیار"}
                        </div>
                      )}
                      {m.body}
                    </div>
                  </div>
                );
              })
            )}

            {sending && isBotHandled && (
              <div className="flex">
                <div className="ms-auto bg-white ring-1 ring-gray-100 rounded-2xl rounded-tl-md px-4 py-3 shadow-soft">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {!isBotHandled && (
            <div className="px-3 py-2 bg-orange-50 text-orange-700 text-[11px] text-center border-t border-orange-100">
              گفتگو به کارشناس ارجاع داده شد. پاسخ شما به‌زودی ارسال می‌شود.
            </div>
          )}

          {/* Composer */}
          <form
            onSubmit={sendMessage}
            className="p-2.5 bg-white border-t border-gray-100 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="پیام خود را بنویسید…"
              className="flex-1 bg-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="ارسال"
              className="w-11 h-11 shrink-0 flex items-center justify-center bg-gradient-accent text-white rounded-xl shadow-glow hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {sending ? (
                <LoaderCircle className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

