import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FlaskConical,
  Lightbulb,
  Loader2,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const EVIDENCE_COLORS = {
  high: "text-[oklch(0.72_0.18_160)] border-[oklch(0.55_0.18_160/0.5)] bg-[oklch(0.55_0.18_160/0.1)]",
  moderate: "text-[oklch(0.72_0.18_290)] border-[oklch(0.46_0.28_290/0.5)] bg-[oklch(0.46_0.28_290/0.1)]",
  limited: "text-[oklch(0.72_0.18_75)] border-[oklch(0.55_0.18_75/0.5)] bg-[oklch(0.55_0.18_75/0.1)]",
  emerging: "text-[oklch(0.72_0.18_240)] border-[oklch(0.46_0.18_240/0.5)] bg-[oklch(0.46_0.18_240/0.1)]",
};

const CATEGORY_ICONS: Record<string, string> = {
  Protein: "🥩",
  Lipid: "🫒",
  Micronutrient: "💊",
  Botanical: "🌿",
  Prebiotic: "🦠",
  Probiotic: "🧫",
  Mineral: "⚗️",
  Vitamin: "✨",
  Fiber: "🌾",
  Antioxidant: "🛡️",
};

const PRESET_GOALS = [
  "Improve joint health and mobility in senior dogs",
  "Support digestive health and gut microbiome in cats",
  "Enhance skin and coat quality in dogs",
  "Promote kidney health in senior cats",
  "Support cognitive function in aging pets",
  "Boost immune system in puppies and kittens",
  "Weight management and metabolic health",
  "Heart health and cardiovascular support",
];

type Recommendation = {
  ingredient: string;
  category: string;
  mechanism: string;
  evidenceStrength: "high" | "moderate" | "limited" | "emerging";
  inclusionNote?: string;
  cautions?: string;
  supportingPaperIds: number[];
  supportingPaperTitles: string[];
};

type RecommendResult = {
  healthGoal: string;
  species?: "cat" | "dog";
  lifeStage?: string;
  summary: string;
  recommendations: Recommendation[];
  formulationTips: string[];
  regulatoryNote: string;
  citedPapers: Array<{
    id: number;
    title: string;
    authors: string;
    year: number;
    journal: string | null;
    evidenceLevel: string | null;
    doi: string | null;
  }>;
  totalPapersSearched: number;
};

