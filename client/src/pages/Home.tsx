import PaperCard from "@/components/PaperCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  Brain,
  Cat,
  Dog,
  Dumbbell,
  FlaskConical,
  Heart,
  Microscope,
  Search,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

const HEALTH_TOPIC_ICONS: Record<string, React.ElementType> = {
  "digestive-health": FlaskConical,
  "skin-coat": Sparkles,
  "joint-mobility": Zap,
  "weight-management": Dumbbell,
  "urinary-health": Shield,
  "kidney-support": Shield,
  "dental-oral-health": Heart,
  "immune-support": Shield,
  "cognitive-aging": Brain,
  "heart-health": Heart,
  "liver-support": FlaskConical,
  "gut-microbiome": Microscope,
  "food-sensitivity-allergy": Shield,
  "stress-behavior": Brain,
  "muscle-maintenance": Dumbbell,
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();
  const { t } = useLanguage();

  const { data: stats } = trpc.papers.getStats.useQuery();
  const { data: featuredData } = trpc.papers.getFeatured.useQuery({ limit: 6 });
  const { data: topicsData } = trpc.topics.list.useQuery({});
  const { data: monthlyData } = trpc.papers.getMonthly.useQuery({});

  const lifeStages = [
    { labelKey: "home_life_junior" as const, subKey: "home_life_junior_sub" as const, value: "junior", descKey: "home_life_junior_desc" as const },
    { labelKey: "home_life_adult" as const, subKey: "home_life_adult_sub" as const, value: "adult", descKey: "home_life_adult_desc" as const },
    { labelKey: "home_life_senior" as const, subKey: "home_life_senior_sub" as const, value: "senior", descKey: "home_life_senior_desc" as const },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/library?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* ============================================================
          HERO SECTION
          ============================================================ */}
      <section className="relative overflow-hidden nasa-hero-gradient nasa-grid-bg">
        <div className="absolute inset-0 pointer-events-none">
          {/* Decorative purple grid lines */}
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-[oklch(0.46_0.28_290/0.20)] to-transparent" />
          <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-[oklch(0.72_0.18_290/0.10)] to-transparent" />
          {/* Nebula glow orbs */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-[oklch(0.46_0.28_290/0.06)] blur-3xl" />
          <div className="absolute top-10 right-10 w-[200px] h-[200px] rounded-full bg-[oklch(0.72_0.18_290/0.05)] blur-2xl" />
        </div>

        <div className="container relative py-20 lg:py-28">
          {/* Mission label */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-gradient-to-r from-[oklch(0.46_0.28_290)] to-[oklch(0.72_0.18_290)]" />
            <span className="nasa-label">{t("home_badge")}</span>
            <div className="w-8 h-px bg-gradient-to-r from-[oklch(0.72_0.18_290)] to-transparent" />
          </div>

          {/* Main headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.08] tracking-tight mb-5 max-w-4xl font-['IBM_Plex_Sans']">
            {t("home_title_1")}
            <br />
            <span className="bg-gradient-to-r from-[oklch(0.46_0.28_290)] to-[oklch(0.72_0.18_290)] bg-clip-text text-transparent">
              {t("home_title_2")}
            </span>
          </h1>

          <p className="text-[oklch(0.62_0.010_285)] text-base md:text-lg leading-relaxed max-w-2xl mb-10 font-light">
            {t("home_subtitle")}
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[oklch(0.48_0.010_285)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("home_search_placeholder")}
                className="w-full pl-11 pr-32 py-4 bg-[oklch(0.15_0.025_285)] border border-[oklch(0.26_0.035_285)] text-white placeholder-[oklch(0.42_0.010_285)] text-sm rounded-sm focus:outline-none focus:border-[oklch(0.46_0.28_290)] focus:ring-1 focus:ring-[oklch(0.46_0.28_290/0.3)] transition-all font-['Inter']"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-[oklch(0.46_0.28_290)] text-white text-[0.75rem] font-semibold tracking-wider uppercase rounded-sm hover:bg-[oklch(0.52_0.28_290)] transition-all font-['IBM_Plex_Mono'] shadow-[0_0_12px_oklch(0.46_0.28_290/0.4)]"
              >
                {t("home_search_btn")}
              </button>
            </div>
          </form>

          {/* Stats row */}
          {stats && (
            <div className="flex flex-wrap gap-6 mt-10">
              {[
                { labelKey: "home_total_papers" as const, value: stats.approved },
                { labelKey: "home_feline_studies" as const, value: stats.cats },
                { labelKey: "home_canine_studies" as const, value: stats.dogs },
                { labelKey: "home_featured" as const, value: stats.featured },
              ].map((stat) => (
                <div key={stat.labelKey} className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white font-['IBM_Plex_Sans']">{stat.value}</span>
                  <span className="text-[0.68rem] text-[oklch(0.48_0.010_285)] tracking-wider uppercase font-['IBM_Plex_Mono']">{t(stat.labelKey)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          BROWSE BY SPECIES
          ============================================================ */}
      <section className="py-16 bg-[oklch(0.11_0.022_285)]">
        <div className="container">
          <div className="nasa-section-header">
            <div>
              <h2 className="text-xl font-bold text-white font-['IBM_Plex_Sans'] tracking-tight">{t("home_browse_species")}</h2>
              <p className="text-[0.75rem] text-[oklch(0.50_0.010_285)] mt-0.5">{t("home_browse_species_sub")}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cats */}
            <Link href="/cats">
              <div className="group relative overflow-hidden nasa-card p-8 cursor-pointer">
                <div className="absolute top-0 right-0 w-48 h-48 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Cat className="w-full h-full text-[oklch(0.55_0.18_240)]" />
                </div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-sm bg-[oklch(0.55_0.18_240/0.15)] border border-[oklch(0.55_0.18_240/0.3)] flex items-center justify-center">
                      <Cat className="w-5 h-5 text-[oklch(0.72_0.14_240)]" />
                    </div>
                    <div>
                      <div className="nasa-label">{t("home_browse_cats")}</div>
                      <h3 className="text-xl font-bold text-white font-['IBM_Plex_Sans']">{t("nav_cats")}</h3>
                    </div>
                  </div>
                  <p className="text-[0.80rem] text-[oklch(0.55_0.010_285)] leading-relaxed mb-4">
                    {t("home_browse_cats_desc")}
                  </p>
                  <div className="flex items-center gap-2 text-[oklch(0.72_0.14_240)] text-[0.72rem] font-['IBM_Plex_Mono'] tracking-wider uppercase group-hover:gap-3 transition-all">
                    {t("home_explore_cats")} <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Dogs */}
            <Link href="/dogs">
              <div className="group relative overflow-hidden nasa-card p-8 cursor-pointer">
                <div className="absolute top-0 right-0 w-48 h-48 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Dog className="w-full h-full text-[oklch(0.65_0.18_145)]" />
                </div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-sm bg-[oklch(0.65_0.18_145/0.12)] border border-[oklch(0.65_0.18_145/0.3)] flex items-center justify-center">
                      <Dog className="w-5 h-5 text-[oklch(0.65_0.18_145)]" />
                    </div>
                    <div>
                      <div className="nasa-label">{t("home_browse_dogs")}</div>
                      <h3 className="text-xl font-bold text-white font-['IBM_Plex_Sans']">{t("nav_dogs")}</h3>
                    </div>
                  </div>
                  <p className="text-[0.80rem] text-[oklch(0.55_0.010_285)] leading-relaxed mb-4">
                    {t("home_browse_dogs_desc")}
                  </p>
                  <div className="flex items-center gap-2 text-[oklch(0.65_0.18_145)] text-[0.72rem] font-['IBM_Plex_Mono'] tracking-wider uppercase group-hover:gap-3 transition-all">
                    {t("home_explore_dogs")} <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          BROWSE BY LIFE STAGE
          ============================================================ */}
      <section className="py-16">
        <div className="container">
          <div className="nasa-section-header">
            <div>
              <h2 className="text-xl font-bold text-white font-['IBM_Plex_Sans'] tracking-tight">{t("home_browse_life_stage")}</h2>
              <p className="text-[0.75rem] text-[oklch(0.50_0.010_285)] mt-0.5">{t("home_browse_life_stage_sub")}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {lifeStages.map((stage) => (
              <Link key={stage.value} href={`/library?lifeStage=${stage.value}`}>
                <div className="nasa-card p-6 cursor-pointer group h-full">
                  <div className="nasa-label mb-1">{t(stage.subKey)}</div>
                  <h3 className="text-2xl font-bold text-white font-['IBM_Plex_Sans'] mb-2 group-hover:text-[oklch(0.82_0.14_290)] transition-colors">
                    {t(stage.labelKey)}
                  </h3>
                  <p className="text-[0.78rem] text-[oklch(0.52_0.010_285)] leading-relaxed mb-4">
                    {t(stage.descKey)}
                  </p>
                  <div className="flex items-center gap-2 text-[oklch(0.72_0.18_290)] text-[0.68rem] font-['IBM_Plex_Mono'] tracking-wider uppercase">
                    Browse Papers <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          BROWSE BY HEALTH TOPIC
          ============================================================ */}
      <section className="py-16 bg-[oklch(0.11_0.022_285)]">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <div className="nasa-section-header mb-0">
              <div>
                <h2 className="text-xl font-bold text-white font-['IBM_Plex_Sans'] tracking-tight">{t("home_browse_health")}</h2>
                <p className="text-[0.75rem] text-[oklch(0.50_0.010_285)] mt-0.5">{t("home_browse_health_sub")}</p>
              </div>
            </div>
            <Link href="/health-topics" className="text-[0.70rem] font-['IBM_Plex_Mono'] tracking-wider uppercase text-[oklch(0.72_0.18_290)] hover:text-[oklch(0.82_0.14_290)] transition-colors flex items-center gap-1.5">
              {t("home_view_all_topics")} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {topicsData?.slice(0, 15).map((topic) => {
              const t2 = topic as any;
              const Icon = HEALTH_TOPIC_ICONS[topic.slug] || FlaskConical;
              return (
                <Link key={topic.id} href={`/health-topics/${topic.slug}`}>
                  <div className="nasa-card p-4 cursor-pointer group h-full flex flex-col items-start gap-2">
                    <div className="w-8 h-8 rounded-sm bg-[oklch(0.46_0.28_290/0.15)] border border-[oklch(0.46_0.28_290/0.25)] flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-[oklch(0.72_0.18_290)]" />
                    </div>
                    <div>
                      <div className="text-[0.75rem] font-semibold text-[oklch(0.85_0.006_285)] leading-snug font-['IBM_Plex_Sans'] group-hover:text-[oklch(0.82_0.14_290)] transition-colors">
                        {topic.name}
                      </div>
                      {t2.paperCount !== undefined && (
                        <div className="text-[0.62rem] text-[oklch(0.45_0.010_285)] font-['IBM_Plex_Mono'] mt-0.5">
                          {t2.paperCount} {t("topics_papers_count")}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          FEATURED PAPERS
          ============================================================ */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <div className="nasa-section-header mb-0">
              <div>
                <h2 className="text-xl font-bold text-white font-['IBM_Plex_Sans'] tracking-tight">{t("home_featured_papers")}</h2>
                <p className="text-[0.75rem] text-[oklch(0.50_0.010_285)] mt-0.5">{t("home_featured_sub")}</p>
              </div>
            </div>
            <Link href="/library?featured=true" className="text-[0.70rem] font-['IBM_Plex_Mono'] tracking-wider uppercase text-[oklch(0.72_0.18_290)] hover:text-[oklch(0.82_0.14_290)] transition-colors flex items-center gap-1.5">
              {t("home_view_library")} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {featuredData?.papers && featuredData.papers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredData.papers.map((paper) => (
                <PaperCard key={paper.id} paper={paper as any} />
              ))}
            </div>
          ) : (
            <p className="text-[oklch(0.48_0.010_285)] text-sm">{t("home_no_papers")}</p>
          )}
        </div>
      </section>

      {/* ============================================================
          MONTHLY UPDATES PREVIEW
          ============================================================ */}
      <section className="py-16 bg-[oklch(0.11_0.022_285)]">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <div className="nasa-section-header mb-0">
              <div>
                <h2 className="text-xl font-bold text-white font-['IBM_Plex_Sans'] tracking-tight">{t("home_monthly_updates")}</h2>
                <p className="text-[0.75rem] text-[oklch(0.50_0.010_285)] mt-0.5">{t("home_monthly_sub")}</p>
              </div>
            </div>
            <Link href="/monthly-updates" className="text-[0.70rem] font-['IBM_Plex_Mono'] tracking-wider uppercase text-[oklch(0.72_0.18_290)] hover:text-[oklch(0.82_0.14_290)] transition-colors flex items-center gap-1.5">
              {t("home_view_all_updates")} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {monthlyData && monthlyData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {monthlyData.slice(0, 3).map((paper) => (
                <PaperCard key={paper.id} paper={paper as any} compact />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[oklch(0.48_0.010_285)] text-sm">
              {t("home_no_papers")}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
