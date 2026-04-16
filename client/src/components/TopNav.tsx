import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Cat,
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
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";

export default function TopNav() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();

  const NAV_ITEMS = [
    { label: t("nav_home"), href: "/", icon: null },
    { label: t("nav_cats"), href: "/cats", icon: Cat },
    { label: t("nav_dogs"), href: "/dogs", icon: Dog },
    { label: t("nav_health_topics"), href: "/health-topics", icon: Heart },
    { label: t("nav_breeds"), href: "/breeds", icon: Sparkles },
    { label: t("nav_monthly_updates"), href: "/monthly-updates", icon: RefreshCw },
    { label: t("nav_content_opportunities"), href: "/content-opportunities", icon: FlaskConical },
    { label: t("nav_reference_library"), href: "/library", icon: BookOpen },
    { label: t("ing_module_label"), href: "/ingredients", icon: FlaskConical },
    { label: t("guide_module_label"), href: "/guidelines", icon: Shield },
    { label: t("form_module_label"), href: "/formulation", icon: Sparkles },
  ];

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
            ? "bg-[oklch(0.09_0.018_285/0.97)] backdrop-blur-md border-b border-[oklch(0.22_0.030_285)]"
            : "bg-[oklch(0.09_0.018_285/0.88)] backdrop-blur-sm border-b border-[oklch(0.18_0.025_285/0.6)]"
        )}
      >
        {/* Top accent line — purple gradient */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-[oklch(0.46_0.28_290)] to-[oklch(0.72_0.18_290)] opacity-80" />

        <div className="container">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
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

            {/* Desktop Nav */}
            <div className="hidden xl:flex items-center gap-0.5">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-1.5 text-[0.72rem] font-medium tracking-wide uppercase font-['IBM_Plex_Sans'] transition-all duration-150 rounded-sm whitespace-nowrap",
                    isActive(item.href)
                      ? "text-[oklch(0.72_0.18_290)] bg-[oklch(0.46_0.28_290/0.12)]"
                      : "text-[oklch(0.68_0.010_285)] hover:text-white hover:bg-[oklch(0.20_0.030_285)]"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right side: Lang Toggle + Admin + Auth */}
            <div className="flex items-center gap-2">
              {/* Language Toggle */}
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
                    "hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-[0.68rem] font-medium tracking-wider uppercase font-['IBM_Plex_Mono'] border rounded-sm transition-all duration-150",
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
                  className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-[0.68rem] font-medium tracking-wider uppercase font-['IBM_Plex_Mono'] text-[oklch(0.55_0.010_285)] hover:text-white transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  {user?.name?.split(" ")[0] || t("nav_sign_out")}
                </button>
              ) : (
                <a
                  href={getLoginUrl()}
                  className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-[0.68rem] font-medium tracking-wider uppercase font-['IBM_Plex_Mono'] border border-[oklch(0.28_0.035_285)] text-[oklch(0.58_0.010_285)] hover:border-[oklch(0.46_0.28_290)] hover:text-[oklch(0.72_0.18_290)] rounded-sm transition-all duration-150"
                >
                  <LogIn className="w-3 h-3" />
                  {t("nav_sign_in")}
                </a>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="xl:hidden p-2 text-[oklch(0.68_0.010_285)] hover:text-white transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="xl:hidden border-t border-[oklch(0.20_0.030_285)] bg-[oklch(0.11_0.025_285)]">
            <div className="container py-3 space-y-0.5">
              {NAV_ITEMS.map((item) => (
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
                {/* Mobile lang toggle */}
                <div className="px-3 py-2 flex items-center gap-2">
                  <span className="text-[0.65rem] font-['IBM_Plex_Mono'] text-[oklch(0.50_0.010_285)] tracking-wider uppercase">Lang:</span>
                  <div className="lang-toggle">
                    <button onClick={() => setLang("en")} className={cn("lang-toggle-btn", lang === "en" && "active")}>EN</button>
                    <button onClick={() => setLang("zh")} className={cn("lang-toggle-btn", lang === "zh" && "active")}>中</button>
                  </div>
                </div>
                {isAuthenticated && user?.role === "admin" && (
                  <Link href="/admin" className="flex items-center gap-2.5 px-3 py-2.5 text-[0.75rem] font-medium tracking-wide uppercase font-['IBM_Plex_Mono'] text-[oklch(0.72_0.18_290)]">
                    <Settings className="w-3.5 h-3.5" />
                    {t("nav_admin")}
                  </Link>
                )}
                {isAuthenticated ? (
                  <button onClick={() => logout()} className="flex items-center gap-2.5 px-3 py-2.5 text-[0.75rem] font-medium tracking-wide uppercase font-['IBM_Plex_Mono'] text-[oklch(0.55_0.010_285)] w-full">
                    <LogOut className="w-3.5 h-3.5" />
                    {t("nav_sign_out")}
                  </button>
                ) : (
                  <a href={getLoginUrl()} className="flex items-center gap-2.5 px-3 py-2.5 text-[0.75rem] font-medium tracking-wide uppercase font-['IBM_Plex_Mono'] text-[oklch(0.55_0.010_285)]">
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
