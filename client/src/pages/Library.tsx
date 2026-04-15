import PaperCard from "@/components/PaperCard";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { BookOpen, ChevronDown, Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

const SPECIES_OPTIONS = [
  { value: "", label: "All Species" },
  { value: "cat", label: "Cats (Feline)" },
  { value: "dog", label: "Dogs (Canine)" },
  { value: "both", label: "Both Species" },
];

const LIFE_STAGE_OPTIONS = [
  { value: "", label: "All Life Stages" },
  { value: "junior", label: "Junior / Kitten / Puppy" },
  { value: "adult", label: "Adult" },
  { value: "senior", label: "Senior" },
];

const STUDY_TYPE_OPTIONS = [
  { value: "", label: "All Study Types" },
  { value: "rct", label: "RCT" },
  { value: "meta_analysis", label: "Meta-Analysis" },
  { value: "review", label: "Review" },
  { value: "cohort", label: "Cohort Study" },
  { value: "observational", label: "Observational" },
  { value: "in_vitro", label: "In Vitro" },
  { value: "case_study", label: "Case Study" },
];

const EVIDENCE_OPTIONS = [
  { value: "", label: "All Evidence Levels" },
  { value: "high", label: "High Evidence" },
  { value: "medium", label: "Medium Evidence" },
  { value: "low", label: "Low Evidence" },
];

const YEAR_OPTIONS = [
  { value: "", label: "All Years" },
  { value: "2024", label: "2024" },
  { value: "2023", label: "2023" },
  { value: "2022", label: "2022" },
  { value: "2021", label: "2021" },
  { value: "2020", label: "2020" },
  { value: "2019", label: "2015–2019" },
];

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
          className="w-full appearance-none bg-[oklch(0.16_0.022_240)] border border-[oklch(0.24_0.018_240)] text-[oklch(0.85_0.006_240)] text-[0.75rem] px-3 py-2 pr-8 rounded-sm focus:outline-none focus:border-[oklch(0.55_0.22_25)] transition-colors font-['IBM_Plex_Sans'] cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[oklch(0.16_0.022_240)]">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[oklch(0.50_0.010_240)] pointer-events-none" />
      </div>
    </div>
  );
}

