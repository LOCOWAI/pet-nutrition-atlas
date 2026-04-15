import PaperCard from "@/components/PaperCard";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  Copy,
  ExternalLink,
  FlaskConical,
  Lightbulb,
  Link2,
  Microscope,
  Tag,
  TriangleAlert,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const STUDY_TYPE_LABELS: Record<string, string> = {
  review: "Systematic Review",
  rct: "Randomized Controlled Trial (RCT)",
  observational: "Observational Study",
  in_vitro: "In Vitro Study",
  meta_analysis: "Meta-Analysis",
  case_study: "Case Study",
  cohort: "Cohort Study",
  other: "Other",
};

const FORMAT_TYPE_LABELS: Record<string, string> = {
  xiaohongshu: "小红书 / RED",
  ecommerce_detail: "E-commerce Detail Page",
  faq: "FAQ / Q&A",
  video_script: "Video Script",
  infographic: "Infographic",
  brand_education: "Brand Education",
  social_post: "Social Post",
  scientific_brief: "Scientific Brief",
};

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
          {Icon && <Icon className="w-3.5 h-3.5 text-[oklch(0.55_0.22_25)]" />}
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

export default function PaperDetail({ params }: { params: { id: string } }) {
  const paperId = parseInt(params.id);
  const [copied, setCopied] = useState(false);

  const { data: paper, isLoading, error } = trpc.papers.getById.useQuery({ id: paperId });
  const { data: related } = trpc.papers.getRelated.useQuery({ paperId, limit: 4 }, { enabled: !!paper });

  const copyHarvardRef = () => {
    if (paper?.harvardReference) {
      navigator.clipboard.writeText(paper.harvardReference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container py-8">
          <div className="animate-pulse space-y-4 max-w-4xl">
            <div className="h-4 w-48 bg-[oklch(0.20_0.018_240)] rounded-sm" />
            <div className="h-8 w-full bg-[oklch(0.20_0.018_240)] rounded-sm" />
            <div className="h-8 w-3/4 bg-[oklch(0.20_0.018_240)] rounded-sm" />
            <div className="h-4 w-1/2 bg-[oklch(0.18_0.015_240)] rounded-sm" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-[oklch(0.35_0.010_240)]" />
          <h2 className="text-lg font-semibold text-white mb-2">Paper Not Found</h2>
          <p className="text-[oklch(0.50_0.010_240)] text-sm mb-4">This paper may have been removed or the ID is incorrect.</p>
          <Link href="/library" className="text-[0.72rem] font-['IBM_Plex_Mono'] tracking-wider uppercase text-[oklch(0.55_0.22_25)] hover:text-[oklch(0.70_0.18_25)]">
            ← Back to Library
          </Link>
        </div>
      </div>
    );
  }

  const evidenceClass = paper.evidenceLevel === "high" ? "evidence-high" : paper.evidenceLevel === "medium" ? "evidence-medium" : "evidence-low";

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-[oklch(0.20_0.015_240)] bg-[oklch(0.12_0.020_240)]">
        <div className="container py-3">
          <div className="flex items-center gap-2 text-[0.68rem] font-['IBM_Plex_Mono'] text-[oklch(0.45_0.010_240)]">
            <Link href="/" className="hover:text-[oklch(0.55_0.22_25)] transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/library" className="hover:text-[oklch(0.55_0.22_25)] transition-colors">Reference Library</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[oklch(0.60_0.010_240)] truncate max-w-xs">{paper.title.slice(0, 50)}...</span>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="max-w-5xl">
          {/* Back button */}
          <Link href="/library" className="inline-flex items-center gap-2 text-[0.70rem] font-['IBM_Plex_Mono'] tracking-wider uppercase text-[oklch(0.50_0.010_240)] hover:text-[oklch(0.55_0.22_25)] transition-colors mb-6">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Library
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2">
              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                <span className={cn("nasa-tag", paper.species === "cat" ? "nasa-tag-blue" : "nasa-tag-green")}>
                  {paper.species === "cat" ? "Feline" : paper.species === "dog" ? "Canine" : "Both Species"}
                </span>
                <span className="nasa-tag">{paper.lifeStage}</span>
                <span className="nasa-tag">{STUDY_TYPE_LABELS[paper.studyType] || paper.studyType}</span>
                <span className={cn("nasa-tag", evidenceClass)}>
                  {paper.evidenceLevel.toUpperCase()} Evidence
                </span>
                {paper.featured && <span className="nasa-tag nasa-tag-red">Featured</span>}
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-snug mb-4 font-['IBM_Plex_Sans']">
                {paper.title}
              </h1>

              {/* Authors & metadata */}
              <div className="space-y-1.5 mb-6 pb-6 border-b border-[oklch(0.20_0.015_240)]">
                <div className="flex gap-2">
                  <span className="nasa-label w-24 flex-shrink-0">Authors</span>
                  <span className="text-[0.80rem] text-[oklch(0.75_0.008_240)]">{paper.authors}</span>
                </div>
                <div className="flex gap-2">
                  <span className="nasa-label w-24 flex-shrink-0">Journal</span>
                  <span className="text-[0.80rem] text-[oklch(0.75_0.008_240)]">{paper.journal || "—"}</span>
                </div>
                <div className="flex gap-2">
                  <span className="nasa-label w-24 flex-shrink-0">Year</span>
                  <span className="text-[0.80rem] text-[oklch(0.75_0.008_240)]">{paper.year}</span>
                </div>
                {paper.doi && (
                  <div className="flex gap-2 items-center">
                    <span className="nasa-label w-24 flex-shrink-0">DOI</span>
                    <a
                      href={`https://doi.org/${paper.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[0.80rem] text-[oklch(0.55_0.22_25)] hover:text-[oklch(0.70_0.18_25)] flex items-center gap-1 transition-colors"
                    >
                      {paper.doi}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                {paper.breedRelevance && (
                  <div className="flex gap-2">
                    <span className="nasa-label w-24 flex-shrink-0">Breeds</span>
                    <span className="text-[0.80rem] text-[oklch(0.75_0.008_240)]">{paper.breedRelevance}</span>
                  </div>
                )}
              </div>

              {/* Core Summary */}
              {paper.coreSummary && (
                <Section title="Core Summary" icon={Microscope}>
                  <div className="bg-[oklch(0.14_0.020_240)] border border-[oklch(0.22_0.018_240)] border-l-2 border-l-[oklch(0.55_0.22_25)] p-5">
                    <p className="text-[0.83rem] text-[oklch(0.80_0.008_240)] leading-relaxed">
                      {paper.coreSummary}
                    </p>
                  </div>
                </Section>
              )}

              {/* Key Findings */}
              {paper.keyFindings && paper.keyFindings.length > 0 && (
                <Section title="Key Findings" icon={FlaskConical}>
                  <div className="space-y-2">
                    {paper.keyFindings.map((finding, i) => (
                      <div key={i} className="flex gap-3 p-3 bg-[oklch(0.14_0.020_240)] border border-[oklch(0.20_0.015_240)]">
                        <span className="nasa-label flex-shrink-0 mt-0.5 text-[oklch(0.55_0.22_25)]">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <p className="text-[0.80rem] text-[oklch(0.78_0.008_240)] leading-relaxed">{finding}</p>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Practical Relevance */}
              {paper.practicalRelevance && (
                <Section title="Practical Relevance" icon={Lightbulb}>
                  <div className="p-4 bg-[oklch(0.14_0.020_240)] border border-[oklch(0.22_0.018_240)]">
                    <p className="text-[0.82rem] text-[oklch(0.78_0.008_240)] leading-relaxed">
                      {paper.practicalRelevance}
                    </p>
                  </div>
                </Section>
              )}

              {/* Limitations */}
              {paper.limitations && (
                <Section title="Study Limitations" icon={TriangleAlert}>
                  <div className="p-4 bg-[oklch(0.14_0.020_240)] border border-[oklch(0.22_0.018_240)] border-l-2 border-l-[oklch(0.82_0.18_75)]">
                    <p className="text-[0.80rem] text-[oklch(0.72_0.008_240)] leading-relaxed">
                      {paper.limitations}
                    </p>
                  </div>
                </Section>
              )}

              {/* Abstract */}
              {paper.abstract && (
                <Section title="Abstract">
                  <p className="text-[0.80rem] text-[oklch(0.65_0.008_240)] leading-relaxed">
                    {paper.abstract}
                  </p>
                </Section>
              )}

              {/* Content Angles */}
              {paper.contentAngles && paper.contentAngles.length > 0 && (
                <Section title="Brand Content Opportunities" icon={Tag}>
                  <div className="space-y-3">
                    {paper.contentAngles.map((angle) => (
                      <div key={angle.id} className="nasa-card p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="nasa-tag nasa-tag-red">{FORMAT_TYPE_LABELS[angle.formatType] || angle.formatType}</span>
                          {angle.targetAudience && (
                            <span className="text-[0.65rem] text-[oklch(0.48_0.010_240)] font-['IBM_Plex_Mono']">
                              → {angle.targetAudience}
                            </span>
                          )}
                        </div>
                        {angle.titleIdea && (
                          <h4 className="text-[0.82rem] font-semibold text-white mb-2">{angle.titleIdea}</h4>
                        )}
                        {angle.consumerSummary && (
                          <div className="mb-2">
                            <div className="nasa-label mb-1">Consumer Version</div>
                            <p className="text-[0.75rem] text-[oklch(0.70_0.008_240)] leading-relaxed">{angle.consumerSummary}</p>
                          </div>
                        )}
                        {angle.riskNote && (
                          <div className="mt-2 p-2.5 bg-[oklch(0.82_0.18_75/0.08)] border border-[oklch(0.82_0.18_75/0.25)] rounded-sm">
                            <div className="nasa-label text-[oklch(0.82_0.18_75)] mb-0.5">Claim Risk Note</div>
                            <p className="text-[0.72rem] text-[oklch(0.72_0.012_75)] leading-relaxed">{angle.riskNote}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Harvard Reference */}
              {paper.harvardReference && (
                <Section title="Harvard Reference" icon={BookOpen}>
                  <div className="relative p-4 bg-[oklch(0.14_0.020_240)] border border-[oklch(0.22_0.018_240)]">
                    <p className="text-[0.78rem] text-[oklch(0.72_0.008_240)] leading-relaxed font-['IBM_Plex_Mono'] pr-10">
                      {paper.harvardReference}
                    </p>
                    <button
                      onClick={copyHarvardRef}
                      className="absolute top-3 right-3 p-1.5 text-[oklch(0.50_0.010_240)] hover:text-[oklch(0.55_0.22_25)] transition-colors"
                      title="Copy reference"
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
              <div className="bg-[oklch(0.14_0.020_240)] border border-[oklch(0.22_0.018_240)] p-4">
                <div className="nasa-label mb-2">Evidence Strength</div>
                <div className={cn("nasa-tag text-sm py-1.5 px-3 w-full justify-center", evidenceClass)}>
                  {paper.evidenceLevel.toUpperCase()}
                </div>
                <p className="text-[0.68rem] text-[oklch(0.48_0.010_240)] mt-2 leading-relaxed">
                  {paper.evidenceLevel === "high" && "Well-designed RCT or meta-analysis with consistent results."}
                  {paper.evidenceLevel === "medium" && "Observational or cohort study with moderate quality evidence."}
                  {paper.evidenceLevel === "low" && "In vitro, case study, or expert opinion. Interpret with caution."}
                </p>
              </div>

              {/* Topics */}
              {paper.topics && paper.topics.length > 0 && (
                <div className="bg-[oklch(0.14_0.020_240)] border border-[oklch(0.22_0.018_240)] p-4">
                  <div className="nasa-label mb-2">Health Topics</div>
                  <div className="flex flex-wrap gap-1.5">
                    {paper.topics.map((topic) => (
                      <Link key={topic.id} href={`/health-topics/${topic.slug}`}>
                        <span className="nasa-tag nasa-tag-blue cursor-pointer hover:border-[oklch(0.55_0.22_25/0.6)] transition-colors">
                          {topic.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Breeds */}
              {paper.breeds && paper.breeds.length > 0 && (
                <div className="bg-[oklch(0.14_0.020_240)] border border-[oklch(0.22_0.018_240)] p-4">
                  <div className="nasa-label mb-2">Breed Relevance</div>
                  <div className="space-y-1.5">
                    {paper.breeds.map((breed) => (
                      <Link key={breed.id} href={`/breeds/${breed.slug}`}>
                        <div className="flex items-center justify-between py-1 hover:text-[oklch(0.55_0.22_25)] transition-colors cursor-pointer">
                          <span className="text-[0.75rem] text-[oklch(0.75_0.008_240)]">{breed.breedName}</span>
                          <div className="flex items-center gap-1">
                            <div className="w-12 h-1 bg-[oklch(0.22_0.018_240)] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[oklch(0.55_0.22_25)] rounded-full"
                                style={{ width: `${(breed.relevanceScore ?? 1) * 100}%` }}
                              />
                            </div>
                            <span className="text-[0.60rem] font-['IBM_Plex_Mono'] text-[oklch(0.45_0.010_240)]">
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
                <div className="bg-[oklch(0.14_0.020_240)] border border-[oklch(0.22_0.018_240)] p-4">
                  <div className="nasa-label mb-2">Keywords</div>
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
                  className="flex items-center gap-2 p-3 bg-[oklch(0.14_0.020_240)] border border-[oklch(0.22_0.018_240)] hover:border-[oklch(0.55_0.22_25/0.5)] transition-colors group"
                >
                  <Link2 className="w-4 h-4 text-[oklch(0.55_0.22_25)]" />
                  <span className="text-[0.72rem] font-['IBM_Plex_Mono'] text-[oklch(0.65_0.010_240)] group-hover:text-[oklch(0.55_0.22_25)] transition-colors">
                    View Original Paper
                  </span>
                  <ExternalLink className="w-3 h-3 text-[oklch(0.45_0.010_240)] ml-auto" />
                </a>
              )}
            </div>
          </div>

          {/* Related Papers */}
          {related && related.length > 0 && (
            <div className="mt-10 pt-8 border-t border-[oklch(0.20_0.015_240)]">
              <div className="nasa-section-header mb-5">
                <h2 className="text-lg font-bold text-white font-['IBM_Plex_Sans']">Related Papers</h2>
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
