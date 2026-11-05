"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Car,
  Phone,
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LoaderCircle,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

type Method = "phone" | "email";
type PhoneStep = "phone" | "otp";
type EmailMode = "login" | "register";

// Pull a human-readable message out of a DRF error response (detail string,
// field-error arrays, or a plain string).
function extractError(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: unknown } })?.response?.data;
  if (!data) return fallback;
  if (typeof data === "string") return data;
  const obj = data as Record<string, unknown>;
  if (typeof obj.detail === "string") return obj.detail;
  const first = Object.values(obj)[0];
  if (Array.isArray(first) && first.length) return String(first[0]);
  if (typeof first === "string") return first;
  return fallback;
}

export default function AuthPage() {
  // Email/password is the primary (default) login method; phone-OTP is secondary.
  const [method, setMethod] = useState<Method>("email");

  // Phone (OTP) flow
  const [step, setStep] = useState<PhoneStep>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Email flow
  const [emailMode, setEmailMode] = useState<EmailMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuthStore();
  const router = useRouter();

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Shared post-login handling: store tokens + honor ?next= (internal only).
  const finishAuth = useCallback(
    (data: { access: string; refresh: string; user: unknown; is_new_user?: boolean }) => {
      login({ access: data.access, refresh: data.refresh }, data.user as never);
      const next =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("next")
          : null;
      const safeNext = next && next.startsWith("/") ? next : null;
      router.push(safeNext || (data.is_new_user ? "/account/profile?welcome=1" : "/"));
    },
    [login, router]
  );

  const startCountdown = () => {
    setCountdown(120);
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  // --- Phone / OTP ---------------------------------------------------------

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!phone.startsWith("09") || phone.length !== 11) {
      setError("شماره موبایل معتبر نیست");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/otp/send/", { phone });
      setStep("otp");
      startCountdown();
    } catch (err) {
      setError(extractError(err, "خطا در ارسال کد"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/otp/verify/", { phone, code: otp });
      finishAuth(data);
    } catch (err) {
      setError(extractError(err, "کد اشتباه است"));
    } finally {
      setLoading(false);
    }
  };

  // --- Email / password ----------------------------------------------------

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login/", { email, password });
      finishAuth(data);
    } catch (err) {
      setError(extractError(err, "ایمیل یا رمز عبور اشتباه است"));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("رمز عبور باید حداقل ۸ کاراکتر باشد");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register/", {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });
      finishAuth(data);
    } catch (err) {
      setError(extractError(err, "ثبت‌نام ناموفق بود"));
    } finally {
      setLoading(false);
    }
  };

  // --- Google Sign-In ------------------------------------------------------

  const handleGoogleCredential = useCallback(
    async (credential: string) => {
      setError("");
      setLoading(true);
      try {
        const { data } = await api.post("/auth/google/", { credential });
        finishAuth(data);
      } catch (err) {
        setError(extractError(err, "ورود با گوگل ناموفق بود"));
      } finally {
        setLoading(false);
      }
    },
    [finishAuth]
  );

  const renderGoogleButton = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = (window as any).google;
    const el = googleBtnRef.current;
    if (!g?.accounts?.id || !el) return;
    const width = Math.min(Math.max(el.clientWidth || 300, 200), 400);
    el.innerHTML = "";
    g.accounts.id.renderButton(el, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "pill",
      logo_alignment: "center",
      width,
    });
  }, []);

  useEffect(() => {
    if (!googleClientId) return;

    const init = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const g = (window as any).google;
      if (!g?.accounts?.id) return;
      g.accounts.id.initialize({
        client_id: googleClientId,
        callback: (resp: { credential?: string }) => {
          if (resp?.credential) handleGoogleCredential(resp.credential);
        },
      });
      renderGoogleButton();
    };

    const existing = document.getElementById("google-gsi-script");
    if (existing) {
      init();
    } else {
      const s = document.createElement("script");
      s.id = "google-gsi-script";
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.defer = true;
      s.onload = init;
      document.body.appendChild(s);
    }

    const onResize = () => renderGoogleButton();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [googleClientId, handleGoogleCredential, renderGoogleButton]);

  // Keep the Google button sized to the card when switching tabs.
  useEffect(() => {
    if (googleClientId) renderGoogleButton();
  }, [method, emailMode, step, googleClientId, renderGoogleButton]);

  const switchMethod = (m: Method) => {
    setMethod(m);
    setError("");
  };

  const showTabs = !(method === "phone" && step === "otp");

  return (
    <div className="relative min-h-screen bg-gradient-primary flex items-center justify-center p-4 overflow-hidden">
      {/* Ambient blobs + dot grid */}
      <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 animate-float" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3 animate-float" style={{ animationDelay: "2s" }} />

      <div className="relative w-full max-w-md animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
            <Car className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">مِین استوریج</h1>
          <p className="text-blue-200 text-sm mt-1">فروشگاه قطعات خودرو</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-elevated">
          {/* Method tabs */}
          {showTabs && (
            <div className="grid grid-cols-2 gap-1 bg-gray-100 rounded-xl p-1 mb-6">
              <button
                onClick={() => switchMethod("email")}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm transition-colors ${
                  method === "email" ? "bg-white text-[#1e3a8a] font-bold shadow-soft" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Mail className="w-4 h-4" /> ایمیل
              </button>
              <button
                onClick={() => switchMethod("phone")}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm transition-colors ${
                  method === "phone" ? "bg-white text-[#1e3a8a] font-bold shadow-soft" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Phone className="w-4 h-4" /> موبایل
              </button>
            </div>
          )}

          {/* PHONE / OTP */}
          {method === "phone" ? (
            step === "phone" ? (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-1">ورود / ثبت‌نام</h2>
                <p className="text-gray-500 text-sm mb-6">شماره موبایل خود را وارد کنید</p>
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">شماره موبایل</label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        placeholder="09xxxxxxxxx"
                        maxLength={11}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3.5 pr-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] ltr text-center tracking-widest"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading || phone.length < 11}
                    className="w-full bg-gradient-primary hover:brightness-110 disabled:opacity-60 text-white py-4 rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-2"
                  >
                    {loading && <LoaderCircle className="w-5 h-5 animate-spin" />}
                    {loading ? "در حال ارسال..." : "دریافت کد تایید"}
                  </button>
                </form>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setStep("phone"); setOtp(""); setError(""); }}
                  className="text-sm text-gray-500 hover:text-gray-800 mb-4 flex items-center gap-1"
                >
                  ← تغییر شماره
                </button>
                <h2 className="text-xl font-bold text-gray-900 mb-1">کد تایید</h2>
                <p className="text-gray-500 text-sm mb-6">
                  کد ۶ رقمی ارسال شده به <span className="font-mono font-bold text-gray-800 ltr">{phone}</span> را وارد کنید
                </p>
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <input
                    type="tel"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="- - - - - -"
                    maxLength={6}
                    autoFocus
                    className="w-full border-2 border-gray-200 focus:border-[#1e3a8a] rounded-xl px-4 py-4 text-gray-900 text-center tracking-[0.5em] text-xl font-mono focus:outline-none transition-colors"
                    dir="ltr"
                  />
                  {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className="w-full bg-gradient-primary hover:brightness-110 disabled:opacity-60 text-white py-4 rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-2"
                  >
                    {loading && <LoaderCircle className="w-5 h-5 animate-spin" />}
                    {loading ? "در حال بررسی..." : "تایید و ورود"}
                  </button>
                  <div className="text-center">
                    {countdown > 0 ? (
                      <p className="text-gray-400 text-sm">
                        ارسال مجدد کد تا <span className="font-mono font-bold text-gray-700">{countdown}</span> ثانیه دیگر
                      </p>
                    ) : (
                      <button type="button" onClick={handleSendOTP} className="text-[#1e3a8a] hover:text-blue-800 text-sm font-medium">
                        ارسال مجدد کد
                      </button>
                    )}
                  </div>
                </form>
              </>
            )
          ) : (
            /* EMAIL login / register */
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {emailMode === "login" ? "ورود با ایمیل" : "ساخت حساب کاربری"}
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                {emailMode === "login" ? "ایمیل و رمز عبور خود را وارد کنید" : "برای ثبت‌نام اطلاعات زیر را تکمیل کنید"}
              </p>

              <form onSubmit={emailMode === "login" ? handleEmailLogin : handleRegister} className="space-y-4">
                {emailMode === "register" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">نام</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">نام خانوادگی</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">ایمیل</label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3.5 pr-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] ltr"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">رمز عبور</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={emailMode === "register" ? "حداقل ۸ کاراکتر" : "••••••••"}
                      autoComplete={emailMode === "login" ? "current-password" : "new-password"}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3.5 pr-10 pl-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] ltr"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "پنهان کردن رمز" : "نمایش رمز"}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

                <button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="w-full bg-gradient-primary hover:brightness-110 disabled:opacity-60 text-white py-4 rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-2"
                >
                  {loading && <LoaderCircle className="w-5 h-5 animate-spin" />}
                  {loading
                    ? "لطفاً صبر کنید..."
                    : emailMode === "login"
                      ? "ورود"
                      : "ثبت‌نام"}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-4">
                {emailMode === "login" ? "حساب کاربری ندارید؟ " : "قبلاً ثبت‌نام کرده‌اید؟ "}
                <button
                  type="button"
                  onClick={() => { setEmailMode(emailMode === "login" ? "register" : "login"); setError(""); }}
                  className="text-[#1e3a8a] hover:text-blue-800 font-bold"
                >
                  {emailMode === "login" ? "ثبت‌نام" : "ورود"}
                </button>
              </p>
            </>
          )}

          {/* Google sign-in */}
          {googleClientId && (
            <>
              <div className="flex items-center gap-3 my-5">
                <div className="h-px bg-gray-200 flex-1" />
                <span className="text-xs text-gray-400">یا</span>
                <div className="h-px bg-gray-200 flex-1" />
              </div>
              <div ref={googleBtnRef} className="w-full flex justify-center min-h-[44px]" />
            </>
          )}

          <div className="flex items-center gap-2 mt-6 pt-5 border-t border-gray-100">
            <Shield className="w-4 h-4 text-green-500 shrink-0" />
            <p className="text-xs text-gray-400">اطلاعات شما محفوظ و کاملاً امن است</p>
          </div>
        </div>
      </div>
    </div>
  );
}

