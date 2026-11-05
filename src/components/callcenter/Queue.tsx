"use client";

import { Search, RefreshCw, Bot, Headset, Inbox } from "lucide-react";
import type { CCQueueItem, CCStats, CCQueueFilter } from "@/types";
import { cn, toPersianDigits, formatDateTime } from "@/lib/utils";
import {
  PRIORITY_LABEL,
  PRIORITY_CHIP,
  PRIORITY_BAR,
  SENTIMENT_LABEL,
  SENTIMENT_CHIP,
  TAG_LABEL,
} from "./labels";

const FILTERS: { key: CCQueueFilter; label: string; stat: keyof CCStats }[] = [
  { key: "needs_human", label: "نیازمند کارشناس", stat: "needs_human" },
  { key: "unassigned", label: "بدون کارشناس", stat: "unassigned" },
  { key: "mine", label: "من", stat: "mine" },
  { key: "all_open", label: "همه باز", stat: "open_total" },
  { key: "closed", label: "بسته‌شده", stat: "closed_today" },
];

export default function Queue({
  items,
  stats,
  filter,
  onFilter,
  search,
  onSearch,
  selectedId,
  onSelect,
  loading,
  isFetching,
  onRefresh,
}: {
  items: CCQueueItem[];
  stats?: CCStats;
  filter: CCQueueFilter;
  onFilter: (f: CCQueueFilter) => void;
  search: string;
  onSearch: (s: string) => void;
  selectedId: number | null;
  onSelect: (id: number) => void;
  loading: boolean;
  isFetching: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-gray-900 flex items-center gap-2">
            <Headset className="w-5 h-5 text-[#1e3a8a]" />
            صف پشتیبانی
          </h2>
          <button
            onClick={onRefresh}
            aria-label="بروزرسانی"
            className="p-2 rounded-lg text-gray-400 hover:text-[#f97316] transition-colors"
          >
            <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="جستجوی نام یا شماره مشتری…"
            className="w-full bg-gray-100 rounded-xl pr-9 pl-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
          {FILTERS.map((f) => {
            const count = stats?.[f.stat] ?? 0;
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => onFilter(f.key)}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "bg-[#1e3a8a] text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                )}
              >
                {f.label}
                <span
                  className={cn(
                    "min-w-[18px] rounded-full px-1 text-[10px] leading-4",
                    active ? "bg-white/20" : "bg-white text-gray-500",
                    f.key === "needs_human" && count > 0 && !active
                      ? "bg-orange-100 text-orange-600"
                      : ""
                  )}
                >
                  {toPersianDigits(count)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-3 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2 px-6 text-center">
            <Inbox className="w-10 h-10" />
            <p className="text-sm">گفتگویی در این بخش وجود ندارد.</p>
          </div>
        ) : (
          <ul>
            {items.map((it) => (
              <li key={it.id}>
                <button
                  onClick={() => onSelect(it.id)}
                  className={cn(
                    "w-full text-right flex gap-2 px-3 py-3 border-b border-gray-50 transition-colors",
                    selectedId === it.id
                      ? "bg-blue-50/70"
                      : "hover:bg-gray-50"
                  )}
                >
                  {/* priority accent */}
                  <span
                    className={cn(
                      "w-1 rounded-full shrink-0",
                      PRIORITY_BAR[it.priority]
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900 truncate">
                        {it.customer.name || it.customer.phone || "مشتری"}
                      </span>
                      {it.unread > 0 && (
                        <span className="shrink-0 bg-[#f97316] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                          {toPersianDigits(it.unread)}
                        </span>
                      )}
                      <span className="ms-auto shrink-0 text-[10px] text-gray-400">
                        {it.last_message
                          ? formatDateTime(it.last_message.created_at)
                          : ""}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {it.last_message?.role === "user" ? "" : "؟ "}
                      {it.last_message?.body || "—"}
                    </p>

                    {/* badges */}
                    <div className="flex flex-wrap items-center gap-1 mt-1.5">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] ring-1",
                          it.is_bot_handled
                            ? "bg-sky-50 text-sky-600 ring-sky-100"
                            : "bg-amber-50 text-amber-700 ring-amber-100"
                        )}
                      >
                        {it.is_bot_handled ? (
                          <Bot className="w-3 h-3" />
                        ) : (
                          <Headset className="w-3 h-3" />
                        )}
                        {it.is_bot_handled ? "دستیار" : "کارشناس"}
                      </span>

                      {it.priority !== "normal" && it.priority !== "low" && (
                        <span
                          className={cn(
                            "rounded-md px-1.5 py-0.5 text-[10px] ring-1",
                            PRIORITY_CHIP[it.priority]
                          )}
                        >
                          {PRIORITY_LABEL[it.priority]}
                        </span>
                      )}

                      {it.sentiment === "angry" && (
                        <span
                          className={cn(
                            "rounded-md px-1.5 py-0.5 text-[10px] ring-1",
                            SENTIMENT_CHIP.angry
                          )}
                        >
                          {SENTIMENT_LABEL.angry}
                        </span>
                      )}

                      {it.tag && TAG_LABEL[it.tag] && (
                        <span className="rounded-md px-1.5 py-0.5 text-[10px] ring-1 bg-gray-50 text-gray-500 ring-gray-100">
                          {TAG_LABEL[it.tag]}
                        </span>
                      )}

                      {it.assigned_agent && (
                        <span className="text-[10px] text-gray-400 truncate">
                          • {it.assigned_agent.name}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
