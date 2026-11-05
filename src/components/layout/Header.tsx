"use client";

import Link from "next/link";
import { ShoppingCart, User, Search, Car, Menu, X, ChevronDown, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import { useGarageStore } from "@/store/garage.store";
import { useWishlistStore } from "@/store/wishlist.store";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { cart, fetchCart } = useCartStore();
  const { activeVehicle, fetchVehicles } = useGarageStore();
  const { fetchIds: fetchWishlistIds, reset: resetWishlist } = useWishlistStore();

  // Hydrate per-user state once authenticated (cart count, wishlist hearts,
  // saved vehicles); clear wishlist marks on logout.
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      fetchVehicles();
      fetchWishlistIds();
    } else {
      resetWishlist();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const cartCount = cart?.total_items ?? 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-primary text-white shadow-elevated">
      {/* Top bar */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex justify-between items-center text-xs text-blue-100/90">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            ارسال رایگان برای خریدهای بالای ۵۰۰ هزار تومان
          </span>
          <div className="flex gap-4">
            <Link href="/tracking" className="hover:text-white transition-colors">پیگیری سفارش</Link>
            <Link href="/contact" className="hover:text-white transition-colors">تماس با ما</Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 bg-gradient-accent rounded-xl flex items-center justify-center shadow-glow transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="font-black text-xl leading-none">مِین استوریج</div>
              <div className="text-blue-200 text-xs">فروشگاه قطعات خودرو</div>
            </div>
          </Link>

          {/* Active vehicle badge */}
          {activeVehicle && (
            <Link
              href="/account/garage"
              className="hidden md:flex items-center gap-2 bg-white/10 hover:bg-white/20 ring-1 ring-white/10 rounded-xl px-3 py-1.5 text-sm transition-colors backdrop-blur-sm"
            >
              <Car className="w-4 h-4 text-orange-400" />
              <span className="text-blue-50">{activeVehicle.display_name}</span>
              <ChevronDown className="w-3 h-3 text-blue-200" />
            </Link>
          )}

          {/* Search bar */}
          <div className="flex-1 max-w-2xl">
            <form onSubmit={handleSearch} className="relative group">
              <input
                type="text"
                placeholder="جستجو در قطعات، کد OEM, شماره قطعه..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/95 text-gray-900 placeholder-gray-400 rounded-2xl px-4 py-2.5 pr-12 text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all"
              />
              <button
                type="submit"
                aria-label="جستجو"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#f97316] rounded-lg transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex items-center gap-1.5 bg-gradient-accent hover:brightness-110 text-white rounded-xl px-3 py-2 shadow-glow transition-all active:scale-95"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-medium">سبد خرید</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -left-2 bg-white text-[#1e3a8a] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md ring-2 ring-[#f97316]">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Admin panel (staff only) */}
            {isAuthenticated && user?.is_staff && (
              <Link
                href="/admin"
                className="hidden sm:flex items-center gap-2 bg-white/10 hover:bg-white/20 ring-1 ring-white/10 rounded-xl px-3 py-2 transition-colors"
                title="پنل مدیریت"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span className="hidden lg:inline text-sm">مدیریت</span>
              </Link>
            )}

            {/* User */}
            {isAuthenticated ? (
              <Link
                href="/account"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 ring-1 ring-white/10 rounded-xl px-3 py-2 transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline text-sm">{user?.first_name || "حساب من"}</span>
              </Link>
            ) : (
              <Link
                href="/auth"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 ring-1 ring-white/10 rounded-xl px-3 py-2 transition-colors text-sm"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">ورود / ثبت‌نام</span>
              </Link>
            )}

            {/* Mobile menu */}
            <button
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Category nav */}
      <nav className="hidden md:block glass-dark border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex gap-1 text-sm">
            {[
              { label: "همه دسته‌ها", href: "/products" },
              { label: "موتوری", href: "/products?category=engine" },
              { label: "ترمز", href: "/products?category=brake" },
              { label: "جلوبندی", href: "/products?category=suspension" },
              { label: "برق خودرو", href: "/products?category=electrical" },
              { label: "باتری", href: "/products?category=battery" },
              { label: "روغن و مایعات", href: "/products?category=oil" },
              { label: "فیلترها", href: "/products?category=filter" },
              { label: "جرقه و شمع", href: "/products?category=ignition" },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="relative block px-3 py-2.5 text-blue-100 hover:text-white transition-colors after:absolute after:bottom-1 after:right-3 after:left-3 after:h-0.5 after:rounded-full after:bg-[#f97316] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-right"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass-dark border-t border-white/10 px-4 py-3 animate-fade-in">
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/products" className="py-2 px-3 hover:bg-white/10 rounded-lg transition-colors">همه محصولات</Link>
            <Link href="/account/garage" className="py-2 px-3 hover:bg-white/10 rounded-lg flex items-center gap-2 transition-colors">
              <Car className="w-4 h-4" /> گاراژ من
            </Link>
            {!isAuthenticated && (
              <Link href="/auth" className="py-2 px-3 bg-gradient-accent rounded-lg text-center font-medium shadow-glow">
                ورود / ثبت‌نام
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

