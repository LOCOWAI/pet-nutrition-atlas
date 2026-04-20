import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  BookOpen,
  ChevronDown,
  ChevronRight,
  FlaskConical,
  Search,
  Sparkles,
} from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "wouter";

const EVIDENCE_COLORS: Record<string, string> = {
  high: "text-[oklch(0.65_0.18_145)] border-[oklch(0.65_0.18_145/0.4)] bg-[oklch(0.65_0.18_145/0.08)]",
  medium: "text-[oklch(0.82_0.18_75)] border-[oklch(0.82_0.18_75/0.4)] bg-[oklch(0.82_0.18_75/0.08)]",
  low: "text-[oklch(0.65_0.010_285)] border-[oklch(0.65_0.010_285/0.4)] bg-[oklch(0.65_0.010_285/0.08)]",
  limited: "text-[oklch(0.55_0.010_285)] border-[oklch(0.55_0.010_285/0.4)] bg-[oklch(0.55_0.010_285/0.08)]",
};

export default function Ingredients() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [speciesFilter, setSpeciesFilter] = useState<string>("all");

  const { data: index, isLoading } = trpc.ingredients.index.useQuery();

  const filtered = useMemo(() => {
    if (!index) return [];
    return index.filter((item) => {
      const matchSearch = !search || item.ingredient.toLowerCase().includes(search.toLowerCase());
      const matchSpecies = speciesFilter === "all" || item.papers.some(
        (p) => p.species === speciesFilter || p.species === "both"
      );
      return matchSearch && matchSpecies;
    });
  }, [index, search, speciesFilter]);

  const toggleExpand = (ingredient: string) => {
    setExpanded(expanded === ingredient ? null : ingredient);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-[oklch(0.20_0.030_285)] bg-[oklch(0.11_0.022_285)]">
        <div className="container py-8">
          <div className="flex items-center gap-3 mb-3">
            <FlaskConical className="w-5 h-5 text-[oklch(0.72_0.18_290)]" />
            <span className="text-[0.68rem] font-['IBM_Plex_Mono'] tracking-[0.15em] uppercase text-[oklch(0.72_0.18_290)]">
              {t("ing_module_label")}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-['IBM_Plex_Sans'] mb-2">
            {t("ing_title")}
          </h1>
          <p className="text-[0.82rem] text-[oklch(0.55_0.010_285)] max-w-2xl">
            {t("ing_subtitle")}
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
              placeholder={t("ing_search_placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[oklch(0.14_0.022_285)] border border-[oklch(0.22_0.030_285)] text-[0.80rem] text-white placeholder-[oklch(0.40_0.010_285)] focus:outline-none focus:border-[oklch(0.46_0.28_290/0.6)] transition-colors"
            />
          </div>
          <div className="flex gap-2">
            {["all", "cat", "dog"].map((s) => (
              <button
                key={s}
                onClick={() => setSpeciesFilter(s)}
                className={cn(
                  "px-3 py-2 text-[0.68rem] font-['IBM_Plex_Mono'] tracking-wider uppercase border transition-colors",
                  speciesFilter === s
                    ? "border-[oklch(0.46_0.28_290)] bg-[oklch(0.46_0.28_290/0.15)] text-[oklch(0.82_0.14_290)]"
                    : "border-[oklch(0.22_0.030_285)] text-[oklch(0.50_0.010_285)] hover:border-[oklch(0.35_0.020_285)]"
                )}
              >
                {s === "all" ? t("common_all") : s === "cat" ? t("common_feline") : t("common_canine")}
              </button>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        {index && (
          <div className="mb-6 flex items-center gap-4 text-[0.68rem] font-['IBM_Plex_Mono'] text-[oklch(0.45_0.010_285)]">
            <span>{filtered.length} {t("ing_ingredients_found")}</span>
            <span>·</span>
            <span>{index.reduce((acc, i) => acc + i.papers.length, 0)} {t("ing_total_mappings")}</span>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-14 bg-[oklch(0.14_0.022_285)] animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16">
            <FlaskConical className="w-10 h-10 mx-auto mb-3 text-[oklch(0.28_0.020_285)]" />
            <p className="text-[0.82rem] text-[oklch(0.45_0.010_285)]">
              {index && index.length === 0 ? t("ing_no_data") : t("ing_no_results")}
            </p>
            {index && index.length === 0 && (
              <p className="text-[0.72rem] text-[oklch(0.38_0.010_285)] mt-2 max-w-sm mx-auto">
                {t("ing_no_data_hint")}
              </p>
            )}
          </div>
        )}

        {/* Ingredient list */}
        {!isLoading && filtered.length > 0 && (
          <div className="space-y-1.5">
            {filtered.map((item) => {
              const isOpen = expanded === item.ingredient;
              const paperCount = item.papers.length;
              const speciesTags = Array.from(new Set(item.papers.map((p) => p.species)));
              const topBenefits = Array.from(
                new Set(item.papers.map((p) => p.health_relevance).filter(Boolean))
              ).slice(0, 3);
              const hasCaution = item.papers.some((p) => p.caution);

              return (
                <div
                  key={item.ingredient}
                  className="border border-[oklch(0.20_0.030_285)] bg-[oklch(0.12_0.022_285)] hover:border-[oklch(0.28_0.035_285)] transition-colors"
                >
                  {/* Row header */}
                  <button
                    onClick={() => toggleExpand(item.ingredient)}
                    className="w-full flex items-center gap-4 p-4 text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[0.88rem] font-semibold text-white font-['IBM_Plex_Sans']">
                          {item.ingredient}
                        </span>
                        {hasCaution && (
                          <AlertTriangle className="w-3.5 h-3.5 text-[oklch(0.82_0.18_75)] flex-shrink-0" />
                        )}
                        {speciesTags.map((s) => (
                          <span
                            key={s}
                            className={cn(
                              "nasa-tag text-[0.60rem]",
                              s === "cat" ? "nasa-tag-blue" : s === "dog" ? "nasa-tag-green" : ""
                            )}
                          >
                            {s === "cat" ? t("common_feline") : s === "dog" ? t("common_canine") : t("common_both")}
                          </span>
                        ))}
                      </div>
                      {topBenefits.length > 0 && (
                        <p className="text-[0.72rem] text-[oklch(0.50_0.010_285)] mt-1 truncate">
                          {topBenefits.join(" · ")}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-[0.68rem] font-['IBM_Plex_Mono'] text-[oklch(0.45_0.010_285)]">
                        {paperCount} {paperCount === 1 ? t("ing_paper") : t("ing_papers")}
                      </span>
                      {isOpen
                        ? <ChevronDown className="w-4 h-4 text-[oklch(0.45_0.010_285)]" />
                        : <ChevronRight className="w-4 h-4 text-[oklch(0.45_0.010_285)]" />
                      }
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isOpen && (
                    <div className="border-t border-[oklch(0.18_0.025_285)] p-4 space-y-3">
                      {item.papers.map((p, i) => (
                        <div
                          key={i}
                          className="p-3 bg-[oklch(0.10_0.018_285)] border border-[oklch(0.18_0.025_285)]"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <Link href={`/paper/${p.paperId}`}>
                              <span className="text-[0.78rem] text-[oklch(0.72_0.18_290)] hover:text-[oklch(0.82_0.14_290)] transition-colors cursor-pointer leading-snug">
                                {p.title}
                              </span>
                            </Link>
                            <span
                              className={cn(
                                "nasa-tag text-[0.60rem] flex-shrink-0 border",
                                EVIDENCE_COLORS[p.evidenceLevel] || EVIDENCE_COLORS.limited
                              )}
                            >
                              {p.evidenceLevel}
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            {p.health_relevance && (
                              <div className="flex gap-2">
                                <span className="nasa-label w-28 flex-shrink-0">{t("ing_health_relevance")}</span>
                                <p className="text-[0.73rem] text-[oklch(0.70_0.008_285)]">{p.health_relevance}</p>
                              </div>
                            )}
                            {p.support_type && (
                              <div className="flex gap-2">
                                <span className="nasa-label w-28 flex-shrink-0">{t("ing_support_type")}</span>
                                <p className="text-[0.73rem] text-[oklch(0.70_0.008_285)]">{p.support_type}</p>
                              </div>
                            )}
                            {p.evidence_note && (
                              <div className="flex gap-2">
                                <span className="nasa-label w-28 flex-shrink-0">{t("ing_evidence_note")}</span>
                                <p className="text-[0.73rem] text-[oklch(0.62_0.008_285)]">{p.evidence_note}</p>
                              </div>
                            )}
                            {p.caution && (
                              <div className="flex gap-2 mt-1 p-2 bg-[oklch(0.82_0.18_75/0.06)] border border-[oklch(0.82_0.18_75/0.20)]">
                                <AlertTriangle className="w-3.5 h-3.5 text-[oklch(0.82_0.18_75)] flex-shrink-0 mt-0.5" />
                                <p className="text-[0.72rem] text-[oklch(0.72_0.012_75)]">{p.caution}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-[0.62rem] font-['IBM_Plex_Mono'] text-[oklch(0.40_0.010_285)]">
                            <span>{p.year}</span>
                            <span>·</span>
                            <span>{p.species}</span>
                            <span>·</span>
                            <span>{p.lifeStage}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
