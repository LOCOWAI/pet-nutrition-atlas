import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Download,
  FlaskConical,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

type AnalysisResult = {
  overallScore: number;
  summary: string;
  summaryZh?: string;
  ingredientAnalysis: Array<{
    ingredient: string;
    role: string;
    evidenceLevel: string;
    supportedBy: number;
    notes: string;
    caution?: string;
  }>;
  gaps: string[];
  suggestions: string[];
  relatedPapers: Array<{
    id: number;
    title: string;
    relevance: string;
  }>;
};

const SCORE_COLOR = (score: number) => {
  if (score >= 80) return "text-[oklch(0.65_0.18_145)]";
  if (score >= 60) return "text-[oklch(0.82_0.18_75)]";
  return "text-[oklch(0.65_0.18_35)]";
};

const EVIDENCE_BADGE: Record<string, string> = {
  high: "text-[oklch(0.65_0.18_145)] border-[oklch(0.65_0.18_145/0.4)] bg-[oklch(0.65_0.18_145/0.08)]",
  medium: "text-[oklch(0.82_0.18_75)] border-[oklch(0.82_0.18_75/0.4)] bg-[oklch(0.82_0.18_75/0.08)]",
  low: "text-[oklch(0.65_0.010_285)] border-[oklch(0.65_0.010_285/0.4)] bg-[oklch(0.65_0.010_285/0.08)]",
  limited: "text-[oklch(0.50_0.010_285)] border-[oklch(0.40_0.010_285/0.4)] bg-[oklch(0.40_0.010_285/0.08)]",
};

