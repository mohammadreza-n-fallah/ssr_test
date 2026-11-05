"use client";

import { useEffect, useRef, useState } from "react";
import {
  Send,
  LoaderCircle,
  Sparkles,
  FileText,
  MessageSquareText,
  CornerUpLeft,
  CheckCheck,
  Headset,
  Bot,
  UserPlus,
  ArrowRight,
  RotateCcw,
  X,
} from "lucide-react";
import api from "@/lib/api";
import type {
  CCConversationDetail,
  CCCannedResponse,
  CCPriority,
  ChatMessage,
} from "@/types";
import { cn, toPersianDigits, formatDateTime } from "@/lib/utils";
import CustomerPanel from "./CustomerPanel";

export default function ConversationView({
  conversationId,
  canned,
  onChanged,
  onBack,
}: {
  conversationId: number;
  canned: CCCannedResponse[];
  onChanged: () => void;
  onBack?: () => void;
}) {
  const [detail, setDetail] = useState<CCConversationDetail | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [busy, setBusy] = useState<string | null>(null); // claim/close/return…
  const [suggesting, setSuggesting] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [cannedOpen, setCannedOpen] = useState(false);

  const lastIdRef = useRef(0);
  const tempIdRef = useRef(-1);
  const scrollRef = useRef<HTMLDivElement>(null);

  const aiEnabled = detail?.ai_enabled ?? false;
  const isClosed = detail?.status === "closed";

  const scrollToBottom = () =>
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    });

  const patchDetail = (partial: Partial<CCConversationDetail>) =>
    setDetail((d) => (d ? { ...d, ...partial } : d));

  // Load the conversation when the selection changes.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setDetail(null);
    setMessages([]);
    setInput("");
    setSummary(null);
    setCannedOpen(false);
    lastIdRef.current = 0;

    (async () => {
      try {
        const { data } = await api.get<CCConversationDetail>(
          `/callcenter/conversations/${conversationId}/`
        );
        if (cancelled) return;
        setDetail(data);
        setMessages(data.messages);
        setSummary(data.meta.ai_summary || null);
        lastIdRef.current = data.messages.reduce(
          (m, x) => Math.max(m, x.id),
          0
        );
        scrollToBottom();
        onChanged(); // unread count just dropped
      } catch {
        /* leave loading=false with no detail -> error state */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  // Poll for new messages (customer replies while the agent is reading).
  const pull = async () => {
    try {
      const { data } = await api.get<ChatMessage[]>(
        `/callcenter/conversations/${conversationId}/messages/?after=${lastIdRef.current}`
      );
      if (data.length) {
        lastIdRef.current = data.reduce(
          (m, x) => Math.max(m, x.id),
          lastIdRef.current
        );
        setMessages((prev) => [...prev.filter((m) => m.id > 0), ...data]);
        scrollToBottom();
      }
    } catch {
      /* transient */
    }
  };

  useEffect(() => {
    if (loading || !detail) return;
    const t = setInterval(pull, 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, detail, conversationId]);

  const sendReply = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    const optimistic: ChatMessage = {
      id: tempIdRef.current--,
      role: "agent",
      role_display: "کارشناس",
      body: text,
      is_read: true,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    scrollToBottom();
    setSending(true);
    try {
      await api.post(`/callcenter/conversations/${conversationId}/reply/`, {
        body: text,
      });
      // Replying takes the conversation off the bot + assigns it.
      patchDetail({ is_bot_handled: false });
      await pull();
      onChanged();
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const action = async (
    path: string,
    patch: Partial<CCConversationDetail>,
    key: string
  ) => {
    setBusy(key);
    try {
      await api.post(`/callcenter/conversations/${conversationId}/${path}/`);
      patchDetail(patch);
      if (path === "return-to-bot") await pull();
      onChanged();
    } catch {
      /* ignore */
    } finally {
      setBusy(null);
    }
  };

  const suggest = async () => {
    if (!aiEnabled || suggesting) return;
    setSuggesting(true);
    try {
      const { data } = await api.post(
        `/callcenter/conversations/${conversationId}/ai/suggest/`
      );
      if (data.draft) setInput(data.draft);
    } catch {
      /* ignore */
    } finally {
      setSuggesting(false);
    }
  };

  const summarize = async () => {
    if (!aiEnabled || summarizing) return;
    setSummarizing(true);
    try {
      const { data } = await api.post(
        `/callcenter/conversations/${conversationId}/ai/summarize/`
      );
      if (data.summary) setSummary(data.summary);
    } catch {
      /* ignore */
    } finally {
      setSummarizing(false);
    }
  };

  const analyze = async () => {
    if (!aiEnabled || analyzing) return;
    setAnalyzing(true);
    try {
      const { data } = await api.post(
        `/callcenter/conversations/${conversationId}/ai/analyze/`
      );
      if (data.meta) patchDetail({ meta: data.meta });
      onChanged();
    } catch {
      /* ignore */
    } finally {
      setAnalyzing(false);
    }
  };

  const setPriority = async (p: CCPriority) => {
    if (!detail) return;
    const prev = detail.meta;
    patchDetail({ meta: { ...prev, priority: p } });
    try {
      const { data } = await api.post(
        `/callcenter/conversations/${conversationId}/meta/`,
        { priority: p }
      );
      patchDetail({ meta: data });
      onChanged();
    } catch {
      patchDetail({ meta: prev });
    }
  };

  const addNote = async (body: string) => {
    setAddingNote(true);
    try {
      const { data } = await api.post(
        `/callcenter/conversations/${conversationId}/notes/`,
        { body }
      );
      patchDetail({ notes: [data, ...(detail?.notes ?? [])] });
    } catch {
      /* ignore */
    } finally {
      setAddingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-300">
        <LoaderCircle className="w-7 h-7 animate-spin" />
      </div>
    );
  }
  if (!detail) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        خطا در بارگذاری گفتگو.
      </div>
    );
  }

  const botHandled = detail.is_bot_handled;

  return (
    <div className="flex h-full min-w-0">
      {/* Thread + composer */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-4 py-2.5 flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="lg:hidden p-1.5 -ms-1.5 text-gray-400 hover:text-gray-700"
              aria-label="بازگشت"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm text-gray-900 truncate">
              {detail.customer.name || detail.customer.phone || "مشتری"}
            </div>
            <div className="text-[11px] flex items-center gap-1.5 mt-0.5">
              <span
                className={cn(
                  "inline-flex items-center gap-1",
                  botHandled ? "text-sky-600" : "text-amber-600"
                )}
              >
                {botHandled ? (
                  <Bot className="w-3 h-3" />
                ) : (
                  <Headset className="w-3 h-3" />
                )}
                {botHandled
                  ? "در حال پاسخ‌گویی دستیار"
                  : detail.assigned_agent
                    ? `کارشناس: ${detail.assigned_agent.name}`
                    : "در انتظار کارشناس"}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {botHandled ? (
              <button
                onClick={() =>
                  action("claim", { is_bot_handled: false }, "claim")
                }
                disabled={busy === "claim"}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#1e3a8a] text-white text-xs font-medium px-3 py-1.5 hover:brightness-110 disabled:opacity-50 transition-all"
              >
                {busy === "claim" ? (
                  <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <UserPlus className="w-3.5 h-3.5" />
                )}
                تحویل گفتگو
              </button>
            ) : (
              <button
                onClick={() =>
                  action(
                    "return-to-bot",
                    { is_bot_handled: true, assigned_agent: null },
                    "return"
                  )
                }
                disabled={busy === "return"}
                title="بازگرداندن به دستیار هوشمند"
                className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1.5 hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                {busy === "return" ? (
                  <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CornerUpLeft className="w-3.5 h-3.5" />
                )}
                به دستیار
              </button>
            )}

            {isClosed ? (
              <button
                onClick={() =>
                  action("reopen", { status: "open" }, "reopen")
                }
                disabled={busy === "reopen"}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1.5 hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                بازگشایی
              </button>
            ) : (
              <button
                onClick={() =>
                  action("close", { status: "closed" }, "close")
                }
                disabled={busy === "close"}
                title="بستن گفتگو"
                className="inline-flex items-center gap-1.5 rounded-lg text-gray-400 text-xs font-medium px-2.5 py-1.5 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>

        {/* AI summary banner */}
        {summary && (
          <div className="bg-blue-50/70 border-b border-blue-100 px-4 py-2.5 flex gap-2 text-xs text-blue-900">
            <Sparkles className="w-4 h-4 text-[#1e3a8a] shrink-0 mt-0.5" />
            <p className="flex-1 leading-relaxed whitespace-pre-wrap">
              {summary}
            </p>
            <button
              onClick={() => setSummary(null)}
              className="text-blue-300 hover:text-blue-600 shrink-0"
              aria-label="بستن خلاصه"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((m) => {
            const isCustomer = m.role === "user";
            return (
              <div key={m.id} className="flex flex-col">
                <div
                  className={cn(
                    "max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words",
                    isCustomer
                      ? "me-auto bg-white ring-1 ring-gray-200 text-gray-800 rounded-tr-md"
                      : m.role === "agent"
                        ? "ms-auto bg-[#1e3a8a] text-white rounded-tl-md"
                        : "ms-auto bg-white ring-1 ring-gray-200 text-gray-500 rounded-tl-md"
                  )}
                >
                  {m.body}
                </div>
                <span
                  className={cn(
                    "text-[10px] text-gray-400 mt-1",
                    isCustomer ? "me-auto" : "ms-auto"
                  )}
                >
                  {m.role_display} • {formatDateTime(m.created_at)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Composer */}
        {isClosed ? (
          <div className="bg-white border-t border-gray-100 px-4 py-3 text-center text-xs text-gray-400">
            این گفتگو بسته شده است. برای ادامه، آن را بازگشایی کنید.
          </div>
        ) : (
          <div className="bg-white border-t border-gray-100 p-2.5">
            {/* AI + canned toolbar */}
            <div className="flex items-center gap-1.5 mb-2 relative">
              <ToolButton
                onClick={suggest}
                disabled={!aiEnabled || suggesting}
                loading={suggesting}
                icon={Sparkles}
                label="پیشنهاد پاسخ"
                title={
                  aiEnabled ? "پیش‌نویس پاسخ با هوش مصنوعی" : "هوش مصنوعی غیرفعال"
                }
              />
              <ToolButton
                onClick={summarize}
                disabled={!aiEnabled || summarizing}
                loading={summarizing}
                icon={FileText}
                label="خلاصه"
                title={aiEnabled ? "خلاصه‌ی گفتگو" : "هوش مصنوعی غیرفعال"}
              />
              <ToolButton
                onClick={() => setCannedOpen((o) => !o)}
                icon={MessageSquareText}
                label="پاسخ آماده"
                title="درج پاسخ آماده"
              />
              {cannedOpen && (
                <div className="absolute bottom-full mb-2 right-0 z-10 w-72 max-h-64 overflow-y-auto bg-white rounded-xl shadow-elevated ring-1 ring-black/5 p-1.5">
                  {canned.length === 0 ? (
                    <p className="text-xs text-gray-400 p-3 text-center">
                      پاسخ آماده‌ای موجود نیست.
                    </p>
                  ) : (
                    canned.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setInput((v) => (v ? v + "\n" : "") + c.body);
                          setCannedOpen(false);
                        }}
                        className="w-full text-right rounded-lg px-2.5 py-2 hover:bg-gray-50 transition-colors"
                      >
                        <div className="text-xs font-bold text-gray-800">
                          {c.title}
                        </div>
                        <div className="text-[11px] text-gray-400 truncate">
                          {c.body}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <form onSubmit={sendReply} className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendReply();
                  }
                }}
                rows={1}
                placeholder="پاسخ خود را بنویسید…"
                className="flex-1 resize-none max-h-32 bg-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                aria-label="ارسال"
                className="shrink-0 w-11 h-11 flex items-center justify-center bg-gradient-accent text-white rounded-xl shadow-glow hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
              >
                {sending ? (
                  <LoaderCircle className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Customer panel (desktop) */}
      <aside className="hidden lg:block w-80 shrink-0 border-s border-gray-100">
        <CustomerPanel
          detail={detail}
          aiEnabled={aiEnabled}
          analyzing={analyzing}
          onAnalyze={analyze}
          onSetPriority={setPriority}
          onAddNote={addNote}
          addingNote={addingNote}
        />
      </aside>
    </div>
  );
}

function ToolButton({
  onClick,
  disabled,
  loading,
  icon: Icon,
  label,
  title,
}: {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon: typeof Sparkles;
  label: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="inline-flex items-center gap-1 rounded-lg bg-gray-100 text-gray-600 text-[11px] font-medium px-2.5 py-1.5 hover:bg-blue-50 hover:text-[#1e3a8a] disabled:opacity-40 disabled:hover:bg-gray-100 disabled:hover:text-gray-600 transition-colors"
    >
      {loading ? (
        <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Icon className="w-3.5 h-3.5" />
      )}
      {label}
    </button>
  );
}
