import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { ArrowRight, BookOpen, FlaskConical } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const FORMAT_TYPE_KEYS = [
  { value: "", key: "content_all_formats" as const },
  { value: "xiaohongshu", key: "format_xiaohongshu" as const },
  { value: "ecommerce_detail", key: "format_ecommerce_detail" as const },
  { value: "faq", key: "format_faq" as const },
  { value: "video_script", key: "format_video_script" as const },
  { value: "infographic", key: "format_infographic" as const },
  { value: "brand_education", key: "format_brand_education" as const },
  { value: "social_post", key: "format_social_post" as const },
  { value: "scientific_brief", key: "format_scientific_brief" as const },
  { value: "blog_article", key: "format_blog_article" as const },
  { value: "email_campaign", key: "format_email_campaign" as const },
  { value: "product_claim", key: "format_product_claim" as const },
  { value: "vet_education", key: "format_vet_education" as const },
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
  blog_article: "nasa-tag-green",
  email_campaign: "nasa-tag-blue",
  product_claim: "nasa-tag-red",
  vet_education: "",
};

export default function ContentOpportunities() {
  const [formatType, setFormatType] = useState("");
  const [offset, setOffset] = useState(0);
  const LIMIT = 12;
  const { t, isZh } = useLanguage();

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
      <div className="border-b border-[oklch(0.20_0.030_285)] bg-[oklch(0.11_0.022_285)]">
        <div className="container py-10">
          <div className="nasa-label mb-2">Brand Strategy</div>
          <h1 className="text-3xl font-bold text-white font-['IBM_Plex_Sans'] mb-2">{t("content_title")}</h1>
          <p className="text-[0.82rem] text-[oklch(0.52_0.010_285)]">
            {t("content_subtitle")}
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Format type filter tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {FORMAT_TYPE_KEYS.map((ft) => (
            <button
              key={ft.value}
              onClick={() => { setFormatType(ft.value); setOffset(0); }}
              className={cn(
                "px-3 py-1.5 text-[0.70rem] font-['IBM_Plex_Mono'] tracking-wider uppercase rounded-sm border transition-all",
                formatType === ft.value
                  ? "border-[oklch(0.72_0.18_290)] text-[oklch(0.82_0.14_290)] bg-[oklch(0.46_0.28_290/0.12)]"
                  : "border-[oklch(0.22_0.025_285)] text-[oklch(0.52_0.010_285)] hover:border-[oklch(0.35_0.030_285)] hover:text-[oklch(0.75_0.008_285)]"
              )}
            >
              {t(ft.key)}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="text-[0.70rem] text-[oklch(0.45_0.010_285)] font-['IBM_Plex_Mono'] mb-5">
          {isLoading ? t("content_loading") : `${data?.total ?? 0} ${isZh ? "条内容机会" : "content opportunities"}`}
          {data && data.total > LIMIT && ` · ${isZh ? "第" : "Page"} ${currentPage} ${isZh ? "页，共" : "of"} ${totalPages} ${isZh ? "页" : ""}`}
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
                      {t(FORMAT_TYPE_KEYS.find(f => f.value === angle.formatType)?.key ?? "content_all_formats")}
                    </span>
                    <Link href={`/paper/${paper.id}`}>
                      <BookOpen className="w-3.5 h-3.5 text-[oklch(0.45_0.010_285)] hover:text-[oklch(0.72_0.18_290)] transition-colors flex-shrink-0 mt-0.5" />
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
                    <div className="text-[0.65rem] text-[oklch(0.48_0.010_285)] font-['IBM_Plex_Mono'] mb-3">
                      → {angle.targetAudience}
                    </div>
                  )}

                  {/* Consumer summary */}
                  {angle.consumerSummary && (
                    <p className="text-[0.75rem] text-[oklch(0.65_0.008_285)] leading-relaxed line-clamp-4 flex-1 mb-3">
                      {angle.consumerSummary}
                    </p>
                  )}

                  {/* Risk note */}
                  {angle.riskNote && (
                    <div className="p-2.5 bg-[oklch(0.82_0.18_75/0.07)] border border-[oklch(0.82_0.18_75/0.20)] rounded-sm mb-3">
                      <div className="text-[0.60rem] font-['IBM_Plex_Mono'] text-[oklch(0.82_0.18_75)] mb-0.5 tracking-wider uppercase">{t("content_risk")}</div>
                      <p className="text-[0.68rem] text-[oklch(0.68_0.012_75)] leading-relaxed line-clamp-2">
                        {angle.riskNote}
                      </p>
                    </div>
                  )}

                  {/* Source paper */}
                  <div className="mt-auto pt-3 border-t border-[oklch(0.20_0.030_285)]">
                    <Link href={`/paper/${paper.id}`}>
                      <div className="group flex items-center gap-2 hover:text-[oklch(0.72_0.18_290)] transition-colors">
                        <FlaskConical className="w-3 h-3 text-[oklch(0.45_0.010_285)] group-hover:text-[oklch(0.72_0.18_290)] flex-shrink-0" />
                        <span className="text-[0.65rem] text-[oklch(0.48_0.010_285)] group-hover:text-[oklch(0.72_0.18_290)] truncate font-['IBM_Plex_Mono'] transition-colors">
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
                  className="px-4 py-2 text-[0.72rem] font-['IBM_Plex_Mono'] tracking-wider uppercase border border-[oklch(0.24_0.025_285)] text-[oklch(0.60_0.010_285)] hover:border-[oklch(0.72_0.18_290)] hover:text-[oklch(0.72_0.18_290)] disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-sm"
                >
                  {t("library_prev")}
                </button>
                <span className="text-[0.70rem] font-['IBM_Plex_Mono'] text-[oklch(0.50_0.010_285)] px-2">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setOffset(offset + LIMIT)}
                  disabled={offset + LIMIT >= (data?.total ?? 0)}
                  className="px-4 py-2 text-[0.72rem] font-['IBM_Plex_Mono'] tracking-wider uppercase border border-[oklch(0.24_0.025_285)] text-[oklch(0.60_0.010_285)] hover:border-[oklch(0.72_0.18_290)] hover:text-[oklch(0.72_0.18_290)] disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-sm"
                >
                  {t("library_next")}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 border border-[oklch(0.20_0.030_285)] rounded-sm">
            <FlaskConical className="w-10 h-10 mx-auto mb-3 text-[oklch(0.32_0.010_285)]" />
            <p className="text-[oklch(0.55_0.010_285)] text-sm mb-2">{t("content_no_angles")}</p>
            <p className="text-[oklch(0.40_0.010_285)] text-xs">
              {isZh ? "请在管理后台为文献生成内容方向" : "Generate content angles from papers in the Admin CMS"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
