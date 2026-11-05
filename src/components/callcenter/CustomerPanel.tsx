"use client";

import { useState } from "react";
import {
  Phone,
  BadgeCheck,
  Package,
  Car,
  ClipboardList,
  Wand2,
  Gauge,
  LoaderCircle,
  CircleUserRound,
  Plus,
} from "lucide-react";
import type { CCConversationDetail, CCPriority } from "@/types";
import { cn, formatPriceToman, toPersianDigits, formatDate } from "@/lib/utils";
import {
  PRIORITY_LABEL,
  PRIORITY_OPTIONS,
  PRIORITY_CHIP,
  SENTIMENT_LABEL,
  SENTIMENT_CHIP,
  TAG_LABEL,
} from "./labels";

function Section({
  title,
  icon: Icon,
  children,
  action,
}: {
  title: string;
  icon: typeof Package;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="px-4 py-3 border-b border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5" />
          {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function CustomerPanel({
  detail,
  aiEnabled,
  analyzing,
  onAnalyze,
  onSetPriority,
  onAddNote,
  addingNote,
}: {
  detail: CCConversationDetail;
  aiEnabled: boolean;
  analyzing: boolean;
  onAnalyze: () => void;
  onSetPriority: (p: CCPriority) => void;
  onAddNote: (body: string) => void;
  addingNote: boolean;
}) {
  const { customer, meta, notes } = detail;
  const [noteText, setNoteText] = useState("");

  const submitNote = () => {
    const t = noteText.trim();
    if (!t || addingNote) return;
    onAddNote(t);
    setNoteText("");
  };

  return (
    <div className="h-full overflow-y-auto bg-white">
      {/* Triage */}
      <Section
        title="اولویت‌بندی"
        icon={Gauge}
        action={
          <button
            onClick={onAnalyze}
            disabled={!aiEnabled || analyzing}
            title={aiEnabled ? "تحلیل با هوش مصنوعی" : "هوش مصنوعی پیکربندی نشده"}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1e3a8a] hover:text-[#f97316] disabled:text-gray-300 transition-colors"
          >
            {analyzing ? (
              <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Wand2 className="w-3.5 h-3.5" />
            )}
            تحلیل هوشمند
          </button>
        }
      >
        <div className="flex gap-1 mb-2">
          {PRIORITY_OPTIONS.map((p) => (
            <button
              key={p}
              onClick={() => onSetPriority(p)}
              className={cn(
                "flex-1 rounded-lg py-1 text-[11px] font-medium ring-1 transition-colors",
                meta.priority === p
                  ? PRIORITY_CHIP[p]
                  : "bg-white text-gray-400 ring-gray-200 hover:bg-gray-50"
              )}
            >
              {PRIORITY_LABEL[p]}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-[11px] ring-1",
              SENTIMENT_CHIP[meta.sentiment]
            )}
          >
            حال‌وهوا: {SENTIMENT_LABEL[meta.sentiment]}
          </span>
          {meta.tag && TAG_LABEL[meta.tag] && (
            <span className="rounded-md px-2 py-0.5 text-[11px] ring-1 bg-gray-50 text-gray-600 ring-gray-200">
              {TAG_LABEL[meta.tag]}
            </span>
          )}
        </div>
      </Section>

      {/* Customer identity */}
      <Section title="مشتری" icon={CircleUserRound}>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="font-bold text-gray-900 text-sm">
            {customer.name || "بدون نام"}
          </span>
          {customer.is_verified && (
            <BadgeCheck className="w-4 h-4 text-emerald-500" />
          )}
        </div>
        <div className="space-y-1 text-xs text-gray-500">
          {customer.phone && (
            <div className="flex items-center gap-1.5 ltr justify-end">
              <span>{toPersianDigits(customer.phone)}</span>
              <Phone className="w-3 h-3" />
            </div>
          )}
          {customer.email && (
            <div className="ltr text-right truncate">{customer.email}</div>
          )}
          {customer.joined && (
            <div>عضویت از {toPersianDigits(formatDate(customer.joined))}</div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="rounded-lg bg-gray-50 p-2 text-center">
            <div className="text-sm font-bold text-gray-900">
              {toPersianDigits(customer.order_count)}
            </div>
            <div className="text-[10px] text-gray-400">سفارش</div>
          </div>
          <div className="rounded-lg bg-gray-50 p-2 text-center">
            <div className="text-sm font-bold text-[#1e3a8a]">
              {formatPriceToman(customer.total_spent)}
            </div>
            <div className="text-[10px] text-gray-400">مجموع خرید (تومان)</div>
          </div>
        </div>
      </Section>

      {/* Recent orders */}
      <Section title="سفارش‌های اخیر" icon={Package}>
        {customer.recent_orders.length === 0 ? (
          <p className="text-xs text-gray-400">سفارشی ثبت نشده است.</p>
        ) : (
          <ul className="space-y-1.5">
            {customer.recent_orders.map((o) => (
              <li
                key={o.order_number}
                className="flex items-center justify-between text-xs"
              >
                <span className="ltr font-medium text-gray-700">
                  {o.order_number}
                </span>
                <span className="text-gray-400">{o.status}</span>
                <span className="font-bold text-gray-800">
                  {formatPriceToman(o.total)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Vehicles */}
      {customer.vehicles.length > 0 && (
        <Section title="خودروهای مشتری" icon={Car}>
          <ul className="space-y-1">
            {customer.vehicles.map((v) => (
              <li key={v.id} className="text-xs text-gray-600">
                {v.brand} {v.model}
                {v.year ? ` • ${toPersianDigits(v.year)}` : ""}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Internal notes */}
      <Section title="یادداشت‌های داخلی" icon={ClipboardList}>
        <div className="flex gap-1.5 mb-2">
          <input
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitNote();
            }}
            placeholder="یادداشت برای تیم…"
            className="flex-1 bg-gray-100 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button
            onClick={submitNote}
            disabled={addingNote || !noteText.trim()}
            aria-label="افزودن یادداشت"
            className="shrink-0 w-8 h-8 flex items-center justify-center bg-[#1e3a8a] text-white rounded-lg hover:brightness-110 disabled:opacity-40 transition-all"
          >
            {addingNote ? (
              <LoaderCircle className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
        </div>
        {notes.length === 0 ? (
          <p className="text-xs text-gray-400">یادداشتی ثبت نشده است.</p>
        ) : (
          <ul className="space-y-2">
            {notes.map((n) => (
              <li
                key={n.id}
                className="rounded-lg bg-amber-50 ring-1 ring-amber-100 p-2 text-xs text-gray-700"
              >
                <p className="whitespace-pre-wrap break-words">{n.body}</p>
                <div className="text-[10px] text-amber-700/70 mt-1">
                  {n.author_name}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
