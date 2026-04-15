import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { ArrowRight, BookOpen, FlaskConical } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const FORMAT_TYPES = [
  { value: "", label: "All Formats" },
  { value: "xiaohongshu", label: "小红书 / RED" },
  { value: "ecommerce_detail", label: "E-commerce Detail" },
  { value: "faq", label: "FAQ / Q&A" },
  { value: "video_script", label: "Video Script" },
  { value: "infographic", label: "Infographic" },
  { value: "brand_education", label: "Brand Education" },
  { value: "social_post", label: "Social Post" },
  { value: "scientific_brief", label: "Scientific Brief" },
];

const FORMAT_COLORS: Record<string, string> = {
  xiaohongshu: "nasa-tag-red",
  ecommerce_detail: "nasa-tag-blue",
  faq: "nasa-tag-green",
  video_script: "nasa-tag-red",
  infographic: "nasa-tag-blue",
  brand_education: "",
  social_post: "nasa-tag-red",
  scientific_brief: "nasa-tag-blue",
};

export default function ContentOpportunities() {
  const [formatType, setFormatType] = useState("");
  const [offset, setOffset] = useState(0);
  const LIMIT = 12;

  const { data, isLoading } = trpc.contentAngles.list.useQuery({
    formatType: formatType || undefined,
    limit: LIMIT,
    offset,
  });

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 0;
  const currentPage = Math.floor(offset / LIMIT) + 1;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-[oklch(0.20_0.015_240)] bg-[oklch(0.12_0.020_240)]">
        <div className="container py-10">
          <div className="nasa-label mb-2">Brand Strategy</div>
          <h1 className="text-3xl font-bold text-white font-['IBM_Plex_Sans'] mb-2">Content Opportunities</h1>
          <p className="text-[0.82rem] text-[oklch(0.55_0.010_240)]">
            AI-generated brand content angles derived from peer-reviewed research — organized by format type
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Format type filter tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {FORMAT_TYPES.map((ft) => (
            <button
              key={ft.value}
              onClick={() => { setFormatType(ft.value); setOffset(0); }}
              className={cn(
                "px-3 py-1.5 text-[0.70rem] font-['IBM_Plex_Mono'] tracking-wider uppercase rounded-sm border transition-all",
                formatType === ft.value
                  ? "border-[oklch(0.55_0.22_25)] text-[oklch(0.55_0.22_25)] bg-[oklch(0.55_0.22_25/0.10)]"
                  : "border-[oklch(0.22_0.018_240)] text-[oklch(0.55_0.010_240)] hover:border-[oklch(0.35_0.025_240)] hover:text-[oklch(0.75_0.008_240)]"
              )}
            >
              {ft.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="text-[0.70rem] text-[oklch(0.45_0.010_240)] font-['IBM_Plex_Mono'] mb-5">
          {isLoading ? "Loading..." : `${data?.total ?? 0} content opportunities`}
          {data && data.total > LIMIT && ` · Page ${currentPage} of ${totalPages}`}
        </div>

        {/* Content angles grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="nasa-card p-5 h-64 animate-pulse" />
            ))}
          </div>
        ) : data?.angles && data.angles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.angles.map(({ angle, paper }) => (
                <div key={angle.id} className="nasa-card p-5 flex flex-col">
                  {/* Format type + paper link */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className={cn("nasa-tag", FORMAT_COLORS[angle.formatType] || "")}>
                      {FORMAT_TYPES.find(f => f.value === angle.formatType)?.label || angle.formatType}
                    </span>
                    <Link href={`/paper/${paper.id}`}>
                      <BookOpen className="w-3.5 h-3.5 text-[oklch(0.45_0.010_240)] hover:text-[oklch(0.55_0.22_25)] transition-colors flex-shrink-0 mt-0.5" />
                    </Link>
                  </div>

                  {/* Title idea */}
                  {angle.titleIdea && (
                    <h3 className="text-[0.85rem] font-semibold text-white leading-snug mb-2 font-['IBM_Plex_Sans']">
                      {angle.titleIdea}
                    </h3>
                  )}

                  {/* Target audience */}
                  {angle.targetAudience && (
                    <div className="text-[0.65rem] text-[oklch(0.48_0.010_240)] font-['IBM_Plex_Mono'] mb-3">
                      → {angle.targetAudience}
                    </div>
                  )}

                  {/* Consumer summary */}
                  {angle.consumerSummary && (
                    <p className="text-[0.75rem] text-[oklch(0.65_0.008_240)] leading-relaxed line-clamp-4 flex-1 mb-3">
                      {angle.consumerSummary}
                    </p>
                  )}

                  {/* Risk note */}
                  {angle.riskNote && (
                    <div className="p-2.5 bg-[oklch(0.82_0.18_75/0.07)] border border-[oklch(0.82_0.18_75/0.20)] rounded-sm mb-3">
                      <div className="text-[0.60rem] font-['IBM_Plex_Mono'] text-[oklch(0.82_0.18_75)] mb-0.5 tracking-wider uppercase">Risk Note</div>
                      <p className="text-[0.68rem] text-[oklch(0.68_0.012_75)] leading-relaxed line-clamp-2">
                        {angle.riskNote}
                      </p>
                    </div>
                  )}

                  {/* Source paper */}
                  <div className="mt-auto pt-3 border-t border-[oklch(0.20_0.015_240)]">
                    <Link href={`/paper/${paper.id}`}>
                      <div className="group flex items-center gap-2 hover:text-[oklch(0.55_0.22_25)] transition-colors">
                        <FlaskConical className="w-3 h-3 text-[oklch(0.45_0.010_240)] group-hover:text-[oklch(0.55_0.22_25)] flex-shrink-0" />
                        <span className="text-[0.65rem] text-[oklch(0.48_0.010_240)] group-hover:text-[oklch(0.55_0.22_25)] truncate font-['IBM_Plex_Mono'] transition-colors">
                          {paper.title.slice(0, 60)}...
                        </span>
                        <ArrowRight className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  </div>
                </div>
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
            <FlaskConical className="w-10 h-10 mx-auto mb-3 text-[oklch(0.35_0.010_240)]" />
            <p className="text-[oklch(0.55_0.010_240)] text-sm mb-2">No content opportunities yet</p>
            <p className="text-[oklch(0.40_0.010_240)] text-xs">
              Generate content angles from papers in the Admin CMS
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