export default function FormulationAssistant() {
  const { t } = useLanguage();
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [species, setSpecies] = useState<"cat" | "dog">("dog");
  const [lifeStage, setLifeStage] = useState("adult");
  const [healthGoal, setHealthGoal] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyzeMutation = trpc.formulation.analyze.useMutation({
    onSuccess: (data) => {
      setResult(data as AnalysisResult);
    },
  });

  const addIngredient = () => setIngredients([...ingredients, ""]);
  const removeIngredient = (i: number) => {
    if (ingredients.length === 1) return;
    setIngredients(ingredients.filter((_, idx) => idx !== i));
  };
  const updateIngredient = (i: number, val: string) => {
    const updated = [...ingredients];
    updated[i] = val;
    setIngredients(updated);
  };

  const handleAnalyze = () => {
    const clean = ingredients.map((s) => s.trim()).filter(Boolean);
    if (clean.length === 0) return;
    analyzeMutation.mutate({
      ingredients: clean,
      species,
      lifeStage,
      healthGoal: healthGoal || undefined,
    });
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    const lines = [
      `Pet Nutrition Formulation Analysis`,
      `Species: ${species} | Life Stage: ${lifeStage}`,
      healthGoal ? `Health Goal: ${healthGoal}` : "",
      `Ingredients: ${ingredients.filter(Boolean).join(", ")}`,
      "",
      `Overall Score: ${result.overallScore}/100`,
      "",
      `Summary:`,
      result.summary,
      "",
      ...(result.summaryZh ? [`中文摘要:`, result.summaryZh, ""] : []),
      `Ingredient Analysis:`,
      ...result.ingredientAnalysis.map(
        (a) => `- ${a.ingredient}: ${a.role} [${a.evidenceLevel}] — ${a.notes}${a.caution ? ` ⚠️ ${a.caution}` : ""}`
      ),
      "",
      `Gaps:`,
      ...result.gaps.map((g) => `- ${g}`),
      "",
      `Suggestions:`,
      ...result.suggestions.map((s) => `- ${s}`),
      "",
      `Related Papers:`,
      ...result.relatedPapers.map((p) => `- [${p.id}] ${p.title} — ${p.relevance}`),
    ].filter((l) => l !== undefined);

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `formulation-analysis-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-[oklch(0.20_0.030_285)] bg-[oklch(0.11_0.022_285)]">
        <div className="container py-8">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-5 h-5 text-[oklch(0.82_0.18_75)]" />
            <span className="text-[0.68rem] font-['IBM_Plex_Mono'] tracking-[0.15em] uppercase text-[oklch(0.82_0.18_75)]">
              {t("form_module_label")}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-['IBM_Plex_Sans'] mb-2">
            {t("form_title")}
          </h1>
          <p className="text-[0.82rem] text-[oklch(0.55_0.010_285)] max-w-2xl">
            {t("form_subtitle")}
          </p>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Input panel */}
          <div className="lg:col-span-2">
            <div className="nasa-card p-5 sticky top-6">
              <h2 className="text-[0.85rem] font-semibold text-white font-['IBM_Plex_Sans'] mb-4 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-[oklch(0.82_0.18_75)]" />
                {t("form_input_title")}
              </h2>

              {/* Species */}
              <div className="mb-4">
                <label className="nasa-label mb-2 block">{t("form_species")}</label>
                <div className="flex gap-2">
                  {(["dog", "cat"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpecies(s)}
                      className={cn(
                        "flex-1 py-2 text-[0.72rem] font-['IBM_Plex_Mono'] tracking-wider uppercase border transition-colors",
                        species === s
                          ? "border-[oklch(0.46_0.28_290)] bg-[oklch(0.46_0.28_290/0.15)] text-[oklch(0.82_0.14_290)]"
                          : "border-[oklch(0.22_0.030_285)] text-[oklch(0.50_0.010_285)] hover:border-[oklch(0.35_0.020_285)]"
                      )}
                    >
                      {s === "cat" ? t("common_feline") : t("common_canine")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Life stage */}
              <div className="mb-4">
                <label className="nasa-label mb-2 block">{t("form_life_stage")}</label>
                <select
                  value={lifeStage}
                  onChange={(e) => setLifeStage(e.target.value)}
                  className="w-full py-2.5 px-3 bg-[oklch(0.14_0.022_285)] border border-[oklch(0.22_0.030_285)] text-[0.80rem] text-white focus:outline-none focus:border-[oklch(0.46_0.28_290/0.6)] transition-colors"
                >
                  {["puppy_kitten", "adult", "senior", "all_life_stages"].map((stage) => (
                    <option key={stage} value={stage} className="bg-[oklch(0.14_0.022_285)]">
                      {stage.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Health goal */}
              <div className="mb-4">
                <label className="nasa-label mb-2 block">{t("form_health_goal")}</label>
                <input
                  type="text"
                  placeholder={t("form_health_goal_placeholder")}
                  value={healthGoal}
                  onChange={(e) => setHealthGoal(e.target.value)}
                  className="w-full py-2.5 px-3 bg-[oklch(0.14_0.022_285)] border border-[oklch(0.22_0.030_285)] text-[0.80rem] text-white placeholder-[oklch(0.40_0.010_285)] focus:outline-none focus:border-[oklch(0.46_0.28_290/0.6)] transition-colors"
                />
              </div>

              {/* Ingredients */}
              <div className="mb-5">
                <label className="nasa-label mb-2 block">{t("form_ingredients")}</label>
                <div className="space-y-2">
                  {ingredients.map((ing, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        placeholder={`${t("form_ingredient_placeholder")} ${i + 1}`}
                        value={ing}
                        onChange={(e) => updateIngredient(i, e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addIngredient()}
                        className="flex-1 py-2 px-3 bg-[oklch(0.14_0.022_285)] border border-[oklch(0.22_0.030_285)] text-[0.80rem] text-white placeholder-[oklch(0.38_0.010_285)] focus:outline-none focus:border-[oklch(0.46_0.28_290/0.6)] transition-colors"
                      />
                      <button
                        onClick={() => removeIngredient(i)}
                        disabled={ingredients.length === 1}
                        className="p-2 text-[oklch(0.40_0.010_285)] hover:text-[oklch(0.65_0.18_35)] transition-colors disabled:opacity-30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addIngredient}
                    className="flex items-center gap-1.5 text-[0.68rem] font-['IBM_Plex_Mono'] tracking-wider uppercase text-[oklch(0.50_0.010_285)] hover:text-[oklch(0.72_0.18_290)] transition-colors mt-1"
                  >
                    <Plus className="w-3 h-3" />
                    {t("form_add_ingredient")}
                  </button>
                </div>
              </div>

              {/* Analyze button */}
              <button
                onClick={handleAnalyze}
                disabled={analyzeMutation.isPending || ingredients.filter(Boolean).length === 0}
                className={cn(
                  "w-full py-3 text-[0.75rem] font-['IBM_Plex_Mono'] tracking-wider uppercase border transition-all flex items-center justify-center gap-2",
                  analyzeMutation.isPending || ingredients.filter(Boolean).length === 0
                    ? "border-[oklch(0.22_0.030_285)] text-[oklch(0.40_0.010_285)] cursor-not-allowed"
                    : "border-[oklch(0.46_0.28_290)] bg-[oklch(0.46_0.28_290/0.15)] text-[oklch(0.82_0.14_290)] hover:bg-[oklch(0.46_0.28_290/0.25)]"
                )}
              >
                {analyzeMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {t("form_analyzing")}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    {t("form_analyze_btn")}
                  </>
                )}
              </button>

              {analyzeMutation.isError && (
                <p className="mt-3 text-[0.72rem] text-[oklch(0.65_0.18_35)] font-['IBM_Plex_Mono']">
                  {t("form_error")}
                </p>
              )}
            </div>
          </div>

          {/* Results panel */}
          <div className="lg:col-span-3">
            {!result && !analyzeMutation.isPending && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <FlaskConical className="w-12 h-12 text-[oklch(0.28_0.020_285)] mb-4" />
                <p className="text-[0.82rem] text-[oklch(0.45_0.010_285)]">{t("form_empty_state")}</p>
                <p className="text-[0.72rem] text-[oklch(0.38_0.010_285)] mt-2 max-w-xs">{t("form_empty_hint")}</p>
              </div>
            )}

            {analyzeMutation.isPending && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Loader2 className="w-10 h-10 text-[oklch(0.72_0.18_290)] animate-spin mb-4" />
                <p className="text-[0.82rem] text-[oklch(0.60_0.010_285)]">{t("form_analyzing_hint")}</p>
              </div>
            )}

            {result && !analyzeMutation.isPending && (
              <div className="space-y-5">
                {/* Score header */}
                <div className="nasa-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="nasa-label mb-1">{t("form_overall_score")}</div>
                      <div className={cn("text-4xl font-bold font-['IBM_Plex_Mono']", SCORE_COLOR(result.overallScore))}>
                        {result.overallScore}<span className="text-xl text-[oklch(0.45_0.010_285)]">/100</span>
                      </div>
                    </div>
                    <button
                      onClick={handleDownloadPDF}
                      className="flex items-center gap-2 px-4 py-2 text-[0.68rem] font-['IBM_Plex_Mono'] tracking-wider uppercase border border-[oklch(0.28_0.035_285)] text-[oklch(0.55_0.010_285)] hover:border-[oklch(0.46_0.28_290)] hover:text-[oklch(0.72_0.18_290)] transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {t("form_download")}
                    </button>
                  </div>
                  <p className="text-[0.82rem] text-[oklch(0.78_0.008_285)] leading-relaxed mb-3">{result.summary}</p>
                  {result.summaryZh && (
                    <p className="text-[0.80rem] text-[oklch(0.68_0.008_285)] leading-relaxed border-l-2 border-[oklch(0.82_0.18_75/0.4)] pl-3">
                      {result.summaryZh}
                    </p>
                  )}
                </div>

                {/* Ingredient analysis */}
                {result.ingredientAnalysis.length > 0 && (
                  <div>
                    <div className="nasa-section-header mb-3">
                      <h2 className="text-[0.85rem] font-semibold text-white font-['IBM_Plex_Sans'] tracking-wide flex items-center gap-2">
                        <FlaskConical className="w-3.5 h-3.5 text-[oklch(0.82_0.18_75)]" />
                        {t("form_ingredient_analysis")}
                      </h2>
                    </div>
                    <div className="space-y-2">
                      {result.ingredientAnalysis.map((a, i) => (
                        <div key={i} className="p-4 bg-[oklch(0.14_0.022_285)] border border-[oklch(0.20_0.030_285)]">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <span className="text-[0.85rem] font-semibold text-white">{a.ingredient}</span>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className={cn("nasa-tag text-[0.60rem] border", EVIDENCE_BADGE[a.evidenceLevel] || EVIDENCE_BADGE.limited)}>
                                {a.evidenceLevel}
                              </span>
                              {a.supportedBy > 0 && (
                                <span className="text-[0.62rem] font-['IBM_Plex_Mono'] text-[oklch(0.45_0.010_285)]">
                                  {a.supportedBy} {t("ing_papers")}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-[0.75rem] text-[oklch(0.62_0.010_285)] mb-1">{t("form_role")}: <span className="text-[oklch(0.72_0.008_285)]">{a.role}</span></p>
                          <p className="text-[0.75rem] text-[oklch(0.68_0.008_285)] leading-relaxed">{a.notes}</p>
                          {a.caution && (
                            <div className="flex gap-2 mt-2 p-2 bg-[oklch(0.82_0.18_75/0.06)] border border-[oklch(0.82_0.18_75/0.20)]">
                              <AlertTriangle className="w-3.5 h-3.5 text-[oklch(0.82_0.18_75)] flex-shrink-0 mt-0.5" />
                              <p className="text-[0.72rem] text-[oklch(0.72_0.012_75)]">{a.caution}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gaps */}
                {result.gaps.length > 0 && (
                  <div>
                    <div className="nasa-section-header mb-3">
                      <h2 className="text-[0.85rem] font-semibold text-white font-['IBM_Plex_Sans'] tracking-wide flex items-center gap-2">
                        <XCircle className="w-3.5 h-3.5 text-[oklch(0.65_0.18_35)]" />
                        {t("form_gaps")}
                      </h2>
                    </div>
                    <div className="space-y-2">
                      {result.gaps.map((gap, i) => (
                        <div key={i} className="flex gap-3 p-3 bg-[oklch(0.14_0.022_285)] border border-[oklch(0.20_0.030_285)] border-l-2 border-l-[oklch(0.65_0.18_35/0.6)]">
                          <XCircle className="w-3.5 h-3.5 text-[oklch(0.65_0.18_35)] flex-shrink-0 mt-0.5" />
                          <p className="text-[0.78rem] text-[oklch(0.72_0.008_285)] leading-relaxed">{gap}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {result.suggestions.length > 0 && (
                  <div>
                    <div className="nasa-section-header mb-3">
                      <h2 className="text-[0.85rem] font-semibold text-white font-['IBM_Plex_Sans'] tracking-wide flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[oklch(0.65_0.18_145)]" />
                        {t("form_suggestions")}
                      </h2>
                    </div>
                    <div className="space-y-2">
                      {result.suggestions.map((sug, i) => (
                        <div key={i} className="flex gap-3 p-3 bg-[oklch(0.14_0.022_285)] border border-[oklch(0.20_0.030_285)] border-l-2 border-l-[oklch(0.65_0.18_145/0.6)]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[oklch(0.65_0.18_145)] flex-shrink-0 mt-0.5" />
                          <p className="text-[0.78rem] text-[oklch(0.72_0.008_285)] leading-relaxed">{sug}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related papers */}
                {result.relatedPapers.length > 0 && (
                  <div>
                    <div className="nasa-section-header mb-3">
                      <h2 className="text-[0.85rem] font-semibold text-white font-['IBM_Plex_Sans'] tracking-wide flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-[oklch(0.72_0.18_290)]" />
                        {t("form_related_papers")}
                      </h2>
                    </div>
                    <div className="space-y-2">
                      {result.relatedPapers.map((p, i) => (
                        <Link key={i} href={`/paper/${p.id}`}>
                          <div className="flex items-start gap-3 p-3 bg-[oklch(0.14_0.022_285)] border border-[oklch(0.20_0.030_285)] hover:border-[oklch(0.28_0.035_285)] transition-colors cursor-pointer group">
                            <BookOpen className="w-3.5 h-3.5 text-[oklch(0.45_0.010_285)] flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[0.78rem] text-[oklch(0.72_0.18_290)] group-hover:text-[oklch(0.82_0.14_290)] transition-colors leading-snug">{p.title}</p>
                              <p className="text-[0.70rem] text-[oklch(0.50_0.008_285)] mt-1">{p.relevance}</p>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-[oklch(0.35_0.010_285)] group-hover:text-[oklch(0.72_0.18_290)] transition-colors flex-shrink-0 mt-0.5" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
