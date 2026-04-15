import PaperCard from "@/components/PaperCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { BookOpen, ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";

function FilterSelect({
  label, value, onChange, options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="nasa-label block mb-1.5">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-[oklch(0.15_0.025_285)] border border-[oklch(0.24_0.030_285)] text-[oklch(0.85_0.006_285)] text-[0.75rem] px-3 py-2 pr-8 rounded-sm focus:outline-none focus:border-[oklch(0.46_0.28_290)] transition-colors font-['IBM_Plex_Sans'] cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[oklch(0.15_0.025_285)]">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[oklch(0.50_0.010_285)] pointer-events-none" />
      </div>
    </div>
  );
}

export default function Library() {
  const [location] = useLocation();
  const { t } = useLanguage();

  const searchParams = useMemo(() => {
    const params = new URLSearchParams(location.split("?")[1] || "");
    return params;
  }, [location]);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [species, setSpecies] = useState(searchParams.get("species") || "");
  const [lifeStage, setLifeStage] = useState(searchParams.get("lifeStage") || "");
  const [topicId, setTopicId] = useState<number | undefined>(undefined);
  const [breedId, setBreedId] = useState<number | undefined>(undefined);
  const [studyType, setStudyType] = useState("");
  const [evidenceLevel, setEvidenceLevel] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [offset, setOffset] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const LIMIT = 12;

  const SPECIES_OPTIONS = [
    { value: "", label: t("library_all_species") },
    { value: "cat", label: t("common_feline") },
    { value: "dog", label: t("common_canine") },
    { value: "both", label: t("common_both") },
  ];

  const LIFE_STAGE_OPTIONS = [
    { value: "", label: t("library_all_stages") },
    { value: "junior", label: t("home_life_junior") },
    { value: "adult", label: t("home_life_adult") },
    { value: "senior", label: t("home_life_senior") },
  ];

  const STUDY_TYPE_OPTIONS = [
    { value: "", label: t("library_all_types") },
    { value: "rct", label: t("study_rct") },
    { value: "meta_analysis", label: t("study_meta_analysis") },
    { value: "review", label: t("study_review") },
    { value: "cohort", label: t("study_cohort") },
    { value: "observational", label: t("study_observational") },
    { value: "in_vitro", label: t("study_in_vitro") },
    { value: "case_study", label: t("study_case_study") },
  ];

  const EVIDENCE_OPTIONS = [
    { value: "", label: t("library_all_evidence") },
    { value: "high", label: `${t("common_high")} ${t("common_evidence")}` },
    { value: "medium", label: `${t("common_medium")} ${t("common_evidence")}` },
    { value: "low", label: `${t("common_low")} ${t("common_evidence")}` },
  ];

  const YEAR_OPTIONS = [
    { value: "", label: t("library_all_years") },
    { value: "2024", label: "2024" },
    { value: "2023", label: "2023" },
    { value: "2022", label: "2022" },
    { value: "2021", label: "2021" },
    { value: "2020", label: "2020" },
    { value: "2019", label: "2015–2019" },
  ];

  const yearFrom = yearFilter === "2019" ? 2015 : yearFilter ? parseInt(yearFilter) : undefined;
  const yearTo = yearFilter === "2019" ? 2019 : yearFilter ? parseInt(yearFilter) : undefined;

  const { data, isLoading } = trpc.papers.list.useQuery({
    search: search || undefined,
    species: species as any || undefined,
    lifeStage: lifeStage as any || undefined,
    topicId,
    breedId,
    studyType: studyType as any || undefined,
    evidenceLevel: evidenceLevel as any || undefined,
    yearFrom,
    yearTo,
    limit: LIMIT,
    offset,
  });

  const { data: topicsData } = trpc.topics.list.useQuery({});
  const { data: breedsData } = trpc.breeds.list.useQuery({});

  const topicOptions = useMemo(() => [
    { value: 0, label: t("library_all_topics") },
    ...(topicsData?.map(tp => ({ value: tp.id, label: tp.name })) ?? []),
  ], [topicsData, t]);

  const breedOptions = useMemo(() => [
    { value: 0, label: t("library_all_breeds") },
    ...(breedsData?.map(b => ({ value: b.id, label: `${b.breedName} (${b.species === "cat" ? t("common_feline") : t("common_canine")})` })) ?? []),
  ], [breedsData, t]);

  const hasFilters = search || species || lifeStage || topicId || breedId || studyType || evidenceLevel || yearFilter;

  const clearFilters = () => {
    setSearch(""); setSpecies(""); setLifeStage("");
    setTopicId(undefined); setBreedId(undefined);
    setStudyType(""); setEvidenceLevel(""); setYearFilter("");
    setOffset(0);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOffset(0);
  };

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 0;
  const currentPage = Math.floor(offset / LIMIT) + 1;

  const FilterPanel = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="nasa-label">{t("library_filters")}</div>
        {hasFilters && (
          <button onClick={clearFilters} className="text-[0.65rem] font-['IBM_Plex_Mono'] text-[oklch(0.72_0.18_290)] hover:text-[oklch(0.82_0.14_290)] tracking-wider uppercase flex items-center gap-1">
            <X className="w-3 h-3" /> {t("library_clear_all")}
          </button>
        )}
      </div>

      <FilterSelect label={t("library_species")} value={species} onChange={(v) => { setSpecies(v); setOffset(0); }} options={SPECIES_OPTIONS} />
      <FilterSelect label={t("library_life_stage")} value={lifeStage} onChange={(v) => { setLifeStage(v); setOffset(0); }} options={LIFE_STAGE_OPTIONS} />

      <div>
        <label className="nasa-label block mb-1.5">{t("library_health_topic")}</label>
        <div className="relative">
          <select
            value={topicId ?? 0}
            onChange={(e) => { setTopicId(parseInt(e.target.value) || undefined); setOffset(0); }}
            className="w-full appearance-none bg-[oklch(0.15_0.025_285)] border border-[oklch(0.24_0.030_285)] text-[oklch(0.85_0.006_285)] text-[0.75rem] px-3 py-2 pr-8 rounded-sm focus:outline-none focus:border-[oklch(0.46_0.28_290)] transition-colors font-['IBM_Plex_Sans'] cursor-pointer"
          >
            {topicOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[oklch(0.15_0.025_285)]">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[oklch(0.50_0.010_285)] pointer-events-none" />
        </div>
      </div>

      <div>
        <label className="nasa-label block mb-1.5">{t("library_breed")}</label>
        <div className="relative">
          <select
            value={breedId ?? 0}
            onChange={(e) => { setBreedId(parseInt(e.target.value) || undefined); setOffset(0); }}
            className="w-full appearance-none bg-[oklch(0.15_0.025_285)] border border-[oklch(0.24_0.030_285)] text-[oklch(0.85_0.006_285)] text-[0.75rem] px-3 py-2 pr-8 rounded-sm focus:outline-none focus:border-[oklch(0.46_0.28_290)] transition-colors font-['IBM_Plex_Sans'] cursor-pointer"
          >
            {breedOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[oklch(0.15_0.025_285)]">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[oklch(0.50_0.010_285)] pointer-events-none" />
        </div>
      </div>

      <FilterSelect label={t("library_study_type")} value={studyType} onChange={(v) => { setStudyType(v); setOffset(0); }} options={STUDY_TYPE_OPTIONS} />
      <FilterSelect label={t("library_evidence_level")} value={evidenceLevel} onChange={(v) => { setEvidenceLevel(v); setOffset(0); }} options={EVIDENCE_OPTIONS} />
      <FilterSelect label={t("library_year")} value={yearFilter} onChange={(v) => { setYearFilter(v); setOffset(0); }} options={YEAR_OPTIONS} />
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Page header */}
      <div className="border-b border-[oklch(0.20_0.030_285)] bg-[oklch(0.11_0.022_285)]">
        <div className="container py-8">
          <div className="nasa-label mb-2">Academic Literature</div>
          <h1 className="text-3xl font-bold text-white font-['IBM_Plex_Sans'] mb-2">{t("library_title")}</h1>
          <p className="text-[0.82rem] text-[oklch(0.52_0.010_285)]">
            {data?.total ?? "..."} {t("library_results")} · {t("library_subtitle")}
          </p>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex gap-6">
          {/* Sidebar filters (desktop) */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-20 bg-[oklch(0.13_0.022_285)] border border-[oklch(0.20_0.030_285)] p-4 rounded-sm">
              <FilterPanel />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Search bar + mobile filter toggle */}
            <div className="flex gap-2 mb-5">
              <form onSubmit={handleSearchSubmit} className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[oklch(0.45_0.010_285)]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("library_search_placeholder")}
                  className="w-full pl-9 pr-4 py-2.5 bg-[oklch(0.15_0.025_285)] border border-[oklch(0.24_0.030_285)] text-white text-sm rounded-sm focus:outline-none focus:border-[oklch(0.46_0.28_290)] transition-colors placeholder-[oklch(0.42_0.010_285)] font-['Inter']"
                />
              </form>
              <button
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="lg:hidden flex items-center gap-2 px-3 py-2.5 bg-[oklch(0.15_0.025_285)] border border-[oklch(0.24_0.030_285)] text-[oklch(0.70_0.010_285)] text-sm rounded-sm hover:border-[oklch(0.46_0.28_290)] transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {t("library_filters_mobile")}
                {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.72_0.18_290)]" />}
              </button>
            </div>

            {/* Mobile filters */}
            {mobileFiltersOpen && (
              <div className="lg:hidden mb-5 bg-[oklch(0.13_0.022_285)] border border-[oklch(0.20_0.030_285)] p-4 rounded-sm">
                <FilterPanel />
              </div>
            )}

            {/* Active filter chips */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {search && <span className="nasa-tag nasa-tag-purple flex items-center gap-1">{search} <button onClick={() => setSearch("")}><X className="w-2.5 h-2.5" /></button></span>}
                {species && <span className="nasa-tag nasa-tag-blue flex items-center gap-1">{species} <button onClick={() => setSpecies("")}><X className="w-2.5 h-2.5" /></button></span>}
                {lifeStage && <span className="nasa-tag flex items-center gap-1">{lifeStage} <button onClick={() => setLifeStage("")}><X className="w-2.5 h-2.5" /></button></span>}
                {evidenceLevel && <span className="nasa-tag flex items-center gap-1">{evidenceLevel} {t("common_evidence")} <button onClick={() => setEvidenceLevel("")}><X className="w-2.5 h-2.5" /></button></span>}
              </div>
            )}

            {/* Results count */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-[0.72rem] text-[oklch(0.50_0.010_285)] font-['IBM_Plex_Mono']">
                {isLoading ? t("common_loading") : `${data?.total ?? 0} ${t("library_results")}`}
                {data && data.total > LIMIT && ` · ${t("library_page")} ${currentPage} ${t("library_of")} ${totalPages}`}
              </div>
            </div>

            {/* Papers grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="nasa-card p-5 h-64 animate-pulse">
                    <div className="flex gap-2 mb-3">
                      <div className="h-5 w-16 bg-[oklch(0.20_0.025_285)] rounded-sm" />
                      <div className="h-5 w-20 bg-[oklch(0.20_0.025_285)] rounded-sm" />
                    </div>
                    <div className="h-4 bg-[oklch(0.20_0.025_285)] rounded-sm mb-2 w-full" />
                    <div className="h-4 bg-[oklch(0.20_0.025_285)] rounded-sm mb-2 w-4/5" />
                    <div className="h-3 bg-[oklch(0.18_0.022_285)] rounded-sm mb-4 w-1/2" />
                    <div className="h-3 bg-[oklch(0.18_0.022_285)] rounded-sm mb-1 w-full" />
                    <div className="h-3 bg-[oklch(0.18_0.022_285)] rounded-sm w-3/4" />
                  </div>
                ))}
              </div>
            ) : data?.papers && data.papers.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {data.papers.map((paper) => (
                    <PaperCard key={paper.id} paper={paper as any} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setOffset(Math.max(0, offset - LIMIT))}
                      disabled={offset === 0}
                      className="px-4 py-2 text-[0.72rem] font-['IBM_Plex_Mono'] tracking-wider uppercase border border-[oklch(0.24_0.030_285)] text-[oklch(0.60_0.010_285)] hover:border-[oklch(0.46_0.28_290)] hover:text-[oklch(0.72_0.18_290)] disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-sm"
                    >
                      {t("library_prev")}
                    </button>
                    <span className="text-[0.70rem] font-['IBM_Plex_Mono'] text-[oklch(0.50_0.010_285)] px-2">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setOffset(offset + LIMIT)}
                      disabled={offset + LIMIT >= (data?.total ?? 0)}
                      className="px-4 py-2 text-[0.72rem] font-['IBM_Plex_Mono'] tracking-wider uppercase border border-[oklch(0.24_0.030_285)] text-[oklch(0.60_0.010_285)] hover:border-[oklch(0.46_0.28_290)] hover:text-[oklch(0.72_0.18_290)] disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-sm"
                    >
                      {t("library_next")}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 border border-[oklch(0.20_0.030_285)] rounded-sm">
                <BookOpen className="w-10 h-10 mx-auto mb-3 text-[oklch(0.32_0.010_285)]" />
                <p className="text-[oklch(0.52_0.010_285)] text-sm mb-2">{t("library_no_results")}</p>
                {hasFilters && (
                  <button onClick={clearFilters} className="mt-4 text-[0.70rem] font-['IBM_Plex_Mono'] tracking-wider uppercase text-[oklch(0.72_0.18_290)] hover:text-[oklch(0.82_0.14_290)]">
                    {t("library_clear_filters")}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