function IngredientCard({ rec, citedPapers }: { rec: Recommendation; citedPapers: RecommendResult["citedPapers"] }) {
  const [expanded, setExpanded] = useState(false);
  const evidenceClass = EVIDENCE_COLORS[rec.evidenceStrength] || EVIDENCE_COLORS.limited;
  const categoryIcon = CATEGORY_ICONS[rec.category] || "🔬";
  const papers = citedPapers.filter(p => rec.supportingPaperIds.includes(p.id));

  return (
    <div className="nasa-card border border-[oklch(0.22_0.030_285)] hover:border-[oklch(0.46_0.28_290/0.5)] transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span className="text-xl flex-shrink-0">{categoryIcon}</span>
          <div className="min-w-0">
            <h3 className="text-[0.95rem] font-bold text-white font-['IBM_Plex_Sans'] truncate">{rec.ingredient}</h3>
            <span className="text-[0.65rem] font-['IBM_Plex_Mono'] text-[oklch(0.55_0.010_285)] uppercase tracking-wider">{rec.category}</span>
          </div>
        </div>
        <span className={cn("flex-shrink-0 text-[0.65rem] font-['IBM_Plex_Mono'] uppercase tracking-wider px-2 py-0.5 border rounded-sm", evidenceClass)}>
          {rec.evidenceStrength}
        </span>
      </div>

      {/* Mechanism */}
      <p className="text-[0.80rem] text-[oklch(0.75_0.008_285)] font-['IBM_Plex_Sans'] leading-relaxed mb-3">{rec.mechanism}</p>

      {/* Inclusion note */}
      {rec.inclusionNote && (
        <div className="flex items-start gap-2 mb-3 p-2.5 bg-[oklch(0.46_0.28_290/0.06)] border border-[oklch(0.46_0.28_290/0.2)] rounded-sm">
          <FlaskConical className="w-3.5 h-3.5 text-[oklch(0.72_0.18_290)] flex-shrink-0 mt-0.5" />
          <span className="text-[0.75rem] text-[oklch(0.72_0.18_290)] font-['IBM_Plex_Sans']">{rec.inclusionNote}</span>
        </div>
      )}

      {/* Cautions */}
      {rec.cautions && (
        <div className="flex items-start gap-2 mb-3 p-2.5 bg-[oklch(0.55_0.18_75/0.06)] border border-[oklch(0.55_0.18_75/0.2)] rounded-sm">
          <AlertTriangle className="w-3.5 h-3.5 text-[oklch(0.82_0.18_75)] flex-shrink-0 mt-0.5" />
          <span className="text-[0.75rem] text-[oklch(0.82_0.18_75)] font-['IBM_Plex_Sans']">{rec.cautions}</span>
        </div>
      )}

      {/* Supporting papers */}
      {papers.length > 0 && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-[0.70rem] font-['IBM_Plex_Mono'] text-[oklch(0.55_0.010_285)] hover:text-[oklch(0.72_0.18_290)] uppercase tracking-wider transition-colors"
          >
            <BookOpen className="w-3 h-3" />
            {papers.length} supporting paper{papers.length > 1 ? "s" : ""}
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {expanded && (
            <div className="mt-2 space-y-1.5">
              {papers.map(p => (
                <Link key={p.id} href={`/paper/${p.id}`}>
                  <div className="flex items-start gap-2 p-2 bg-[oklch(0.14_0.022_285)] border border-[oklch(0.20_0.025_285)] rounded-sm hover:border-[oklch(0.46_0.28_290/0.4)] transition-colors cursor-pointer group">
                    <ExternalLink className="w-3 h-3 text-[oklch(0.46_0.28_290)] flex-shrink-0 mt-0.5 group-hover:text-[oklch(0.72_0.18_290)]" />
                    <div className="min-w-0">
                      <p className="text-[0.72rem] text-[oklch(0.80_0.008_285)] font-['IBM_Plex_Sans'] line-clamp-2 group-hover:text-white transition-colors">{p.title}</p>
                      <p className="text-[0.62rem] text-[oklch(0.50_0.010_285)] font-['IBM_Plex_Mono'] mt-0.5">{p.authors} · {p.year} · {p.journal}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function FormulationAssistant() {
  const { t, lang, isZh } = useLanguage();

  const [healthGoal, setHealthGoal] = useState("");
  const [species, setSpecies] = useState<"cat" | "dog" | "">("");
  const [lifeStage, setLifeStage] = useState<"junior" | "adult" | "senior" | "all" | "">("");
  const [result, setResult] = useState<RecommendResult | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const recommendMutation = trpc.formulation.recommendByGoal.useMutation({
    onSuccess: (data) => {
      setResult(data as RecommendResult);
      setActiveCategory("all");
    },
  });

  const handleSubmit = () => {
    const goal = healthGoal.trim();
    if (!goal) return;
    recommendMutation.mutate({
      healthGoal: goal,
      species: species || undefined,
      lifeStage: lifeStage as "junior" | "adult" | "senior" | "all" | undefined || undefined,
    });
  };

  const categories = result
    ? ["all", ...Array.from(new Set(result.recommendations.map(r => r.category)))]
    : ["all"];

  const filteredRecs = result
    ? (activeCategory === "all" ? result.recommendations : result.recommendations.filter(r => r.category === activeCategory))
    : [];

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="border-b border-[oklch(0.18_0.025_285)] bg-[oklch(0.10_0.018_285)]">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-px bg-[oklch(0.46_0.28_290)]" />
            <span className="nasa-label">{isZh ? "研发助手" : "R&D ASSISTANT"}</span>
          </div>
          <h1 className="text-3xl font-bold text-white font-['IBM_Plex_Sans'] mb-2">
            {isZh ? "成分推荐引擎" : "Ingredient Recommendation Engine"}
          </h1>
          <p className="text-[oklch(0.65_0.008_285)] font-['IBM_Plex_Sans'] text-[0.88rem] max-w-2xl">
            {isZh
              ? "输入您的健康目标，AI 将检索文献库，为您推荐有科学依据的功能性成分，并附上对应的文献支撑。"
              : "Enter a health goal and the AI will search the research database to recommend evidence-backed functional ingredients with supporting literature."}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Input Panel */}
        <div className="nasa-card border border-[oklch(0.22_0.030_285)] mb-8">
          <div className="flex items-center gap-2 mb-5">
            <Target className="w-4 h-4 text-[oklch(0.72_0.18_290)]" />
            <span className="text-[0.80rem] font-['IBM_Plex_Mono'] text-[oklch(0.72_0.18_290)] uppercase tracking-wider">
              {isZh ? "定义健康目标" : "Define Health Goal"}
            </span>
          </div>

          {/* Health Goal Input */}
          <div className="mb-5">
            <label className="nasa-label block mb-2">
              {isZh ? "健康目标 *" : "Health Goal *"}
            </label>
            <textarea
              value={healthGoal}
              onChange={(e) => setHealthGoal(e.target.value)}
              placeholder={isZh ? "例如：改善老年犬的关节健康与活动能力..." : "e.g. Improve joint health and mobility in senior dogs..."}
              rows={3}
              className="w-full bg-[oklch(0.12_0.020_285)] border border-[oklch(0.22_0.030_285)] text-white text-[0.82rem] px-4 py-3 rounded-sm focus:outline-none focus:border-[oklch(0.46_0.28_290/0.7)] transition-colors font-['IBM_Plex_Sans'] placeholder:text-[oklch(0.40_0.010_285)] resize-none"
            />
            {/* Preset suggestions */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {PRESET_GOALS.slice(0, 4).map((goal) => (
                <button
                  key={goal}
                  onClick={() => setHealthGoal(goal)}
                  className="text-[0.65rem] font-['IBM_Plex_Mono'] text-[oklch(0.55_0.010_285)] border border-[oklch(0.20_0.025_285)] px-2 py-0.5 rounded-sm hover:border-[oklch(0.46_0.28_290/0.5)] hover:text-[oklch(0.72_0.18_290)] transition-colors"
                >
                  {goal.length > 40 ? goal.slice(0, 40) + "…" : goal}
                </button>
              ))}
            </div>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="nasa-label block mb-1.5">{isZh ? "目标物种" : "Target Species"}</label>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value as "cat" | "dog" | "")}
                className="w-full bg-[oklch(0.12_0.020_285)] border border-[oklch(0.22_0.030_285)] text-[oklch(0.85_0.006_285)] text-[0.78rem] px-3 py-2 rounded-sm focus:outline-none focus:border-[oklch(0.46_0.28_290/0.6)] transition-colors font-['IBM_Plex_Sans']"
              >
                <option value="">{isZh ? "猫 & 狗" : "Cat & Dog"}</option>
                <option value="cat">{isZh ? "猫" : "Cat"}</option>
                <option value="dog">{isZh ? "狗" : "Dog"}</option>
              </select>
            </div>
            <div>
              <label className="nasa-label block mb-1.5">{isZh ? "生命阶段" : "Life Stage"}</label>
              <select
                value={lifeStage}
                onChange={(e) => setLifeStage(e.target.value as "junior" | "adult" | "senior" | "all" | "")}
                className="w-full bg-[oklch(0.12_0.020_285)] border border-[oklch(0.22_0.030_285)] text-[oklch(0.85_0.006_285)] text-[0.78rem] px-3 py-2 rounded-sm focus:outline-none focus:border-[oklch(0.46_0.28_290/0.6)] transition-colors font-['IBM_Plex_Sans']"
              >
                <option value="">{isZh ? "所有阶段" : "All Stages"}</option>
                <option value="junior">{isZh ? "幼年期" : "Junior"}</option>
                <option value="adult">{isZh ? "成年期" : "Adult"}</option>
                <option value="senior">{isZh ? "老年期" : "Senior"}</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!healthGoal.trim() || recommendMutation.isPending}
            className="flex items-center gap-2 px-6 py-3 bg-[oklch(0.46_0.28_290)] hover:bg-[oklch(0.52_0.28_290)] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[0.80rem] font-['IBM_Plex_Mono'] uppercase tracking-wider transition-colors rounded-sm"
          >
            {recommendMutation.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> {isZh ? "AI 正在检索文献库..." : "Searching literature database..."}</>
            ) : (
              <><Search className="w-4 h-4" /> {isZh ? "获取成分推荐" : "Get Ingredient Recommendations"}</>
            )}
          </button>

          {recommendMutation.isError && (
            <p className="mt-3 text-[0.75rem] text-[oklch(0.72_0.18_20)] font-['IBM_Plex_Sans']">
              {isZh ? "推荐生成失败，请重试。" : "Failed to generate recommendations. Please try again."}
            </p>
          )}
        </div>

        {/* Results */}
        {result && (
          <div>
            {/* Summary Banner */}
            <div className="nasa-card border border-[oklch(0.46_0.28_290/0.3)] bg-[oklch(0.46_0.28_290/0.05)] mb-6">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[oklch(0.72_0.18_290)] flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="text-[0.70rem] font-['IBM_Plex_Mono'] text-[oklch(0.72_0.18_290)] uppercase tracking-wider">
                      {isZh ? "AI 推荐摘要" : "AI Recommendation Summary"}
                    </span>
                    <span className="text-[0.65rem] font-['IBM_Plex_Mono'] text-[oklch(0.50_0.010_285)]">
                      {isZh ? `检索了 ${result.totalPapersSearched} 篇文献` : `Searched ${result.totalPapersSearched} papers`}
                    </span>
                  </div>
                  <p className="text-[0.83rem] text-[oklch(0.85_0.008_285)] font-['IBM_Plex_Sans'] leading-relaxed">{result.summary}</p>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <span className="text-[0.65rem] font-['IBM_Plex_Mono'] text-[oklch(0.50_0.010_285)]">
                      {isZh ? "健康目标：" : "Goal:"}
                    </span>
                    <span className="text-[0.70rem] font-['IBM_Plex_Sans'] text-white">{result.healthGoal}</span>
                    {result.species && <span className="nasa-tag nasa-tag-blue text-[0.60rem]">{result.species}</span>}
                    {result.lifeStage && <span className="nasa-tag nasa-tag-purple text-[0.60rem]">{result.lifeStage}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Category Filter Tabs */}
            {categories.length > 2 && (
              <div className="flex gap-2 mb-5 flex-wrap">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "text-[0.68rem] font-['IBM_Plex_Mono'] uppercase tracking-wider px-3 py-1 border rounded-sm transition-colors",
                      activeCategory === cat
                        ? "bg-[oklch(0.46_0.28_290)] border-[oklch(0.46_0.28_290)] text-white"
                        : "border-[oklch(0.22_0.030_285)] text-[oklch(0.55_0.010_285)] hover:border-[oklch(0.46_0.28_290/0.5)] hover:text-[oklch(0.72_0.18_290)]"
                    )}
                  >
                    {cat === "all" ? (isZh ? "全部" : "All") : cat}
                    {cat === "all" ? ` (${result.recommendations.length})` : ` (${result.recommendations.filter(r => r.category === cat).length})`}
                  </button>
                ))}
              </div>
            )}

            {/* Ingredient Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {filteredRecs.map((rec, i) => (
                <IngredientCard key={i} rec={rec} citedPapers={result.citedPapers} />
              ))}
            </div>

            {/* Formulation Tips */}
            {result.formulationTips.length > 0 && (
              <div className="nasa-card border border-[oklch(0.22_0.030_285)] mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-4 h-4 text-[oklch(0.82_0.18_75)]" />
                  <span className="text-[0.78rem] font-['IBM_Plex_Mono'] text-[oklch(0.82_0.18_75)] uppercase tracking-wider">
                    {isZh ? "配方实践建议" : "Formulation Tips"}
                  </span>
                </div>
                <ul className="space-y-2">
                  {result.formulationTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <ArrowRight className="w-3.5 h-3.5 text-[oklch(0.46_0.28_290)] flex-shrink-0 mt-0.5" />
                      <span className="text-[0.80rem] text-[oklch(0.78_0.008_285)] font-['IBM_Plex_Sans'] leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Regulatory Note */}
            {result.regulatoryNote && (
              <div className="flex items-start gap-2.5 p-3.5 bg-[oklch(0.55_0.18_75/0.05)] border border-[oklch(0.55_0.18_75/0.2)] rounded-sm mb-6">
                <AlertTriangle className="w-4 h-4 text-[oklch(0.82_0.18_75)] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[0.68rem] font-['IBM_Plex_Mono'] text-[oklch(0.82_0.18_75)] uppercase tracking-wider block mb-1">
                    {isZh ? "合规提示" : "Regulatory Note"}
                  </span>
                  <p className="text-[0.78rem] text-[oklch(0.72_0.008_285)] font-['IBM_Plex_Sans']">{result.regulatoryNote}</p>
                </div>
              </div>
            )}

            {/* All Cited Papers */}
            {result.citedPapers.length > 0 && (
              <div className="nasa-card border border-[oklch(0.22_0.030_285)]">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-4 h-4 text-[oklch(0.55_0.010_285)]" />
                  <span className="text-[0.78rem] font-['IBM_Plex_Mono'] text-[oklch(0.55_0.010_285)] uppercase tracking-wider">
                    {isZh ? `引用文献 (${result.citedPapers.length})` : `Cited Literature (${result.citedPapers.length})`}
                  </span>
                </div>
                <div className="space-y-2">
                  {result.citedPapers.map(p => (
                    <Link key={p.id} href={`/paper/${p.id}`}>
                      <div className="flex items-start gap-3 p-2.5 bg-[oklch(0.12_0.020_285)] border border-[oklch(0.18_0.022_285)] rounded-sm hover:border-[oklch(0.46_0.28_290/0.4)] transition-colors cursor-pointer group">
                        <span className="text-[0.65rem] font-['IBM_Plex_Mono'] text-[oklch(0.46_0.28_290)] flex-shrink-0 mt-0.5">#{p.id}</span>
                        <div className="min-w-0">
                          <p className="text-[0.78rem] text-[oklch(0.82_0.008_285)] font-['IBM_Plex_Sans'] group-hover:text-white transition-colors line-clamp-1">{p.title}</p>
                          <p className="text-[0.65rem] text-[oklch(0.50_0.010_285)] font-['IBM_Plex_Mono'] mt-0.5">{p.authors} · {p.year} · {p.journal}</p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-[oklch(0.40_0.010_285)] flex-shrink-0 mt-0.5 group-hover:text-[oklch(0.72_0.18_290)] transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!result && !recommendMutation.isPending && (
          <div className="text-center py-16">
            <FlaskConical className="w-12 h-12 text-[oklch(0.30_0.030_285)] mx-auto mb-4" />
            <p className="text-[oklch(0.50_0.010_285)] font-['IBM_Plex_Sans'] text-[0.85rem] mb-2">
              {isZh ? "输入健康目标，AI 将为您推荐有文献支撑的功能性成分" : "Enter a health goal above to get evidence-backed ingredient recommendations"}
            </p>
            <p className="text-[oklch(0.38_0.008_285)] font-['IBM_Plex_Mono'] text-[0.70rem] uppercase tracking-wider">
              {isZh ? "推荐结果基于文献库中的同行评审研究" : "Recommendations grounded in peer-reviewed research from the database"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
