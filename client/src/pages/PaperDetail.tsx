import InfographicRenderer from "@/components/InfographicRenderer";
import PaperCard from "@/components/PaperCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  BookOpen,
  BarChart3,
  Check,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  FlaskConical,
  Languages,
  Lightbulb,
  Link2,
  Microscope,
  Tag,
  TriangleAlert,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

function Section({ title, icon: Icon, children, className }: {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-6", className)}>
      <div className="nasa-section-header mb-3">
        <h2 className="text-[0.85rem] font-semibold text-white font-['IBM_Plex_Sans'] tracking-wide flex items-center gap-2">
          {Icon && <Icon className="w-3.5 h-3.5 text-[oklch(0.72_0.18_290)]" />}
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

type TranslatedPaper = {
  title: string;
  coreSummary: string;
  keyFindings: string[];
  practicalRelevance: string;
  limitations: string;
  harvardReference: string;
  contentAngles: Array<{
    id: number;
    titleIdea: string;
    consumerSummary: string;
    professionalSummary: string;
    riskNote: string;
    targetAudience: string;
  }>;
};

export default function PaperDetail({ params }: { params: { id: string } }) {
  const paperId = parseInt(params.id);
  const [copied, setCopied] = useState(false);
  const [translated, setTranslated] = useState<TranslatedPaper | null>(null);
  const [showTranslated, setShowTranslated] = useState(false);
  const { t, isZh } = useLanguage();

  const { data: paper, isLoading, error } = trpc.papers.getById.useQuery({ id: paperId });
  const { data: related } = trpc.papers.getRelated.useQuery({ paperId, limit: 4 }, { enabled: !!paper });

  const translateMutation = trpc.papers.translatePaper.useMutation({
    onSuccess: (data) => {
      setTranslated(data);
      setShowTranslated(true);
    },
  });

  const handleTranslate = () => {
    if (!paper) return;
    if (translated) {
      setShowTranslated(!showTranslated);
      return;
    }
    translateMutation.mutate({
      id: paper.id,
      title: paper.title,
      authors: paper.authors,
      journal: paper.journal ?? undefined,
      year: paper.year,
      coreSummary: paper.coreSummary ?? undefined,
      keyFindings: paper.keyFindings ?? undefined,
      practicalRelevance: paper.practicalRelevance ?? undefined,
      limitations: paper.limitations ?? undefined,
      harvardReference: paper.harvardReference ?? undefined,
      contentAngles: paper.contentAngles?.map(a => ({
        id: a.id,
        formatType: a.formatType,
        titleIdea: a.titleIdea ?? undefined,
        consumerSummary: a.consumerSummary ?? undefined,
        professionalSummary: a.professionalSummary ?? undefined,
        riskNote: a.riskNote ?? undefined,
        targetAudience: a.targetAudience ?? undefined,
      })),
    });
  };

  const copyHarvardRef = () => {
    const ref = showTranslated && translated ? translated.harvardReference : paper?.harvardReference;
    if (ref) {
      navigator.clipboard.writeText(ref);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Resolved display values (translated or original)
  const displayTitle = showTranslated && translated ? translated.title : paper?.title;
  const displayCoreSummary = showTranslated && translated ? translated.coreSummary : paper?.coreSummary;
  const displayKeyFindings = showTranslated && translated ? translated.keyFindings : paper?.keyFindings;
  const displayPracticalRelevance = showTranslated && translated ? translated.practicalRelevance : paper?.practicalRelevance;
  const displayLimitations = showTranslated && translated ? translated.limitations : paper?.limitations;
  const displayHarvardRef = showTranslated && translated ? translated.harvardReference : paper?.harvardReference;

  const FORMAT_TYPE_LABELS: Record<string, string> = {
    xiaohongshu: t("format_xiaohongshu"),
    ecommerce_detail: t("format_ecommerce_detail"),
    faq: t("format_faq"),
    video_script: t("format_video_script"),
    infographic: t("format_infographic"),
    brand_education: t("format_brand_education"),
    social_post: t("format_social_post"),
    scientific_brief: t("format_scientific_brief"),
  };

  const STUDY_TYPE_LABELS: Record<string, string> = {
    review: t("study_review"),
    rct: t("study_rct"),
    observational: t("study_observational"),
    in_vitro: t("study_in_vitro"),
    meta_analysis: t("study_meta_analysis"),
    case_study: t("study_case_study"),
    cohort: t("study_cohort"),
    other: t("study_other"),
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container py-8">
          <div className="animate-pulse space-y-4 max-w-4xl">
            <div className="h-4 w-48 bg-[oklch(0.20_0.025_285)] rounded-sm" />
            <div className="h-8 w-full bg-[oklch(0.20_0.025_285)] rounded-sm" />
            <div className="h-8 w-3/4 bg-[oklch(0.20_0.025_285)] rounded-sm" />
            <div className="h-4 w-1/2 bg-[oklch(0.18_0.022_285)] rounded-sm" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-[oklch(0.32_0.010_285)]" />
          <h2 className="text-lg font-semibold text-white mb-2">{t("paper_not_found")}</h2>
          <Link href="/library" className="text-[0.72rem] font-['IBM_Plex_Mono'] tracking-wider uppercase text-[oklch(0.72_0.18_290)] hover:text-[oklch(0.82_0.14_290)]">
            ← {t("paper_back")}
          </Link>
        </div>
      </div>
    );
  }

  const evidenceClass = paper.evidenceLevel === "high" ? "evidence-high" : paper.evidenceLevel === "medium" ? "evidence-medium" : "evidence-low";

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-[oklch(0.20_0.030_285)] bg-[oklch(0.11_0.022_285)]">
        <div className="container py-3">
          <div className="flex items-center gap-2 text-[0.68rem] font-['IBM_Plex_Mono'] text-[oklch(0.45_0.010_285)]">
            <Link href="/" className="hover:text-[oklch(0.72_0.18_290)] transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/library" className="hover:text-[oklch(0.72_0.18_290)] transition-colors">{t("nav_reference_library")}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[oklch(0.58_0.010_285)] truncate max-w-xs">{paper.title.slice(0, 50)}...</span>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="max-w-5xl">
          {/* Back button + Translate button */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/library" className="inline-flex items-center gap-2 text-[0.70rem] font-['IBM_Plex_Mono'] tracking-wider uppercase text-[oklch(0.50_0.010_285)] hover:text-[oklch(0.72_0.18_290)] transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              {t("paper_back")}
            </Link>

            <div className="flex items-center gap-2">
              {/* Print / Save as PDF */}
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 text-[0.70rem] font-['IBM_Plex_Mono'] tracking-wider uppercase border border-[oklch(0.28_0.035_285)] text-[oklch(0.55_0.010_285)] hover:border-[oklch(0.46_0.28_290)] hover:text-[oklch(0.72_0.18_290)] transition-colors print:hidden"
              >
                <Download className="w-3.5 h-3.5" />
                PDF
              </button>

            {/* Translate Button */}
            <button
              onClick={handleTranslate}
              disabled={translateMutation.isPending}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-[0.70rem] font-['IBM_Plex_Mono'] tracking-wider uppercase rounded-sm border transition-all",
                showTranslated
                  ? "border-[oklch(0.46_0.28_290)] bg-[oklch(0.46_0.28_290/0.15)] text-[oklch(0.82_0.14_290)]"
                  : "border-[oklch(0.28_0.035_285)] text-[oklch(0.55_0.010_285)] hover:border-[oklch(0.46_0.28_290)] hover:text-[oklch(0.72_0.18_290)]",
                translateMutation.isPending && "opacity-60 cursor-not-allowed"
              )}
            >
              <Languages className="w-3.5 h-3.5" />
              {translateMutation.isPending
                ? t("paper_translating")
                : showTranslated
                  ? t("paper_show_original")
                  : t("paper_translate_btn")}
            </button>
            </div>
          </div>

          {/* Translated badge */}
          {showTranslated && translated && (
            <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-[oklch(0.46_0.28_290/0.10)] border border-[oklch(0.46_0.28_290/0.30)] rounded-sm w-fit">
              <Languages className="w-3.5 h-3.5 text-[oklch(0.72_0.18_290)]" />
              <span className="text-[0.68rem] font-['IBM_Plex_Mono'] text-[oklch(0.72_0.18_290)] tracking-wider uppercase">
                {t("paper_translated_badge")}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2">
              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                <span className={cn("nasa-tag", paper.species === "cat" ? "nasa-tag-blue" : "nasa-tag-green")}>
                  {paper.species === "cat" ? t("common_feline") : paper.species === "dog" ? t("common_canine") : t("common_both")}
                </span>
                <span className="nasa-tag">{paper.lifeStage}</span>
                <span className="nasa-tag">{STUDY_TYPE_LABELS[paper.studyType] || paper.studyType}</span>
                <span className={cn("nasa-tag", evidenceClass)}>
                  {paper.evidenceLevel.toUpperCase()} {t("common_evidence")}
                </span>
                {paper.featured && <span className="nasa-tag nasa-tag-red">{t("common_featured")}</span>}
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-snug mb-4 font-['IBM_Plex_Sans']">
                {displayTitle}
              </h1>

              {/* Authors & metadata */}
              <div className="space-y-1.5 mb-6 pb-6 border-b border-[oklch(0.20_0.030_285)]">
                <div className="flex gap-2">
                  <span className="nasa-label w-24 flex-shrink-0">{t("paper_authors")}</span>
                  <span className="text-[0.80rem] text-[oklch(0.75_0.008_285)]">{paper.authors}</span>
                </div>
                <div className="flex gap-2">
                  <span className="nasa-label w-24 flex-shrink-0">{t("paper_journal")}</span>
                  <span className="text-[0.80rem] text-[oklch(0.75_0.008_285)]">{paper.journal || "—"}</span>
                </div>
                <div className="flex gap-2">
                  <span className="nasa-label w-24 flex-shrink-0">{t("paper_year")}</span>
                  <span className="text-[0.80rem] text-[oklch(0.75_0.008_285)]">{paper.year}</span>
                </div>
                {paper.doi && (
                  <div className="flex gap-2 items-center">
                    <span className="nasa-label w-24 flex-shrink-0">{t("paper_doi")}</span>
                    <a
                      href={`https://doi.org/${paper.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[0.80rem] text-[oklch(0.72_0.18_290)] hover:text-[oklch(0.82_0.14_290)] flex items-center gap-1 transition-colors"
                    >
                      {paper.doi}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                {paper.breedRelevance && (
                  <div className="flex gap-2">
                    <span className="nasa-label w-24 flex-shrink-0">{t("paper_breeds")}</span>
                    <span className="text-[0.80rem] text-[oklch(0.75_0.008_285)]">{paper.breedRelevance}</span>
                  </div>
                )}
              </div>

              {/* Core Summary */}
              {displayCoreSummary && (
                <Section title={t("paper_core_summary")} icon={Microscope}>
                  <div className="bg-[oklch(0.14_0.022_285)] border border-[oklch(0.22_0.030_285)] border-l-2 border-l-[oklch(0.46_0.28_290)] p-5">
                    <p className="text-[0.83rem] text-[oklch(0.80_0.008_285)] leading-relaxed">
                      {displayCoreSummary}
                    </p>
                  </div>
                </Section>
              )}

              {/* Key Findings */}
              {displayKeyFindings && displayKeyFindings.length > 0 && (
                <Section title={t("paper_key_findings")} icon={FlaskConical}>
                  <div className="space-y-2">
                    {displayKeyFindings.map((finding, i) => (
                      <div key={i} className="flex gap-3 p-3 bg-[oklch(0.14_0.022_285)] border border-[oklch(0.20_0.030_285)]">
                        <span className="nasa-label flex-shrink-0 mt-0.5 text-[oklch(0.72_0.18_290)]">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <p className="text-[0.80rem] text-[oklch(0.78_0.008_285)] leading-relaxed">{finding}</p>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Practical Relevance */}
              {displayPracticalRelevance && (
                <Section title={t("paper_practical_relevance")} icon={Lightbulb}>
                  <div className="p-4 bg-[oklch(0.14_0.022_285)] border border-[oklch(0.22_0.030_285)]">
                    <p className="text-[0.82rem] text-[oklch(0.78_0.008_285)] leading-relaxed">
                      {displayPracticalRelevance}
                    </p>
                  </div>
                </Section>
              )}

              {/* Limitations */}
              {displayLimitations && (
                <Section title={t("paper_limitations")} icon={TriangleAlert}>
                  <div className="p-4 bg-[oklch(0.14_0.022_285)] border border-[oklch(0.22_0.030_285)] border-l-2 border-l-[oklch(0.82_0.18_75)]">
                    <p className="text-[0.80rem] text-[oklch(0.72_0.008_285)] leading-relaxed">
                      {displayLimitations}
                    </p>
                  </div>
                </Section>
              )}

              {/* Abstract */}
              {paper.abstract && (
                <Section title={t("paper_abstract")}>
                  <p className="text-[0.80rem] text-[oklch(0.62_0.008_285)] leading-relaxed">
                    {paper.abstract}
                  </p>
                </Section>
              )}

              {/* Content Angles */}
              {paper.contentAngles && paper.contentAngles.length > 0 && (
                <Section title={t("paper_content_angles")} icon={Tag}>
                  <div className="space-y-3">
                    {paper.contentAngles.map((angle) => {
                      const translatedAngle = showTranslated && translated
                        ? translated.contentAngles.find(a => a.id === angle.id)
                        : null;
                      const displayTitle = translatedAngle?.titleIdea ?? angle.titleIdea;
                      const displayConsumer = translatedAngle?.consumerSummary ?? angle.consumerSummary;
                      const displayRisk = translatedAngle?.riskNote ?? angle.riskNote;
                      const displayAudience = translatedAngle?.targetAudience ?? angle.targetAudience;

                      return (
                        <div key={angle.id} className="nasa-card p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="nasa-tag nasa-tag-purple">{FORMAT_TYPE_LABELS[angle.formatType] || angle.formatType}</span>
                            {displayAudience && (
                              <span className="text-[0.65rem] text-[oklch(0.48_0.010_285)] font-['IBM_Plex_Mono']">
                                {t("content_audience")}: {displayAudience}
                              </span>
                            )}
                          </div>
                          {displayTitle && (
                            <h4 className="text-[0.82rem] font-semibold text-white mb-2">{displayTitle}</h4>
                          )}
                          {displayConsumer && (
                            <div className="mb-2">
                              <div className="nasa-label mb-1">{t("paper_consumer_version")}</div>
                              <p className="text-[0.75rem] text-[oklch(0.68_0.008_285)] leading-relaxed">{displayConsumer}</p>
                            </div>
                          )}
                          {displayRisk && (
                            <div className="mt-2 p-2.5 bg-[oklch(0.82_0.18_75/0.08)] border border-[oklch(0.82_0.18_75/0.25)] rounded-sm">
                              <div className="nasa-label text-[oklch(0.82_0.18_75)] mb-0.5">{t("paper_claim_risk")}</div>
                              <p className="text-[0.72rem] text-[oklch(0.72_0.012_75)] leading-relaxed">{displayRisk}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Section>
              )}

              {/* Chinese Abstract */}
              {(paper as any).abstractZh && (
                <Section title={t("paper_abstract_zh")} icon={Languages}>
                  <div className="bg-[oklch(0.14_0.022_285)] border border-[oklch(0.22_0.030_285)] border-l-2 border-l-[oklch(0.82_0.18_75/0.6)] p-4">
                    <p className="text-[0.80rem] text-[oklch(0.72_0.008_285)] leading-relaxed">
                      {(paper as any).abstractZh}
                    </p>
                  </div>
                </Section>
              )}

              {/* Chinese Core Summary */}
              {(paper as any).summaryZh && (
                <Section title={t("paper_summary_zh")} icon={Languages}>
                  <div className="bg-[oklch(0.14_0.022_285)] border border-[oklch(0.22_0.030_285)] border-l-2 border-l-[oklch(0.82_0.18_75/0.6)] p-4">
                    <p className="text-[0.82rem] text-[oklch(0.80_0.008_285)] leading-relaxed">
                      {(paper as any).summaryZh}
                    </p>
                  </div>
                </Section>
              )}

              {/* Chinese Consumer Summary */}
              {(paper as any).consumerSummaryZh && (
                <Section title={t("paper_consumer_summary_zh")} icon={Languages}>
                  <div className="bg-[oklch(0.14_0.022_285)] border border-[oklch(0.22_0.030_285)] border-l-2 border-l-[oklch(0.82_0.18_75/0.6)] p-4">
                    <p className="text-[0.80rem] text-[oklch(0.72_0.008_285)] leading-relaxed">
                      {(paper as any).consumerSummaryZh}
                    </p>
                  </div>
                </Section>
              )}

              {/* Key Ingredients */}
              {(paper as any).ingredients && (paper as any).ingredients.length > 0 && (
                <Section title={t("paper_ingredients")} icon={FlaskConical}>
                  <div className="flex flex-wrap gap-2">
                    {((paper as any).ingredients as string[]).map((ing, i) => (
                      <span key={i} className="nasa-tag nasa-tag-green">{ing}</span>
                    ))}
                  </div>
                </Section>
              )}

              {/* Infographic Data */}
              {(paper as any).infographicData && (
                <Section title={t("infographic_title")} icon={BarChart3}>
                  <div className="nasa-label mb-3">
                    {t(`infographic_type_${(paper as any).infographicType}` as any) || (paper as any).infographicType}
                  </div>
                  <InfographicRenderer
                    data={(paper as any).infographicData}
                    infographicType={(paper as any).infographicType}
                  />
                </Section>
              )}

              {/* Harvard Reference */}
              {displayHarvardRef && (
                <Section title={t("paper_harvard_ref")} icon={BookOpen}>
                  <div className="relative p-4 bg-[oklch(0.14_0.022_285)] border border-[oklch(0.22_0.030_285)]">
                    <p className="text-[0.78rem] text-[oklch(0.70_0.008_285)] leading-relaxed font-['IBM_Plex_Mono'] pr-10">
                      {displayHarvardRef}
                    </p>
                    <button
                      onClick={copyHarvardRef}
                      className="absolute top-3 right-3 p-1.5 text-[oklch(0.50_0.010_285)] hover:text-[oklch(0.72_0.18_290)] transition-colors"
                      title={t("paper_copy_ref")}
                    >
                      {copied ? <Check className="w-4 h-4 text-[oklch(0.65_0.18_145)]" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </Section>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Evidence strength */}
              <div className="bg-[oklch(0.14_0.022_285)] border border-[oklch(0.22_0.030_285)] p-4">
                <div className="nasa-label mb-2">{t("paper_evidence_strength")}</div>
                <div className={cn("nasa-tag text-sm py-1.5 px-3 w-full justify-center", evidenceClass)}>
                  {paper.evidenceLevel.toUpperCase()}
                </div>
                <p className="text-[0.68rem] text-[oklch(0.48_0.010_285)] mt-2 leading-relaxed">
                  {paper.evidenceLevel === "high" && t("paper_evidence_high_desc")}
                  {paper.evidenceLevel === "medium" && t("paper_evidence_medium_desc")}
                  {paper.evidenceLevel === "low" && t("paper_evidence_low_desc")}
                </p>
              </div>

              {/* Topics */}
              {paper.topics && paper.topics.length > 0 && (
                <div className="bg-[oklch(0.14_0.022_285)] border border-[oklch(0.22_0.030_285)] p-4">
                  <div className="nasa-label mb-2">{t("paper_health_topics")}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {paper.topics.map((topic) => (
                      <Link key={topic.id} href={`/health-topics/${topic.slug}`}>
                        <span className="nasa-tag nasa-tag-blue cursor-pointer hover:border-[oklch(0.46_0.28_290/0.6)] transition-colors">
                          {topic.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Breeds */}
              {paper.breeds && paper.breeds.length > 0 && (
                <div className="bg-[oklch(0.14_0.022_285)] border border-[oklch(0.22_0.030_285)] p-4">
                  <div className="nasa-label mb-2">{t("paper_breed_relevance")}</div>
                  <div className="space-y-1.5">
                    {paper.breeds.map((breed) => (
                      <Link key={breed.id} href={`/breeds/${breed.slug}`}>
                        <div className="flex items-center justify-between py-1 hover:text-[oklch(0.72_0.18_290)] transition-colors cursor-pointer">
                          <span className="text-[0.75rem] text-[oklch(0.75_0.008_285)]">{breed.breedName}</span>
                          <div className="flex items-center gap-1">
                            <div className="w-12 h-1 bg-[oklch(0.22_0.030_285)] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[oklch(0.46_0.28_290)] to-[oklch(0.72_0.18_290)] rounded-full"
                                style={{ width: `${(breed.relevanceScore ?? 1) * 100}%` }}
                              />
                            </div>
                            <span className="text-[0.60rem] font-['IBM_Plex_Mono'] text-[oklch(0.45_0.010_285)]">
                              {Math.round((breed.relevanceScore ?? 1) * 100)}%
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Keywords */}
              {paper.keywords && paper.keywords.length > 0 && (
                <div className="bg-[oklch(0.14_0.022_285)] border border-[oklch(0.22_0.030_285)] p-4">
                  <div className="nasa-label mb-2">{t("paper_keywords")}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {paper.keywords.map((kw) => (
                      <span key={kw} className="nasa-tag">{kw}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* DOI link */}
              {paper.doi && (
                <a
                  href={`https://doi.org/${paper.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-[oklch(0.14_0.022_285)] border border-[oklch(0.22_0.030_285)] hover:border-[oklch(0.46_0.28_290/0.5)] transition-colors group"
                >
                  <Link2 className="w-4 h-4 text-[oklch(0.72_0.18_290)]" />
                  <span className="text-[0.72rem] font-['IBM_Plex_Mono'] text-[oklch(0.62_0.010_285)] group-hover:text-[oklch(0.72_0.18_290)] transition-colors">
                    {t("paper_view_original")}
                  </span>
                  <ExternalLink className="w-3 h-3 text-[oklch(0.45_0.010_285)] ml-auto" />
                </a>
              )}
            </div>
          </div>

          {/* Related Papers */}
          {related && related.length > 0 && (
            <div className="mt-10 pt-8 border-t border-[oklch(0.20_0.030_285)]">
              <div className="nasa-section-header mb-5">
                <h2 className="text-lg font-bold text-white font-['IBM_Plex_Sans']">{t("paper_related")}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {related.map((p) => (
                  <PaperCard key={p.id} paper={p as any} compact />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
