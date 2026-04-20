/**
 * InfographicRenderer
 * Parses structured JSON infographic data and renders it as visual charts/diagrams.
 * Supports: ingredient_benefit_map (node graph), comparison_chart (bar chart),
 * timeline (step list), nutrient_comparison (horizontal bars), evidence_summary (cards).
 */

import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

// ─── Type definitions for known infographic schemas ───────────────────────────

interface NodeEdge {
  from: string;
  label?: string;
  to: string;
}
interface NodeItem {
  id: string;
  type?: string;
  label?: string;
}
interface IngredientBenefitMap {
  nodes: NodeItem[];
  edges: NodeEdge[];
}

interface ComparisonItem {
  label: string;
  value: number;
  unit?: string;
  color?: string;
}
interface ComparisonChart {
  title?: string;
  items: ComparisonItem[];
  max?: number;
}

interface TimelineStep {
  step?: number;
  phase?: string;
  title: string;
  description?: string;
}
interface Timeline {
  title?: string;
  steps: TimelineStep[];
}

interface NutrientRow {
  nutrient: string;
  amount?: number | string;
  unit?: string;
  benefit?: string;
  level?: "low" | "medium" | "high";
}
interface NutrientComparison {
  title?: string;
  rows: NutrientRow[];
}

interface EvidenceCard {
  claim: string;
  evidence?: string;
  strength?: string;
  source?: string;
}
interface EvidenceSummary {
  title?: string;
  cards: EvidenceCard[];
}

type InfographicData =
  | IngredientBenefitMap
  | ComparisonChart
  | Timeline
  | NutrientComparison
  | EvidenceSummary
  | Record<string, unknown>;

// ─── Helper: detect schema type ───────────────────────────────────────────────

function detectType(data: InfographicData): string {
  if ("nodes" in data && "edges" in data) return "ingredient_benefit_map";
  if ("items" in data && Array.isArray((data as ComparisonChart).items) &&
      (data as ComparisonChart).items[0] && "value" in (data as ComparisonChart).items[0]) return "comparison_chart";
  if ("steps" in data && Array.isArray((data as Timeline).steps)) return "timeline";
  if ("rows" in data && Array.isArray((data as NutrientComparison).rows)) return "nutrient_comparison";
  if ("cards" in data && Array.isArray((data as EvidenceSummary).cards)) return "evidence_summary";
  return "unknown";
}

// ─── Sub-renderers ────────────────────────────────────────────────────────────

