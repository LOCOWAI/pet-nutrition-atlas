import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Building2,
  ChevronRight,
  ExternalLink,
  Filter,
  Search,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const CATEGORY_LABELS: Record<string, string> = {
  nutrition: "Nutrition",
  dental: "Dental",
  senior_care: "Senior Care",
  weight_management: "Weight Management",
  kidney: "Kidney",
  liver: "Liver",
  cardiac: "Cardiac",
  dermatology: "Dermatology",
  oncology: "Oncology",
  reproduction: "Reproduction",
  general_health: "General Health",
};

const ORG_COLORS: Record<string, string> = {
  AAHA: "text-[oklch(0.72_0.18_290)] border-[oklch(0.46_0.28_290/0.5)] bg-[oklch(0.46_0.28_290/0.10)]",
  WSAVA: "text-[oklch(0.65_0.18_145)] border-[oklch(0.65_0.18_145/0.5)] bg-[oklch(0.65_0.18_145/0.10)]",
  other: "text-[oklch(0.62_0.010_285)] border-[oklch(0.35_0.020_285)] bg-[oklch(0.18_0.022_285)]",
};

export default function Guidelines() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [species, setSpecies] = useState<string | undefined>();
  const [category, setCategory] = useState<string | undefined>();
  const [organization, setOrganization] = useState<string | undefined>();

  const { data, isLoading } = trpc.guidelines.list.useQuery({
    search: search || undefined,
    species: species as any,
    category: category as any,
    organization: organization as any,
    limit: 50,
  });

  const guidelines = data?.guidelines ?? [];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-[oklch(0.20_0.030_285)] bg-[oklch(0.11_0.022_285)]">
        <div className="container py-8">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-5 h-5 text-[oklch(0.65_0.18_145)]" />
            <span className="text-[0.68rem] font-['IBM_Plex_Mono'] tracking-[0.15em] uppercase text-[oklch(0.65_0.18_145)]">
              {t("guide_module_label")}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-['IBM_Plex_Sans'] mb-2">
            {t("guide_title")}
          </h1>
          <p className="text-[0.82rem] text-[oklch(0.55_0.010_285)] max-w-2xl">
            {t("guide_subtitle")}
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[oklch(0.45_0.010_285)]" />
            <input
              type="text"
              placeholder={t("guide_search_placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[oklch(0.14_0.022_285)] border border-[oklch(0.22_0.030_285)] text-[0.80rem] text-white placeholder-[oklch(0.40_0.010_285)] focus:outline-none focus:border-[oklch(0.46_0.28_290/0.6)] transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {/* Species filter */}
            {["cat", "dog"].map((s) => (
              <button
                key={s}
                onClick={() => setSpecies(species === s ? undefined : s)}
                className={cn(
                  "px-3 py-2 text-[0.68rem] font-['IBM_Plex_Mono'] tracking-wider uppercase border transition-colors",
                  species === s
                    ? "border-[oklch(0.46_0.28_290)] bg-[oklch(0.46_0.28_290/0.15)] text-[oklch(0.82_0.14_290)]"
                    : "border-[oklch(0.22_0.030_285)] text-[oklch(0.50_0.010_285)] hover:border-[oklch(0.35_0.020_285)]"
                )}
              >
                {s === "cat" ? t("common_feline") : t("common_canine")}
              </button>
            ))}
            {/* Org filter */}
            {["AAHA", "WSAVA"].map((org) => (
              <button
                key={org}
                onClick={() => setOrganization(organization === org ? undefined : org)}
                className={cn(
                  "px-3 py-2 text-[0.68rem] font-['IBM_Plex_Mono'] tracking-wider uppercase border transition-colors",
                  organization === org
                    ? "border-[oklch(0.65_0.18_145)] bg-[oklch(0.65_0.18_145/0.15)] text-[oklch(0.65_0.18_145)]"
                    : "border-[oklch(0.22_0.030_285)] text-[oklch(0.50_0.010_285)] hover:border-[oklch(0.35_0.020_285)]"
                )}
              >
                {org}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-[oklch(0.14_0.022_285)] animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && guidelines.length === 0 && (
          <div className="text-center py-16">
            <Shield className="w-10 h-10 mx-auto mb-3 text-[oklch(0.28_0.020_285)]" />
            <p className="text-[0.82rem] text-[oklch(0.45_0.010_285)]">
              {t("guide_no_data")}
            </p>
            <p className="text-[0.72rem] text-[oklch(0.38_0.010_285)] mt-2 max-w-sm mx-auto">
              {t("guide_no_data_hint")}
            </p>
          </div>
        )}

        {/* Guidelines grid */}
        {!isLoading && guidelines.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guidelines.map((g) => {
              const recs = (g.keyRecommendations as any[]) || [];
              return (
                <Link key={g.id} href={`/guidelines/${g.id}`}>
                  <div className="nasa-card p-5 h-full cursor-pointer hover:border-[oklch(0.35_0.040_285)] transition-colors group">
                    {/* Org + category badges */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className={cn("nasa-tag text-[0.62rem] border", ORG_COLORS[g.organization] || ORG_COLORS.other)}>
                        <Building2 className="w-2.5 h-2.5 inline mr-1" />
                        {g.organization}
                      </span>
                      <span className="nasa-tag text-[0.62rem]">
                        {CATEGORY_LABELS[g.category] || g.category}
                      </span>
                      <span className={cn("nasa-tag text-[0.62rem]", g.species === "cat" ? "nasa-tag-blue" : g.species === "dog" ? "nasa-tag-green" : "")}>
                        {g.species === "cat" ? t("common_feline") : g.species === "dog" ? t("common_canine") : t("common_both")}
                      </span>
                      <span className="nasa-tag text-[0.62rem]">{g.year}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-[0.88rem] font-semibold text-white font-['IBM_Plex_Sans'] leading-snug mb-3 group-hover:text-[oklch(0.90_0.008_285)] transition-colors">
                      {g.title}
                    </h3>

                    {/* Summary */}
                    {g.summary && (
                      <p className="text-[0.75rem] text-[oklch(0.58_0.008_285)] leading-relaxed mb-3 line-clamp-3">
                        {g.summary}
                      </p>
                    )}

                    {/* Chinese summary if available */}
                    {g.summaryZh && (
                      <p className="text-[0.73rem] text-[oklch(0.52_0.008_285)] leading-relaxed mb-3 line-clamp-2 border-l-2 border-[oklch(0.65_0.18_145/0.4)] pl-3">
                        {g.summaryZh}
                      </p>
                    )}

                    {/* Key recs count */}
                    {recs.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[0.65rem] font-['IBM_Plex_Mono'] text-[oklch(0.45_0.010_285)]">
                        <BookOpen className="w-3 h-3" />
                        <span>{recs.length} {t("guide_recommendations")}</span>
                        <ChevronRight className="w-3 h-3 ml-auto text-[oklch(0.35_0.010_285)] group-hover:text-[oklch(0.72_0.18_290)] transition-colors" />
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// GUIDELINE DETAIL PAGE
// ============================================================
export function GuidelineDetail({ params }: { params: { id: string } }) {
  const { t } = useLanguage();
  const guidelineId = parseInt(params.id);

  const { data: guideline, isLoading, error } = trpc.guidelines.getById.useQuery({ id: guidelineId });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container py-8">
          <div className="animate-pulse space-y-4 max-w-4xl">
            <div className="h-4 w-48 bg-[oklch(0.20_0.025_285)] rounded-sm" />
            <div className="h-8 w-full bg-[oklch(0.20_0.025_285)] rounded-sm" />
            <div className="h-4 w-1/2 bg-[oklch(0.18_0.022_285)] rounded-sm" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !guideline) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-[oklch(0.32_0.010_285)]" />
          <h2 className="text-lg font-semibold text-white mb-2">{t("guide_not_found")}</h2>
          <Link href="/guidelines" className="text-[0.72rem] font-['IBM_Plex_Mono'] tracking-wider uppercase text-[oklch(0.72_0.18_290)] hover:text-[oklch(0.82_0.14_290)]">
            ← {t("guide_back")}
          </Link>
        </div>
      </div>
    );
  }

  const recs = (guideline.keyRecommendations as any[]) || [];
  const topics = (guideline.relatedHealthTopics as string[]) || [];

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-[oklch(0.20_0.030_285)] bg-[oklch(0.11_0.022_285)]">
        <div className="container py-3">
          <div className="flex items-center gap-2 text-[0.68rem] font-['IBM_Plex_Mono'] text-[oklch(0.45_0.010_285)]">
            <Link href="/" className="hover:text-[oklch(0.72_0.18_290)] transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/guidelines" className="hover:text-[oklch(0.72_0.18_290)] transition-colors">{t("guide_title")}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[oklch(0.58_0.010_285)] truncate max-w-xs">{guideline.title.slice(0, 50)}...</span>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="max-w-4xl">
          <Link href="/guidelines" className="inline-flex items-center gap-2 text-[0.70rem] font-['IBM_Plex_Mono'] tracking-wider uppercase text-[oklch(0.50_0.010_285)] hover:text-[oklch(0.72_0.18_290)] transition-colors mb-6">
            ← {t("guide_back")}
          </Link>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={cn("nasa-tag border", ORG_COLORS[guideline.organization] || ORG_COLORS.other)}>
              {guideline.organization}
            </span>
            <span className="nasa-tag">{CATEGORY_LABELS[guideline.category] || guideline.category}</span>
            <span className={cn("nasa-tag", guideline.species === "cat" ? "nasa-tag-blue" : guideline.species === "dog" ? "nasa-tag-green" : "")}>
              {guideline.species === "cat" ? t("common_feline") : guideline.species === "dog" ? t("common_canine") : t("common_both")}
            </span>
            <span className="nasa-tag">{guideline.year}</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-white leading-snug mb-6 font-['IBM_Plex_Sans']">
            {guideline.title}
          </h1>

          {/* Summary */}
          {guideline.summary && (
            <div className="mb-6">
              <div className="nasa-section-header mb-3">
                <h2 className="text-[0.85rem] font-semibold text-white font-['IBM_Plex_Sans'] tracking-wide flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-[oklch(0.65_0.18_145)]" />
                  {t("guide_summary")}
                </h2>
              </div>
              <div className="bg-[oklch(0.14_0.022_285)] border border-[oklch(0.22_0.030_285)] border-l-2 border-l-[oklch(0.65_0.18_145)] p-5">
                <p className="text-[0.83rem] text-[oklch(0.80_0.008_285)] leading-relaxed">{guideline.summary}</p>
              </div>
            </div>
          )}

          {/* Chinese summary */}
          {guideline.summaryZh && (
            <div className="mb-6">
              <div className="nasa-section-header mb-3">
                <h2 className="text-[0.85rem] font-semibold text-white font-['IBM_Plex_Sans'] tracking-wide">
                  {t("guide_summary_zh")}
                </h2>
              </div>
              <div className="bg-[oklch(0.14_0.022_285)] border border-[oklch(0.22_0.030_285)] border-l-2 border-l-[oklch(0.65_0.18_145/0.5)] p-5">
                <p className="text-[0.83rem] text-[oklch(0.75_0.008_285)] leading-relaxed">{guideline.summaryZh}</p>
              </div>
            </div>
          )}

          {/* Key Recommendations */}
          {recs.length > 0 && (
            <div className="mb-6">
              <div className="nasa-section-header mb-3">
                <h2 className="text-[0.85rem] font-semibold text-white font-['IBM_Plex_Sans'] tracking-wide flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-[oklch(0.72_0.18_290)]" />
                  {t("guide_key_recommendations")} ({recs.length})
                </h2>
              </div>
              <div className="space-y-3">
                {recs.map((rec: any, i: number) => (
                  <div key={i} className="p-4 bg-[oklch(0.14_0.022_285)] border border-[oklch(0.20_0.030_285)]">
                    <div className="flex items-start gap-3">
                      <span className="nasa-label flex-shrink-0 mt-0.5 text-[oklch(0.72_0.18_290)]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="flex-1">
                        <p className="text-[0.82rem] text-white leading-relaxed mb-2">{rec.recommendation}</p>
                        {rec.rationale && (
                          <p className="text-[0.75rem] text-[oklch(0.60_0.008_285)] leading-relaxed mb-1">{rec.rationale}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          {rec.strength && (
                            <span className="nasa-tag text-[0.60rem]">{t("guide_strength")}: {rec.strength}</span>
                          )}
                          {rec.applicable_to && (
                            <span className="text-[0.62rem] font-['IBM_Plex_Mono'] text-[oklch(0.45_0.010_285)]">
                              {rec.applicable_to}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related topics */}
          {topics.length > 0 && (
            <div className="mb-6">
              <div className="nasa-label mb-2">{t("guide_related_topics")}</div>
              <div className="flex flex-wrap gap-1.5">
                {topics.map((topic) => (
                  <span key={topic} className="nasa-tag nasa-tag-blue">{topic}</span>
                ))}
              </div>
            </div>
          )}

          {/* Reference */}
          {guideline.harvardReference && (
            <div className="mb-6">
              <div className="nasa-section-header mb-3">
                <h2 className="text-[0.85rem] font-semibold text-white font-['IBM_Plex_Sans'] tracking-wide">{t("paper_harvard_ref")}</h2>
              </div>
              <div className="p-4 bg-[oklch(0.14_0.022_285)] border border-[oklch(0.22_0.030_285)]">
                <p className="text-[0.78rem] text-[oklch(0.70_0.008_285)] leading-relaxed font-['IBM_Plex_Mono']">
                  {guideline.harvardReference}
                </p>
              </div>
            </div>
          )}

          {/* External link */}
          {guideline.referenceUrl && (
            <a
              href={guideline.referenceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 p-3 bg-[oklch(0.14_0.022_285)] border border-[oklch(0.22_0.030_285)] hover:border-[oklch(0.46_0.28_290/0.5)] transition-colors group"
            >
              <ExternalLink className="w-4 h-4 text-[oklch(0.72_0.18_290)]" />
              <span className="text-[0.72rem] font-['IBM_Plex_Mono'] text-[oklch(0.62_0.010_285)] group-hover:text-[oklch(0.72_0.18_290)] transition-colors">
                {t("guide_view_original")}
              </span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
