import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Cat,
  ChevronDown,
  Dog,
  FlaskConical,
  Heart,
  LogIn,
  LogOut,
  Menu,
  Microscope,
  RefreshCw,
  Settings,
  Shield,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";

export default function TopNav() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const moreRef = useRef<HTMLDivElement>(null);

  // Primary nav — always visible on desktop
  const PRIMARY_NAV = [
    { label: t("nav_home"), href: "/" },
    { label: t("nav_cats"), href: "/cats" },
    { label: t("nav_dogs"), href: "/dogs" },
    { label: t("nav_health_topics"), href: "/health-topics" },
    { label: t("nav_reference_library"), href: "/library" },
  ];

  // Secondary nav — shown in "More" dropdown
  const MORE_NAV = [
    { label: t("nav_breeds"), href: "/breeds", icon: Sparkles },
    { label: t("nav_monthly_updates"), href: "/monthly-updates", icon: RefreshCw },
    { label: t("nav_content_opportunities"), href: "/content-opportunities", icon: FlaskConical },
    { label: t("ing_module_label"), href: "/ingredients", icon: FlaskConical },
    { label: t("guide_module_label"), href: "/guidelines", icon: Shield },
    { label: t("form_module_label"), href: "/formulation", icon: Sparkles },
  ];

  // All nav items for mobile menu
  const ALL_NAV = [
    { label: t("nav_home"), href: "/", icon: null },
    { label: t("nav_cats"), href: "/cats", icon: Cat },
    { label: t("nav_dogs"), href: "/dogs", icon: Dog },
    { label: t("nav_health_topics"), href: "/health-topics", icon: Heart },
    { label: t("nav_reference_library"), href: "/library", icon: BookOpen },
    { label: t("nav_breeds"), href: "/breeds", icon: Sparkles },
    { label: t("nav_monthly_updates"), href: "/monthly-updates", icon: RefreshCw },
    { label: t("nav_content_opportunities"), href: "/content-opportunities", icon: FlaskConical },
    { label: t("ing_module_label"), href: "/ingredients", icon: FlaskConical },
    { label: t("guide_module_label"), href: "/guidelines", icon: Shield },
    { label: t("form_module_label"), href: "/formulation", icon: Sparkles },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setMoreOpen(false);
  }, [location]);

  // Close "More" dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  const isMoreActive = MORE_NAV.some((item) => isActive(item.href));

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-[oklch(0.09_0.018_285/0.97)] backdrop-blur-md border-b border-[oklch(0.22_0.030_285)]"
            : "bg-[oklch(0.09_0.018_285/0.88)] backdrop-blur-sm border-b border-[oklch(0.18_0.025_285/0.6)]"
        )}
      >
        {/* Top accent line */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-[oklch(0.46_0.28_290)] to-[oklch(0.72_0.18_290)] opacity-80" />

        <div className="container">
          <div className="flex items-center h-14 gap-2">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0 mr-2">
              <div className="relative w-7 h-7 flex-shrink-0">
                <div className="absolute inset-0 rounded-sm bg-[oklch(0.46_0.28_290)]" />
                <Microscope className="absolute inset-0 m-auto w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <div className="text-[0.78rem] font-bold tracking-widest uppercase text-white font-['IBM_Plex_Sans'] leading-none">
                  Pet Nutrition
                </div>
                <div className="text-[0.58rem] tracking-[0.2em] uppercase text-[oklch(0.72_0.18_290)] font-['IBM_Plex_Mono'] leading-none mt-0.5">
                  Research Atlas
                </div>
              </div>
            </Link>

            {/* ── Desktop Primary Nav ── */}
            <div className="hidden md:flex items-center gap-0.5 flex-1 min-w-0">
              {PRIMARY_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-2.5 py-1.5 text-[0.70rem] font-medium tracking-wide uppercase font-['IBM_Plex_Sans'] transition-all duration-150 rounded-sm whitespace-nowrap flex-shrink-0",
                    isActive(item.href)
                      ? "text-[oklch(0.72_0.18_290)] bg-[oklch(0.46_0.28_290/0.12)]"
                      : "text-[oklch(0.68_0.010_285)] hover:text-white hover:bg-[oklch(0.20_0.030_285)]"
                  )}
                >
                  {item.label}
                </Link>
              ))}

              {/* More dropdown */}
              <div className="relative flex-shrink-0" ref={moreRef}>
                <button
                  onClick={() => setMoreOpen(!moreOpen)}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1.5 text-[0.70rem] font-medium tracking-wide uppercase font-['IBM_Plex_Sans'] transition-all duration-150 rounded-sm whitespace-nowrap",
                    isMoreActive || moreOpen
                      ? "text-[oklch(0.72_0.18_290)] bg-[oklch(0.46_0.28_290/0.12)]"
                      : "text-[oklch(0.68_0.010_285)] hover:text-white hover:bg-[oklch(0.20_0.030_285)]"
                  )}
                >
                  {t("nav_more") || "More"}
                  <ChevronDown
                    className={cn(
                      "w-3 h-3 transition-transform duration-150",
                      moreOpen && "rotate-180"
                    )}
                  />
                </button>

                {moreOpen && (
                  <div className="absolute top-full left-0 mt-1 w-52 bg-[oklch(0.11_0.025_285)] border border-[oklch(0.22_0.030_285)] rounded-sm shadow-xl z-50 py-1">
                    {MORE_NAV.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2.5 px-4 py-2.5 text-[0.72rem] font-medium tracking-wide uppercase font-['IBM_Plex_Sans'] transition-all duration-150",
                          isActive(item.href)
                            ? "text-[oklch(0.72_0.18_290)] bg-[oklch(0.46_0.28_290/0.12)]"
                            : "text-[oklch(0.68_0.010_285)] hover:text-white hover:bg-[oklch(0.18_0.030_285)]"
                        )}
                      >
                        {item.icon && <item.icon className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />}
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Right side: Lang Toggle + Admin + Auth (always visible) ── */}
            <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
              {/* Language Toggle — always visible at all breakpoints */}
              <div className="lang-toggle">
                <button
                  onClick={() => setLang("en")}
                  className={cn("lang-toggle-btn", lang === "en" && "active")}
                >
                  EN
                </button>
                <button
                  onClick={() => setLang("zh")}
                  className={cn("lang-toggle-btn", lang === "zh" && "active")}
                >
                  中
                </button>
              </div>

              {isAuthenticated && user?.role === "admin" && (
                <Link
                  href="/admin"
                  className={cn(
                    "hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-[0.68rem] font-medium tracking-wider uppercase font-['IBM_Plex_Mono'] border rounded-sm transition-all duration-150",
                    isActive("/admin")
                      ? "border-[oklch(0.46_0.28_290)] text-[oklch(0.72_0.18_290)] bg-[oklch(0.46_0.28_290/0.12)]"
                      : "border-[oklch(0.28_0.035_285)] text-[oklch(0.58_0.010_285)] hover:border-[oklch(0.46_0.28_290)] hover:text-[oklch(0.72_0.18_290)]"
                  )}
                >
                  <Settings className="w-3 h-3" />
                  {t("nav_admin")}
                </Link>
              )}

              {isAuthenticated ? (
                <button
                  onClick={() => logout()}
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-[0.68rem] font-medium tracking-wider uppercase font-['IBM_Plex_Mono'] text-[oklch(0.55_0.010_285)] hover:text-white transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  {user?.name?.split(" ")[0] || t("nav_sign_out")}
                </button>
              ) : (
                <a
                  href={getLoginUrl()}
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-[0.68rem] font-medium tracking-wider uppercase font-['IBM_Plex_Mono'] border border-[oklch(0.28_0.035_285)] text-[oklch(0.58_0.010_285)] hover:border-[oklch(0.46_0.28_290)] hover:text-[oklch(0.72_0.18_290)] rounded-sm transition-all duration-150"
                >
                  <LogIn className="w-3 h-3" />
                  {t("nav_sign_in")}
                </a>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-[oklch(0.68_0.010_285)] hover:text-white transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[oklch(0.20_0.030_285)] bg-[oklch(0.11_0.025_285)]">
            <div className="container py-3 space-y-0.5">
              {ALL_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2.5 text-[0.75rem] font-medium tracking-wide uppercase font-['IBM_Plex_Sans'] rounded-sm transition-all",
                    isActive(item.href)
                      ? "text-[oklch(0.72_0.18_290)] bg-[oklch(0.46_0.28_290/0.12)]"
                      : "text-[oklch(0.68_0.010_285)] hover:text-white hover:bg-[oklch(0.18_0.030_285)]"
                  )}
                >
                  {item.icon && <item.icon className="w-3.5 h-3.5 flex-shrink-0" />}
                  {item.label}
                </Link>
              ))}

              <div className="pt-2 border-t border-[oklch(0.20_0.030_285)] mt-2 space-y-1">
                {isAuthenticated && user?.role === "admin" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2.5 px-3 py-2.5 text-[0.75rem] font-medium tracking-wide uppercase font-['IBM_Plex_Mono'] text-[oklch(0.72_0.18_290)]"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    {t("nav_admin")}
                  </Link>
                )}
                {isAuthenticated ? (
                  <button
                    onClick={() => logout()}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-[0.75rem] font-medium tracking-wide uppercase font-['IBM_Plex_Mono'] text-[oklch(0.55_0.010_285)] w-full"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {t("nav_sign_out")}
                  </button>
                ) : (
                  <a
                    href={getLoginUrl()}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-[0.75rem] font-medium tracking-wide uppercase font-['IBM_Plex_Mono'] text-[oklch(0.55_0.010_285)]"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    {t("nav_sign_in")}
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