function IngredientBenefitMapRenderer({ data }: { data: IngredientBenefitMap }) {
  const ingredients = data.nodes.filter(n => n.type === "ingredient");
  const benefits = data.nodes.filter(n => n.type !== "ingredient");

  return (
    <div className="space-y-4">
      <div className="text-[0.65rem] font-['IBM_Plex_Mono'] tracking-wider text-[oklch(0.45_0.010_285)] uppercase mb-3">
        Ingredient → Benefit Relationship Map
      </div>
      <div className="flex gap-6">
        {/* Ingredients column */}
        <div className="flex-1 space-y-2">
          <div className="text-[0.60rem] font-['IBM_Plex_Mono'] tracking-widest uppercase text-[oklch(0.72_0.18_290)] mb-2">
            Ingredients
          </div>
          {ingredients.map((node) => (
            <div
              key={node.id}
              className="px-3 py-2 bg-[oklch(0.46_0.28_290/0.10)] border border-[oklch(0.46_0.28_290/0.30)] rounded-sm text-[0.72rem] text-[oklch(0.82_0.14_290)] font-['IBM_Plex_Sans'] capitalize"
            >
              {node.label || node.id.replace(/_/g, " ")}
            </div>
          ))}
        </div>

        {/* Edges / connections */}
        <div className="flex flex-col justify-center gap-1 px-2">
          {data.edges.map((edge, i) => (
            <div key={i} className="flex items-center gap-1 text-[0.60rem] font-['IBM_Plex_Mono'] text-[oklch(0.45_0.010_285)]">
              <span className="text-[oklch(0.72_0.18_290)] capitalize">{edge.from.replace(/_/g, " ")}</span>
              <span className="text-[oklch(0.35_0.010_285)]">→</span>
              <span className="text-[oklch(0.65_0.14_145)] capitalize">{edge.to.replace(/_/g, " ")}</span>
              {edge.label && <span className="text-[oklch(0.40_0.010_285)] italic">({edge.label})</span>}
            </div>
          ))}
        </div>

        {/* Benefits column */}
        {benefits.length > 0 && (
          <div className="flex-1 space-y-2">
            <div className="text-[0.60rem] font-['IBM_Plex_Mono'] tracking-widest uppercase text-[oklch(0.65_0.14_145)] mb-2">
              Benefits / Risks
            </div>
            {benefits.map((node) => (
              <div
                key={node.id}
                className="px-3 py-2 bg-[oklch(0.65_0.14_145/0.08)] border border-[oklch(0.65_0.14_145/0.25)] rounded-sm text-[0.72rem] text-[oklch(0.75_0.12_145)] font-['IBM_Plex_Sans'] capitalize"
              >
                {node.label || node.id.replace(/_/g, " ")}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ComparisonChartRenderer({ data }: { data: ComparisonChart }) {
  const maxVal = data.max ?? Math.max(...data.items.map(i => i.value), 1);

  return (
    <div className="space-y-3">
      {data.title && (
        <div className="text-[0.72rem] font-semibold text-white font-['IBM_Plex_Sans'] mb-3">{data.title}</div>
      )}
      {data.items.map((item, i) => {
        const pct = Math.min(100, (item.value / maxVal) * 100);
        return (
          <div key={i} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[0.72rem] text-[oklch(0.78_0.008_285)] font-['IBM_Plex_Sans'] capitalize">
                {item.label}
              </span>
              <span className="text-[0.68rem] font-['IBM_Plex_Mono'] text-[oklch(0.72_0.18_290)]">
                {item.value}{item.unit ? ` ${item.unit}` : ""}
              </span>
            </div>
            <div className="h-2 bg-[oklch(0.18_0.025_285)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, oklch(0.46 0.28 290), oklch(0.72 0.18 290))`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TimelineRenderer({ data }: { data: Timeline }) {
  return (
    <div className="space-y-3">
      {data.title && (
        <div className="text-[0.72rem] font-semibold text-white font-['IBM_Plex_Sans'] mb-3">{data.title}</div>
      )}
      <div className="relative pl-6 space-y-4">
        {/* Vertical line */}
        <div className="absolute left-2 top-2 bottom-2 w-px bg-[oklch(0.46_0.28_290/0.30)]" />
        {data.steps.map((step, i) => (
          <div key={i} className="relative">
            {/* Dot */}
            <div className="absolute -left-4 top-1.5 w-2 h-2 rounded-full bg-[oklch(0.46_0.28_290)] border border-[oklch(0.72_0.18_290/0.5)]" />
            <div className="text-[0.68rem] font-['IBM_Plex_Mono'] text-[oklch(0.72_0.18_290)] mb-0.5 tracking-wider uppercase">
              {step.phase || `Step ${step.step ?? i + 1}`}
            </div>
            <div className="text-[0.78rem] font-semibold text-white font-['IBM_Plex_Sans']">{step.title}</div>
            {step.description && (
              <p className="text-[0.70rem] text-[oklch(0.60_0.008_285)] mt-0.5 leading-relaxed">{step.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function NutrientComparisonRenderer({ data }: { data: NutrientComparison }) {
  const levelColor = (level?: string) => {
    if (level === "high") return "oklch(0.65 0.14 145)";
    if (level === "medium") return "oklch(0.82 0.18 75)";
    if (level === "low") return "oklch(0.60 0.18 25)";
    return "oklch(0.72 0.18 290)";
  };

  return (
    <div className="space-y-2">
      {data.title && (
        <div className="text-[0.72rem] font-semibold text-white font-['IBM_Plex_Sans'] mb-3">{data.title}</div>
      )}
      <div className="divide-y divide-[oklch(0.18_0.025_285)]">
        {data.rows.map((row, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5">
            <div className="flex-1 text-[0.75rem] text-[oklch(0.78_0.008_285)] font-['IBM_Plex_Sans'] capitalize">
              {row.nutrient}
            </div>
            {(row.amount !== undefined) && (
              <div className="text-[0.70rem] font-['IBM_Plex_Mono'] text-[oklch(0.65_0.010_285)]">
                {row.amount}{row.unit ? ` ${row.unit}` : ""}
              </div>
            )}
            {row.level && (
              <div
                className="text-[0.60rem] font-['IBM_Plex_Mono'] tracking-wider uppercase px-2 py-0.5 rounded-sm border"
                style={{
                  color: levelColor(row.level),
                  borderColor: `${levelColor(row.level)}40`,
                  background: `${levelColor(row.level)}10`,
                }}
              >
                {row.level}
              </div>
            )}
            {row.benefit && (
              <div className="flex-1 text-[0.68rem] text-[oklch(0.55_0.008_285)] italic">{row.benefit}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function EvidenceSummaryRenderer({ data }: { data: EvidenceSummary }) {
  const strengthColor = (s?: string) => {
    if (!s) return "oklch(0.72 0.18 290)";
    const lower = s.toLowerCase();
    if (lower.includes("high") || lower.includes("strong")) return "oklch(0.65 0.14 145)";
    if (lower.includes("moderate") || lower.includes("medium")) return "oklch(0.82 0.18 75)";
    return "oklch(0.60 0.18 25)";
  };

  return (
    <div className="space-y-3">
      {data.title && (
        <div className="text-[0.72rem] font-semibold text-white font-['IBM_Plex_Sans'] mb-3">{data.title}</div>
      )}
      {data.cards.map((card, i) => (
        <div key={i} className="p-3 bg-[oklch(0.14_0.022_285)] border border-[oklch(0.22_0.030_285)] rounded-sm">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <p className="text-[0.75rem] font-semibold text-white font-['IBM_Plex_Sans'] leading-snug flex-1">
              {card.claim}
            </p>
            {card.strength && (
              <span
                className="text-[0.58rem] font-['IBM_Plex_Mono'] tracking-wider uppercase px-1.5 py-0.5 rounded-sm border flex-shrink-0"
                style={{
                  color: strengthColor(card.strength),
                  borderColor: `${strengthColor(card.strength)}40`,
                  background: `${strengthColor(card.strength)}10`,
                }}
              >
                {card.strength}
              </span>
            )}
          </div>
          {card.evidence && (
            <p className="text-[0.68rem] text-[oklch(0.58_0.008_285)] leading-relaxed">{card.evidence}</p>
          )}
          {card.source && (
            <div className="mt-1.5 text-[0.60rem] font-['IBM_Plex_Mono'] text-[oklch(0.45_0.010_285)]">
              Source: {card.source}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Generic fallback: render as a readable key-value list ────────────────────

function GenericRenderer({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data);
  return (
    <div className="space-y-2">
      {entries.map(([key, val]) => (
        <div key={key} className="flex gap-3 text-[0.72rem]">
          <span className="font-['IBM_Plex_Mono'] text-[oklch(0.72_0.18_290)] capitalize flex-shrink-0 min-w-[120px]">
            {key.replace(/_/g, " ")}
          </span>
          <span className="text-[oklch(0.68_0.008_285)] font-['IBM_Plex_Sans']">
            {typeof val === "object" ? JSON.stringify(val) : String(val)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  data: unknown;
  infographicType?: string;
  className?: string;
}

export default function InfographicRenderer({ data, infographicType, className }: Props) {
  // Parse if string
  let parsed: InfographicData;
  try {
    parsed = typeof data === "string" ? JSON.parse(data) : (data as InfographicData);
  } catch {
    return (
      <div className={cn("flex items-center gap-2 text-[0.72rem] text-[oklch(0.55_0.010_285)]", className)}>
        <AlertTriangle className="w-4 h-4 text-[oklch(0.82_0.18_75)]" />
        Unable to parse infographic data.
      </div>
    );
  }

  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  // Detect type from infographicType hint or data shape
  const hint = infographicType?.toLowerCase() ?? "";
  const detected = hint || detectType(parsed);

  return (
    <div className={cn("p-4 bg-[oklch(0.12_0.020_285)] border border-[oklch(0.22_0.030_285)] rounded-sm", className)}>
      {detected === "ingredient_benefit_map" && (
        <IngredientBenefitMapRenderer data={parsed as IngredientBenefitMap} />
      )}
      {detected === "comparison_chart" && (
        <ComparisonChartRenderer data={parsed as ComparisonChart} />
      )}
      {detected === "timeline" && (
        <TimelineRenderer data={parsed as Timeline} />
      )}
      {(detected === "nutrient_comparison" || detected === "nutrient_chart") && (
        <NutrientComparisonRenderer data={parsed as NutrientComparison} />
      )}
      {(detected === "evidence_summary" || detected === "evidence_chart") && (
        <EvidenceSummaryRenderer data={parsed as EvidenceSummary} />
      )}
      {detected === "unknown" && (
        <GenericRenderer data={parsed as Record<string, unknown>} />
      )}
    </div>
  );
}
