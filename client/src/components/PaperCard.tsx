import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { ArrowRight, BookOpen, Calendar } from "lucide-react";
import { Link } from "wouter";

interface PaperCardProps {
  paper: {
    id: number;
    title: string;
    authors: string;
    year: number;
    journal?: string | null;
    species: string;
    lifeStage: string;
    studyType: string;
    evidenceLevel: string;
    coreSummary?: string | null;
    keyFindings?: string[] | null;
    featured?: boolean;
  };
  compact?: boolean;
  className?: string;
}

const EVIDENCE_COLORS: Record<string, string> = {
  high: "evidence-high",
  medium: "evidence-medium",
  low: "evidence-low",
};

export default function PaperCard({ paper, compact = false, className }: PaperCardProps) {
  const { t } = useLanguage();

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

  const SPECIES_LABELS: Record<string, string> = {
    cat: t("common_feline"),
    dog: t("common_canine"),
    both: t("common_both"),
    other: "Other",
  };

  const LIFE_STAGE_LABELS: Record<string, string> = {
    junior: t("home_life_junior"),
    adult: t("home_life_adult"),
    senior: t("home_life_senior"),
    all: "All",
  };

  const EVIDENCE_LABELS: Record<string, string> = {
    high: t("common_high"),
    medium: t("common_medium"),
    low: t("common_low"),
  };

  return (
    <Link href={`/paper/${paper.id}`}>
      <div className={cn("nasa-card p-5 cursor-pointer group h-full flex flex-col", className)}>
        {/* Header tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={cn("nasa-tag", paper.species === "cat" ? "nasa-tag-blue" : paper.species === "dog" ? "nasa-tag-green" : "")}>
            {SPECIES_LABELS[paper.species] || paper.species}
          </span>
          <span className="nasa-tag">{LIFE_STAGE_LABELS[paper.lifeStage] || paper.lifeStage}</span>
          <span className="nasa-tag">{STUDY_TYPE_LABELS[paper.studyType] || paper.studyType}</span>
          <span className={cn("nasa-tag", EVIDENCE_COLORS[paper.evidenceLevel])}>
            {EVIDENCE_LABELS[paper.evidenceLevel] || paper.evidenceLevel} {t("common_evidence")}
          </span>
          {paper.featured && (
            <span className="nasa-tag nasa-tag-red">{t("common_featured")}</span>
          )}
        </div>

        {/* Title */}
        <h3 className={cn(
          "font-semibold text-[oklch(0.95_0.005_285)] leading-snug group-hover:text-[oklch(0.82_0.14_290)] transition-colors mb-2",
          compact ? "text-[0.85rem] line-clamp-2" : "text-[0.92rem] line-clamp-3"
        )}>
          {paper.title}
        </h3>

        {/* Authors */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[0.70rem] text-[oklch(0.55_0.010_285)] font-['IBM_Plex_Mono'] truncate">
            {paper.authors.split(",").slice(0, 2).join(",")}
            {paper.authors.split(",").length > 2 ? " et al." : ""}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[0.68rem] text-[oklch(0.48_0.010_285)] font-['IBM_Plex_Mono'] mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {paper.year}
          </span>
          {paper.journal && (
            <span className="flex items-center gap-1 truncate">
              <BookOpen className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{paper.journal}</span>
            </span>
          )}
        </div>

        {/* Summary (non-compact only) */}
        {!compact && paper.coreSummary && (
          <p className="text-[0.78rem] text-[oklch(0.60_0.010_285)] leading-relaxed line-clamp-3 mb-3 flex-1">
            {paper.coreSummary}
          </p>
        )}

        {/* Key findings preview */}
        {!compact && paper.keyFindings && paper.keyFindings.length > 0 && (
          <div className="mb-3">
            <div className="nasa-label mb-1.5">Key Finding</div>
            <p className="text-[0.75rem] text-[oklch(0.65_0.010_285)] leading-relaxed line-clamp-2">
              {paper.keyFindings[0]}
            </p>
          </div>
        )}

        {/* Read more */}
        <div className="mt-auto pt-3 border-t border-[oklch(0.20_0.030_285)] flex items-center justify-between">
          <span className="text-[0.65rem] font-['IBM_Plex_Mono'] tracking-wider uppercase text-[oklch(0.45_0.010_285)]">
            {t("common_view_paper")}
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-[oklch(0.72_0.18_290)] group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
