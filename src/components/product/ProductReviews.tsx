"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ThumbsUp, BadgeCheck, MessageSquare } from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { formatDate, toPersianDigits } from "@/lib/utils";
import type { Review, RatingSummary } from "@/types";
import StarRating from "./StarRating";

interface Props {
  productId: number;
}

interface ReviewListResponse {
  results: Review[];
  count: number;
  summary?: RatingSummary;
}

export default function ProductReviews({ productId }: Props) {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const queryKey = ["reviews", productId];

  const { data, isLoading } = useQuery<ReviewListResponse>({
    queryKey,
    queryFn: () => api.get(`/reviews/product/${productId}/`).then((r) => r.data),
  });

  const reviews = data?.results ?? [];
  const summary = data?.summary ?? { average: 0, count: 0, distribution: {} };

  // --- Create review form ---
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const createReview = useMutation({
    mutationFn: () =>
      api.post("/reviews/", { product_id: productId, rating, title, comment }),
    onSuccess: () => {
      setFormSuccess("دیدگاه شما ثبت شد و پس از تایید نمایش داده می‌شود.");
      setFormError("");
      setTitle("");
      setComment("");
      setRating(5);
      setShowForm(false);
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.detail || "خطا در ثبت دیدگاه");
      setFormSuccess("");
    },
  });

  const voteReview = useMutation({
    mutationFn: (reviewId: number) =>
      api.post(`/reviews/${reviewId}/vote/`, { is_helpful: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim().length < 3) {
      setFormError("متن دیدگاه را وارد کنید");
      return;
    }
    createReview.mutate();
  };

  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-[#1e3a8a]" />
        دیدگاه‌ها و امتیازها
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Summary */}
        <div className="bg-white ring-1 ring-gray-100 shadow-soft rounded-2xl p-5 h-fit">
          <div className="text-center">
            <div className="text-4xl font-black text-gray-900">
              {toPersianDigits(summary.average.toFixed(1))}
            </div>
            <StarRating value={summary.average} size={18} className="justify-center my-2" />
            <p className="text-sm text-gray-400">
              از مجموع {toPersianDigits(summary.count)} دیدگاه
            </p>
          </div>

          <div className="mt-5 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const c = summary.distribution?.[String(star)] ?? 0;
              const pct = summary.count > 0 ? (c / summary.count) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500 w-3">{toPersianDigits(star)}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-gray-400 w-6 text-left">{toPersianDigits(c)}</span>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => {
              if (!isAuthenticated) {
                window.location.href = "/auth?next=" + window.location.pathname;
                return;
              }
              setShowForm((s) => !s);
            }}
            className="w-full mt-5 bg-gradient-primary hover:brightness-110 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            ثبت دیدگاه
          </button>
          {formSuccess && (
            <p className="text-green-600 text-xs mt-3 text-center">{formSuccess}</p>
          )}
        </div>

        {/* List + form */}
        <div className="md:col-span-2 space-y-4">
          {showForm && (
            <form
              onSubmit={submit}
              className="bg-white ring-1 ring-gray-100 shadow-soft rounded-2xl p-5 space-y-3"
            >
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">امتیاز شما</label>
                <StarRating value={rating} size={26} onChange={setRating} />
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="عنوان دیدگاه (اختیاری)"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
              />
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="تجربه خود از این محصول را بنویسید..."
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] resize-none"
              />
              {formError && <p className="text-red-500 text-sm">{formError}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={createReview.isPending}
                  className="bg-gradient-primary hover:brightness-110 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  {createReview.isPending ? "در حال ثبت..." : "ارسال دیدگاه"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 px-4 py-2.5 text-sm"
                >
                  انصراف
                </button>
              </div>
            </form>
          )}

          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-28 animate-pulse" />
            ))
          ) : reviews.length === 0 ? (
            <div className="bg-white ring-1 ring-gray-100 shadow-soft rounded-2xl p-10 text-center text-gray-400">
              هنوز دیدگاهی ثبت نشده است. اولین نفر باشید!
            </div>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white ring-1 ring-gray-100 shadow-soft rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800 text-sm">
                      {review.user_name}
                    </span>
                    {review.is_verified_purchase && (
                      <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        <BadgeCheck className="w-3.5 h-3.5" />
                        خرید تایید‌شده
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatDate(review.created_at)}
                  </span>
                </div>

                <StarRating value={review.rating} size={14} className="mb-2" />

                {review.title && (
                  <h4 className="font-bold text-gray-900 text-sm mb-1">{review.title}</h4>
                )}
                <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>

                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {review.images.map((img) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={img.id}
                        src={img.image}
                        alt={img.alt_text}
                        className="w-16 h-16 rounded-lg object-cover border border-gray-100"
                      />
                    ))}
                  </div>
                )}

                {review.admin_reply && (
                  <div className="mt-3 bg-blue-50 rounded-xl p-3 text-sm">
                    <p className="font-semibold text-[#1e3a8a] mb-1">پاسخ مِین استوریج:</p>
                    <p className="text-gray-600">{review.admin_reply}</p>
                  </div>
                )}

                <div className="mt-3 flex items-center gap-3">
                  <button
                    onClick={() => isAuthenticated && voteReview.mutate(review.id)}
                    disabled={!isAuthenticated || voteReview.isPending}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#1e3a8a] disabled:opacity-50 transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    مفید بود ({toPersianDigits(review.helpful_count)})
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

