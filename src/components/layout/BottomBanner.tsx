"use client";

import { useState } from "react";

const PHONE = "09106823694";

function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export default function BottomBanner() {
  const [showPopup, setShowPopup] = useState(false);

  const handleClick = () => {
    if (isMobile()) {
      window.location.href = `tel:${PHONE}`;
    } else {
      setShowPopup(true);
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] bg-gradient-to-l from-blue-700 to-blue-500 text-white text-center py-3 px-6 rounded-xl shadow-[0_-4px_12px_rgba(0,0,0,0.2)] cursor-pointer hover:brightness-110 transition-all select-none"
      >
        <span className="inline-flex items-center gap-2 text-base font-semibold tracking-wide whitespace-nowrap">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" style={{ filter: "drop-shadow(0 0 2px rgba(255,255,255,0.5))" }}>
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            <path d="M16 2a4 4 0 0 1 4 4" />
            <path d="M16 6a3 3 0 0 1 3 3" />
          </svg>
          مشاوره رایگان و سفارش تلفنی
        </span>
      </div>

      {showPopup && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 shadow-xl text-center max-w-xs mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-gray-700 text-lg font-semibold mb-2">
              شماره تماس
            </p>
            <p className="text-blue-700 text-2xl font-bold mb-6 dir-ltr" dir="ltr">
              {PHONE}
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              بستن
            </button>
          </div>
        </div>
      )}
    </>
  );
}