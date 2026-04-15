import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  ChevronDown,
  Dog,
  FlaskConical,
  Heart,
  LogIn,
  LogOut,
  Menu,
  Microscope,
  Moon,
  RefreshCw,
  Settings,
  Sparkles,
  User,
  X,
  Cat,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: null },
  { label: "Cats", href: "/cats", icon: Cat },
  { label: "Dogs", href: "/dogs", icon: Dog },
  { label: "Health Topics", href: "/health-topics", icon: Heart },
  { label: "Breeds", href: "/breeds", icon: Sparkles },
  { label: "Monthly Updates", href: "/monthly-updates", icon: RefreshCw },
  { label: "Content Opportunities", href: "/content-opportunities", icon: FlaskConical },
  { label: "Reference Library", href: "/library", icon: BookOpen },
];

export default function TopNav() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-[oklch(0.10_0.015_240/0.97)] backdrop-blur-md border-b border-[oklch(0.24_0.018_240)]"
            : "bg-[oklch(0.10_0.015_240/0.85)] backdrop-blur-sm border-b border-[oklch(0.20_0.015_240/0.5)]"
        )}
      >
        {/* Top accent line */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-[oklch(0.55_0.22_25)] to-transparent" />

        <div className="container">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="relative w-7 h-7 flex-shrink-0">
                <div className="absolute inset-0 rounded-sm bg-[oklch(0.55_0.22_25)] opacity-90" />
                <Microscope className="absolute inset-0 m-auto w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <div className="text-[0.78rem] font-bold tracking-widest uppercase text-white font-['IBM_Plex_Sans'] leading-none">
                  Pet Nutrition
                </div>
                <div className="text-[0.58rem] tracking-[0.2em] uppercase text-[oklch(0.55_0.22_25)] font-['IBM_Plex_Mono'] leading-none mt-0.5">
                  Research Atlas
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden xl:flex items-center gap-0.5">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-1.5 text-[0.72rem] font-medium tracking-wide uppercase font-['IBM_Plex_Sans'] transition-all duration-150 rounded-sm whitespace-nowrap",
                    isActive(item.href)
                      ? "text-[oklch(0.55_0.22_25)] bg-[oklch(0.55_0.22_25/0.10)]"
                      : "text-[oklch(0.72_0.010_240)] hover:text-white hover:bg-[oklch(0.20_0.018_240)]"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right side: Admin + Auth */}
            <div className="flex items-center gap-2">
              {isAuthenticated && user?.role === "admin" && (
                <Link
                  href="/admin"
                  className={cn(
                    "hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-[0.68rem] font-medium tracking-wider uppercase font-['IBM_Plex_Mono'] border rounded-sm transition-all duration-150",
                    isActive("/admin")
                      ? "border-[oklch(0.55_0.22_25)] text-[oklch(0.55_0.22_25)] bg-[oklch(0.55_0.22_25/0.10)]"
                      : "border-[oklch(0.30_0.025_240)] text-[oklch(0.60_0.010_240)] hover:border-[oklch(0.55_0.22_25)] hover:text-[oklch(0.55_0.22_25)]"
                  )}
                >
                  <Settings className="w-3 h-3" />
                  Admin
                </Link>
              )}

              {isAuthenticated ? (
                <button
                  onClick={() => logout()}
                  className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-[0.68rem] font-medium tracking-wider uppercase font-['IBM_Plex_Mono'] text-[oklch(0.58_0.010_240)] hover:text-white transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  {user?.name?.split(" ")[0] || "Sign Out"}
                </button>
              ) : (
                <a
                  href={getLoginUrl()}
                  className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-[0.68rem] font-medium tracking-wider uppercase font-['IBM_Plex_Mono'] border border-[oklch(0.30_0.025_240)] text-[oklch(0.60_0.010_240)] hover:border-[oklch(0.55_0.22_25)] hover:text-[oklch(0.55_0.22_25)] rounded-sm transition-all duration-150"
                >
                  <LogIn className="w-3 h-3" />
                  Sign In
                </a>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="xl:hidden p-2 text-[oklch(0.70_0.010_240)] hover:text-white transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="xl:hidden border-t border-[oklch(0.22_0.018_240)] bg-[oklch(0.12_0.020_240)]">
            <div className="container py-3 space-y-0.5">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2.5 text-[0.75rem] font-medium tracking-wide uppercase font-['IBM_Plex_Sans'] rounded-sm transition-all",
                    isActive(item.href)
                      ? "text-[oklch(0.55_0.22_25)] bg-[oklch(0.55_0.22_25/0.10)]"
                      : "text-[oklch(0.72_0.010_240)] hover:text-white hover:bg-[oklch(0.20_0.018_240)]"
                  )}
                >
                  {item.icon && <item.icon className="w-3.5 h-3.5 flex-shrink-0" />}
                  {item.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-[oklch(0.22_0.018_240)] mt-2">
                {isAuthenticated && user?.role === "admin" && (
                  <Link href="/admin" className="flex items-center gap-2.5 px-3 py-2.5 text-[0.75rem] font-medium tracking-wide uppercase font-['IBM_Plex_Mono'] text-[oklch(0.55_0.22_25)]">
                    <Settings className="w-3.5 h-3.5" />
                    Admin CMS
                  </Link>
                )}
                {isAuthenticated ? (
                  <button onClick={() => logout()} className="flex items-center gap-2.5 px-3 py-2.5 text-[0.75rem] font-medium tracking-wide uppercase font-['IBM_Plex_Mono'] text-[oklch(0.58_0.010_240)] w-full">
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                ) : (
                  <a href={getLoginUrl()} className="flex items-center gap-2.5 px-3 py-2.5 text-[0.75rem] font-medium tracking-wide uppercase font-['IBM_Plex_Mono'] text-[oklch(0.58_0.010_240)]">
                    <LogIn className="w-3.5 h-3.5" />
                    Sign In
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer */}
      <div className="h-[calc(14px+2px+3.5rem)]" />
    </>
  );
}
