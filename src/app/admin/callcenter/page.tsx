"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Headset } from "lucide-react";
import api from "@/lib/api";
import type {
  CCQueueItem,
  CCStats,
  CCQueueFilter,
  CCCannedResponse,
} from "@/types";
import { cn } from "@/lib/utils";
import Queue from "@/components/callcenter/Queue";
import ConversationView from "@/components/callcenter/ConversationView";

export default function CallCenterPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<CCQueueFilter>("needs_human");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const queueQuery = useQuery<CCQueueItem[]>({
    queryKey: ["cc-queue", filter, debounced],
    queryFn: () =>
      api
        .get(
          `/callcenter/queue/?filter=${filter}&search=${encodeURIComponent(
            debounced
          )}`
        )
        .then((r) => r.data),
    refetchInterval: 7000,
  });

  const statsQuery = useQuery<CCStats>({
    queryKey: ["cc-stats"],
    queryFn: () => api.get("/callcenter/stats/").then((r) => r.data),
    refetchInterval: 10000,
  });

  const cannedQuery = useQuery<CCCannedResponse[]>({
    queryKey: ["cc-canned"],
    queryFn: () => api.get("/callcenter/canned/").then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const refreshQueue = () => {
    qc.invalidateQueries({ queryKey: ["cc-queue"] });
    qc.invalidateQueries({ queryKey: ["cc-stats"] });
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-3">
      <div className="flex items-center gap-2">
        <Headset className="w-6 h-6 text-[#1e3a8a]" />
        <div>
          <h1 className="text-xl font-black text-gray-900 leading-none">
            مرکز پشتیبانی زنده
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            مدیریت گفتگوهای مشتریان با کمک هوش مصنوعی
          </p>
        </div>
      </div>

      <div className="h-[calc(100vh-9rem)] flex rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">
        {/* Queue pane */}
        <div
          className={cn(
            "w-full md:w-80 lg:w-96 shrink-0 border-e border-gray-100",
            selectedId ? "hidden md:block" : "block"
          )}
        >
          <Queue
            items={queueQuery.data ?? []}
            stats={statsQuery.data}
            filter={filter}
            onFilter={setFilter}
            search={search}
            onSearch={setSearch}
            selectedId={selectedId}
            onSelect={setSelectedId}
            loading={queueQuery.isLoading}
            isFetching={queueQuery.isFetching}
            onRefresh={refreshQueue}
          />
        </div>

        {/* Conversation pane */}
        <div
          className={cn(
            "flex-1 min-w-0",
            selectedId ? "flex" : "hidden md:flex"
          )}
        >
          {selectedId ? (
            <ConversationView
              key={selectedId}
              conversationId={selectedId}
              canned={cannedQuery.data ?? []}
              onChanged={refreshQueue}
              onBack={() => setSelectedId(null)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300 gap-3">
              <Headset className="w-14 h-14" />
              <p className="text-sm text-gray-400">
                یک گفتگو را از صف انتخاب کنید.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
