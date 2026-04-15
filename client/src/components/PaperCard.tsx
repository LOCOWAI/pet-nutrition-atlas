import { cn } from "@/lib/utils";
import { ArrowRight, BookOpen, Calendar, FlaskConical } from "lucide-react";
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

const STUDY_TYPE_LABELS: Record<string, string> = {
  review: "Review",
  rct: "RCT",
  observational: "Observational",
  in_vitro: "In Vitro",
  meta_analysis: "Meta-Analysis",
  case_study: "Case Study",
  cohort: "Cohort",
  other: "Other",
};

const EVIDENCE_COLORS: Record<string, string> = {
  high: "evidence-high",
  medium: "evidence-medium",
  low: "evidence-low",
};

const SPECIES_LABELS: Record<string, string> = {
  cat: "Feline",
  dog: "Canine",
  both: "Feline & Canine",
  other: "Other",
};

const LIFE_STAGE_LABELS: Record<string, string> = {
  junior: "Junior",
  adult: "Adult",
  senior: "Senior",
  all: "All Stages",
};

export default function PaperCard({ paper, compact = false, className }: PaperCardProps) {
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
            {paper.evidenceLevel.toUpperCase()} Evidence
          </span>
          {paper.featured && (
            <span className="nasa-tag nasa-tag-red">Featured</span>
          )}
        </div>

        {/* Title */}
        <h3 className={cn(
          "font-semibold text-[oklch(0.95_0.005_240)] leading-snug group-hover:text-[oklch(0.80_0.15_25)] transition-colors mb-2",
          compact ? "text-[0.85rem] line-clamp-2" : "text-[0.92rem] line-clamp-3"
        )}>
          {paper.title}
        </h3>

        {/* Authors & Journal */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[0.70rem] text-[oklch(0.58_0.010_240)] font-['IBM_Plex_Mono'] truncate">
            {paper.authors.split(",").slice(0, 2).join(",")}
            {paper.authors.split(",").length > 2 ? " et al." : ""}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[0.68rem] text-[oklch(0.50_0.010_240)] font-['IBM_Plex_Mono'] mb-3">
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
          <p className="text-[0.78rem] text-[oklch(0.62_0.010_240)] leading-relaxed line-clamp-3 mb-3 flex-1">
            {paper.coreSummary}
          </p>
        )}

        {/* Key findings preview */}
        {!compact && paper.keyFindings && paper.keyFindings.length > 0 && (
          <div className="mb-3">
            <div className="nasa-label mb-1.5">Key Finding</div>
            <p className="text-[0.75rem] text-[oklch(0.68_0.010_240)] leading-relaxed line-clamp-2">
              {paper.keyFindings[0]}
            </p>
          </div>
        )}

        {/* Read more */}
        <div className="mt-auto pt-3 border-t border-[oklch(0.20_0.015_240)] flex items-center justify-between">
          <span className="text-[0.65rem] font-['IBM_Plex_Mono'] tracking-wider uppercase text-[oklch(0.45_0.010_240)]">
            View Paper
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-[oklch(0.55_0.22_25)] group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