export default function Library() {
  const [location] = useLocation();
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
    { value: 0, label: "All Topics" },
    ...(topicsData?.map(t => ({ value: t.id, label: t.name })) ?? []),
  ], [topicsData]);

  const breedOptions = useMemo(() => [
    { value: 0, label: "All Breeds" },
    ...(breedsData?.map(b => ({ value: b.id, label: `${b.breedName} (${b.species === "cat" ? "Cat" : "Dog"})` })) ?? []),
  ], [breedsData]);

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
        <div className="nasa-label">Filters</div>
        {hasFilters && (
          <button onClick={clearFilters} className="text-[0.65rem] font-['IBM_Plex_Mono'] text-[oklch(0.55_0.22_25)] hover:text-[oklch(0.70_0.18_25)] tracking-wider uppercase flex items-center gap-1">
            <X className="w-3 h-3" /> Clear All
          </button>
        )}
      </div>

      <FilterSelect label="Species" value={species} onChange={(v) => { setSpecies(v); setOffset(0); }} options={SPECIES_OPTIONS} />
      <FilterSelect label="Life Stage" value={lifeStage} onChange={(v) => { setLifeStage(v); setOffset(0); }} options={LIFE_STAGE_OPTIONS} />

      <div>
        <label className="nasa-label block mb-1.5">Health Topic</label>
        <div className="relative">
          <select
            value={topicId ?? 0}
            onChange={(e) => { setTopicId(parseInt(e.target.value) || undefined); setOffset(0); }}
            className="w-full appearance-none bg-[oklch(0.16_0.022_240)] border border-[oklch(0.24_0.018_240)] text-[oklch(0.85_0.006_240)] text-[0.75rem] px-3 py-2 pr-8 rounded-sm focus:outline-none focus:border-[oklch(0.55_0.22_25)] transition-colors font-['IBM_Plex_Sans'] cursor-pointer"
          >
            {topicOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[oklch(0.16_0.022_240)]">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[oklch(0.50_0.010_240)] pointer-events-none" />
        </div>
      </div>

      <div>
        <label className="nasa-label block mb-1.5">Breed</label>
        <div className="relative">
          <select
            value={breedId ?? 0}
            onChange={(e) => { setBreedId(parseInt(e.target.value) || undefined); setOffset(0); }}
            className="w-full appearance-none bg-[oklch(0.16_0.022_240)] border border-[oklch(0.24_0.018_240)] text-[oklch(0.85_0.006_240)] text-[0.75rem] px-3 py-2 pr-8 rounded-sm focus:outline-none focus:border-[oklch(0.55_0.22_25)] transition-colors font-['IBM_Plex_Sans'] cursor-pointer"
          >
            {breedOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[oklch(0.16_0.022_240)]">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[oklch(0.50_0.010_240)] pointer-events-none" />
        </div>
      </div>

      <FilterSelect label="Study Type" value={studyType} onChange={(v) => { setStudyType(v); setOffset(0); }} options={STUDY_TYPE_OPTIONS} />
      <FilterSelect label="Evidence Level" value={evidenceLevel} onChange={(v) => { setEvidenceLevel(v); setOffset(0); }} options={EVIDENCE_OPTIONS} />
      <FilterSelect label="Publication Year" value={yearFilter} onChange={(v) => { setYearFilter(v); setOffset(0); }} options={YEAR_OPTIONS} />
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Page header */}
      <div className="border-b border-[oklch(0.20_0.015_240)] bg-[oklch(0.12_0.020_240)]">
        <div className="container py-8">
          <div className="nasa-label mb-2">Academic Literature</div>
          <h1 className="text-3xl font-bold text-white font-['IBM_Plex_Sans'] mb-2">Reference Library</h1>
          <p className="text-[0.82rem] text-[oklch(0.55_0.010_240)]">
            {data?.total ?? "..."} papers · Search and filter by species, life stage, health topic, breed, and more
          </p>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex gap-6">
          {/* Sidebar filters (desktop) */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-20 bg-[oklch(0.13_0.018_240)] border border-[oklch(0.20_0.015_240)] p-4 rounded-sm">
              <FilterPanel />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Search bar + mobile filter toggle */}
            <div className="flex gap-2 mb-5">
              <form onSubmit={handleSearchSubmit} className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[oklch(0.45_0.010_240)]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search titles, authors, journals..."
                  className="w-full pl-9 pr-4 py-2.5 bg-[oklch(0.16_0.022_240)] border border-[oklch(0.24_0.018_240)] text-white text-sm rounded-sm focus:outline-none focus:border-[oklch(0.55_0.22_25)] transition-colors placeholder-[oklch(0.42_0.010_240)] font-['Inter']"
                />
              </form>
              <button
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="lg:hidden flex items-center gap-2 px-3 py-2.5 bg-[oklch(0.16_0.022_240)] border border-[oklch(0.24_0.018_240)] text-[oklch(0.70_0.010_240)] text-sm rounded-sm hover:border-[oklch(0.55_0.22_25)] transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.55_0.22_25)]" />}
              </button>
            </div>

            {/* Mobile filters */}
            {mobileFiltersOpen && (
              <div className="lg:hidden mb-5 bg-[oklch(0.13_0.018_240)] border border-[oklch(0.20_0.015_240)] p-4 rounded-sm">
                <FilterPanel />
              </div>
            )}

            {/* Active filter chips */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {search && <span className="nasa-tag nasa-tag-red flex items-center gap-1">{search} <button onClick={() => setSearch("")}><X className="w-2.5 h-2.5" /></button></span>}
                {species && <span className="nasa-tag nasa-tag-blue flex items-center gap-1">{species} <button onClick={() => setSpecies("")}><X className="w-2.5 h-2.5" /></button></span>}
                {lifeStage && <span className="nasa-tag flex items-center gap-1">{lifeStage} <button onClick={() => setLifeStage("")}><X className="w-2.5 h-2.5" /></button></span>}
                {evidenceLevel && <span className="nasa-tag flex items-center gap-1">{evidenceLevel} evidence <button onClick={() => setEvidenceLevel("")}><X className="w-2.5 h-2.5" /></button></span>}
              </div>
            )}

            {/* Results count */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-[0.72rem] text-[oklch(0.50_0.010_240)] font-['IBM_Plex_Mono']">
                {isLoading ? "Loading..." : `${data?.total ?? 0} results`}
                {data && data.total > LIMIT && ` · Page ${currentPage} of ${totalPages}`}
              </div>
            </div>

            {/* Papers grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="nasa-card p-5 h-64 animate-pulse">
                    <div className="flex gap-2 mb-3">
                      <div className="h-5 w-16 bg-[oklch(0.20_0.018_240)] rounded-sm" />
                      <div className="h-5 w-20 bg-[oklch(0.20_0.018_240)] rounded-sm" />
                    </div>
                    <div className="h-4 bg-[oklch(0.20_0.018_240)] rounded-sm mb-2 w-full" />
                    <div className="h-4 bg-[oklch(0.20_0.018_240)] rounded-sm mb-2 w-4/5" />
                    <div className="h-3 bg-[oklch(0.18_0.015_240)] rounded-sm mb-4 w-1/2" />
                    <div className="h-3 bg-[oklch(0.18_0.015_240)] rounded-sm mb-1 w-full" />
                    <div className="h-3 bg-[oklch(0.18_0.015_240)] rounded-sm w-3/4" />
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
                      className="px-4 py-2 text-[0.72rem] font-['IBM_Plex_Mono'] tracking-wider uppercase border border-[oklch(0.24_0.018_240)] text-[oklch(0.60_0.010_240)] hover:border-[oklch(0.55_0.22_25)] hover:text-[oklch(0.55_0.22_25)] disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-sm"
                    >
                      Previous
                    </button>
                    <span className="text-[0.70rem] font-['IBM_Plex_Mono'] text-[oklch(0.50_0.010_240)] px-2">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setOffset(offset + LIMIT)}
                      disabled={offset + LIMIT >= (data?.total ?? 0)}
                      className="px-4 py-2 text-[0.72rem] font-['IBM_Plex_Mono'] tracking-wider uppercase border border-[oklch(0.24_0.018_240)] text-[oklch(0.60_0.010_240)] hover:border-[oklch(0.55_0.22_25)] hover:text-[oklch(0.55_0.22_25)] disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-sm"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 border border-[oklch(0.20_0.015_240)] rounded-sm">
                <BookOpen className="w-10 h-10 mx-auto mb-3 text-[oklch(0.35_0.010_240)]" />
                <p className="text-[oklch(0.55_0.010_240)] text-sm mb-2">No papers found</p>
                <p className="text-[oklch(0.40_0.010_240)] text-xs">Try adjusting your search or filters</p>
                {hasFilters && (
                  <button onClick={clearFilters} className="mt-4 text-[0.70rem] font-['IBM_Plex_Mono'] tracking-wider uppercase text-[oklch(0.55_0.22_25)] hover:text-[oklch(0.70_0.18_25)]">
                    Clear All Filters
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
