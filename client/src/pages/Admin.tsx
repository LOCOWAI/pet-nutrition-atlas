import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  ChevronDown,
  Edit,
  FlaskConical,
  Link2,
  Loader2,
  Lock,
  Plus,
  Quote,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Star,
  StarOff,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

const STATUS_TABS = [
  { value: "pending", label: "Pending Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

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

function PaperAdminRow({
  paper,
  onRefresh,
}: {
  paper: any;
  onRefresh: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    coreSummary: paper.coreSummary || "",
    reviewNotes: paper.reviewNotes || "",
    evidenceLevel: paper.evidenceLevel || "medium",
  });

  const utils = trpc.useUtils();

  const updateStatus = trpc.papers.updateStatus.useMutation({
    onSuccess: () => { toast.success("Status updated"); onRefresh(); },
    onError: () => toast.error("Failed to update status"),
  });

  const updateFields = trpc.papers.updateFields.useMutation({
    onSuccess: () => { toast.success("Paper updated"); setEditMode(false); onRefresh(); },
    onError: () => toast.error("Failed to update paper"),
  });

  const generateSummary = trpc.papers.generateAISummary.useMutation({
    onSuccess: () => { toast.success("AI summary generated"); onRefresh(); },
    onError: () => toast.error("AI generation failed"),
  });

  const generateRef = trpc.papers.generateHarvardRef.useMutation({
    onSuccess: () => { toast.success("Harvard reference generated"); onRefresh(); },
    onError: () => toast.error("Reference generation failed"),
  });

  const generateAngles = trpc.papers.generateContentAngles.useMutation({
    onSuccess: (data) => { toast.success(`${data.angles.length} content angles generated`); onRefresh(); },
    onError: () => toast.error("Content angle generation failed"),
  });

  const toggleFeatured = trpc.papers.updateFields.useMutation({
    onSuccess: () => { toast.success(paper.featured ? "Removed from featured" : "Added to featured"); onRefresh(); },
    onError: () => toast.error("Failed to update"),
  });

  const evidenceClass = paper.evidenceLevel === "high" ? "evidence-high" : paper.evidenceLevel === "medium" ? "evidence-medium" : "evidence-low";

  return (
    <div className="border border-[oklch(0.20_0.015_240)] bg-[oklch(0.13_0.018_240)] rounded-sm overflow-hidden">
      {/* Row header */}
      <div
        className="flex items-start gap-3 p-4 cursor-pointer hover:bg-[oklch(0.15_0.020_240)] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            <span className={cn("nasa-tag text-[0.60rem]", paper.species === "cat" ? "nasa-tag-blue" : "nasa-tag-green")}>
              {paper.species === "cat" ? "Feline" : paper.species === "dog" ? "Canine" : "Both"}
            </span>
            <span className="nasa-tag text-[0.60rem]">{paper.lifeStage}</span>
            <span className="nasa-tag text-[0.60rem]">{STUDY_TYPE_LABELS[paper.studyType] || paper.studyType}</span>
            <span className={cn("nasa-tag text-[0.60rem]", evidenceClass)}>{paper.evidenceLevel.toUpperCase()}</span>
            {paper.featured && <span className="nasa-tag nasa-tag-red text-[0.60rem]">Featured</span>}
            {paper.aiGenerated && <span className="nasa-tag text-[0.60rem]">AI</span>}
          </div>
          <h4 className="text-[0.82rem] font-medium text-[oklch(0.88_0.006_240)] leading-snug line-clamp-2">
            {paper.title}
          </h4>
          <div className="text-[0.65rem] text-[oklch(0.45_0.010_240)] font-['IBM_Plex_Mono'] mt-1">
            {paper.year} · {paper.journal}
          </div>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-[oklch(0.45_0.010_240)] flex-shrink-0 mt-1 transition-transform", expanded && "rotate-180")} />
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-[oklch(0.20_0.015_240)] p-4 space-y-4">
          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {paper.status !== "approved" && (
              <button
                onClick={() => updateStatus.mutate({ id: paper.id, status: "approved" })}
                disabled={updateStatus.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[oklch(0.65_0.18_145/0.15)] border border-[oklch(0.65_0.18_145/0.4)] text-[oklch(0.65_0.18_145)] text-[0.68rem] font-['IBM_Plex_Mono'] tracking-wider uppercase rounded-sm hover:bg-[oklch(0.65_0.18_145/0.25)] transition-all disabled:opacity-50"
              >
                <Check className="w-3 h-3" /> Approve
              </button>
            )}
            {paper.status !== "rejected" && (
              <button
                onClick={() => updateStatus.mutate({ id: paper.id, status: "rejected" })}
                disabled={updateStatus.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[oklch(0.55_0.22_25/0.12)] border border-[oklch(0.55_0.22_25/0.35)] text-[oklch(0.55_0.22_25)] text-[0.68rem] font-['IBM_Plex_Mono'] tracking-wider uppercase rounded-sm hover:bg-[oklch(0.55_0.22_25/0.22)] transition-all disabled:opacity-50"
              >
                <X className="w-3 h-3" /> Reject
              </button>
            )}
            {paper.status !== "pending" && (
              <button
                onClick={() => updateStatus.mutate({ id: paper.id, status: "pending" })}
                disabled={updateStatus.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-[oklch(0.28_0.022_240)] text-[oklch(0.58_0.010_240)] text-[0.68rem] font-['IBM_Plex_Mono'] tracking-wider uppercase rounded-sm hover:border-[oklch(0.40_0.025_240)] transition-all disabled:opacity-50"
              >
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            )}
            <button
              onClick={() => toggleFeatured.mutate({ id: paper.id, featured: !paper.featured })}
              disabled={toggleFeatured.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[oklch(0.28_0.022_240)] text-[oklch(0.58_0.010_240)] text-[0.68rem] font-['IBM_Plex_Mono'] tracking-wider uppercase rounded-sm hover:border-[oklch(0.55_0.22_25/0.5)] hover:text-[oklch(0.55_0.22_25)] transition-all disabled:opacity-50"
            >
              {paper.featured ? <><StarOff className="w-3 h-3" /> Unfeature</> : <><Star className="w-3 h-3" /> Feature</>}
            </button>
          </div>

          {/* AI generation buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => generateSummary.mutate({ id: paper.id })}
              disabled={generateSummary.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[oklch(0.50_0.14_240/0.12)] border border-[oklch(0.50_0.14_240/0.35)] text-[oklch(0.65_0.12_240)] text-[0.68rem] font-['IBM_Plex_Mono'] tracking-wider uppercase rounded-sm hover:bg-[oklch(0.50_0.14_240/0.22)] transition-all disabled:opacity-50"
            >
              {generateSummary.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Brain className="w-3 h-3" />}
              AI Summary
            </button>
            <button
              onClick={() => generateRef.mutate({ id: paper.id })}
              disabled={generateRef.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[oklch(0.50_0.14_240/0.12)] border border-[oklch(0.50_0.14_240/0.35)] text-[oklch(0.65_0.12_240)] text-[0.68rem] font-['IBM_Plex_Mono'] tracking-wider uppercase rounded-sm hover:bg-[oklch(0.50_0.14_240/0.22)] transition-all disabled:opacity-50"
            >
              {generateRef.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Quote className="w-3 h-3" />}
              Harvard Ref
            </button>
            <button
              onClick={() => generateAngles.mutate({ id: paper.id })}
              disabled={generateAngles.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[oklch(0.50_0.14_240/0.12)] border border-[oklch(0.50_0.14_240/0.35)] text-[oklch(0.65_0.12_240)] text-[0.68rem] font-['IBM_Plex_Mono'] tracking-wider uppercase rounded-sm hover:bg-[oklch(0.50_0.14_240/0.22)] transition-all disabled:opacity-50"
            >
              {generateAngles.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Tag className="w-3 h-3" />}
              Content Angles
            </button>
            <Link href={`/paper/${paper.id}`}>
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-[oklch(0.28_0.022_240)] text-[oklch(0.55_0.010_240)] text-[0.68rem] font-['IBM_Plex_Mono'] tracking-wider uppercase rounded-sm hover:border-[oklch(0.40_0.025_240)] transition-all">
                <ArrowRight className="w-3 h-3" /> View
              </button>
            </Link>
          </div>

          {/* Edit fields */}
          <div>
            <button
              onClick={() => setEditMode(!editMode)}
              className="flex items-center gap-1.5 text-[0.68rem] font-['IBM_Plex_Mono'] tracking-wider uppercase text-[oklch(0.50_0.010_240)] hover:text-[oklch(0.55_0.22_25)] transition-colors mb-3"
            >
              <Edit className="w-3 h-3" /> {editMode ? "Cancel Edit" : "Edit Fields"}
            </button>

            {editMode && (
              <div className="space-y-3 p-4 bg-[oklch(0.11_0.016_240)] border border-[oklch(0.22_0.018_240)] rounded-sm">
                <div>
                  <label className="nasa-label block mb-1.5">Core Summary</label>
                  <textarea
                    value={editData.coreSummary}
                    onChange={(e) => setEditData({ ...editData, coreSummary: e.target.value })}
                    rows={4}
                    className="w-full bg-[oklch(0.16_0.022_240)] border border-[oklch(0.24_0.018_240)] text-white text-[0.78rem] p-3 rounded-sm focus:outline-none focus:border-[oklch(0.55_0.22_25)] transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="nasa-label block mb-1.5">Evidence Level</label>
                  <select
                    value={editData.evidenceLevel}
                    onChange={(e) => setEditData({ ...editData, evidenceLevel: e.target.value })}
                    className="bg-[oklch(0.16_0.022_240)] border border-[oklch(0.24_0.018_240)] text-white text-[0.78rem] px-3 py-2 rounded-sm focus:outline-none focus:border-[oklch(0.55_0.22_25)] transition-colors"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="nasa-label block mb-1.5">Review Notes</label>
                  <textarea
                    value={editData.reviewNotes}
                    onChange={(e) => setEditData({ ...editData, reviewNotes: e.target.value })}
                    rows={2}
                    className="w-full bg-[oklch(0.16_0.022_240)] border border-[oklch(0.24_0.018_240)] text-white text-[0.78rem] p-3 rounded-sm focus:outline-none focus:border-[oklch(0.55_0.22_25)] transition-colors resize-none"
                  />
                </div>
                <button
                  onClick={() => updateFields.mutate({ id: paper.id, ...editData as any })}
                  disabled={updateFields.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-[oklch(0.55_0.22_25)] text-white text-[0.70rem] font-['IBM_Plex_Mono'] tracking-wider uppercase rounded-sm hover:bg-[oklch(0.60_0.22_25)] disabled:opacity-50 transition-colors"
                >
                  {updateFields.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                  Save Changes
                </button>
              </div>
            )}
          </div>

          {/* Current summary preview */}
          {paper.coreSummary && (
            <div className="p-3 bg-[oklch(0.11_0.016_240)] border border-[oklch(0.20_0.015_240)] border-l-2 border-l-[oklch(0.55_0.22_25)]">
              <div className="nasa-label mb-1.5">Core Summary</div>
              <p className="text-[0.75rem] text-[oklch(0.68_0.008_240)] leading-relaxed">{paper.coreSummary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const { user, isAuthenticated, loading } = useAuth();
  const [statusFilter, setStatusFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const LIMIT = 15;

  const { data, refetch, isLoading } = trpc.papers.adminList.useQuery({
    status: statusFilter as any,
    search: search || undefined,
    limit: LIMIT,
    offset,
  }, { enabled: isAuthenticated && user?.role === "admin" });

  const { data: stats } = trpc.papers.getStats.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[oklch(0.55_0.22_25)]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-10 h-10 mx-auto mb-4 text-[oklch(0.45_0.010_240)]" />
          <h2 className="text-xl font-bold text-white mb-2 font-['IBM_Plex_Sans']">Authentication Required</h2>
          <p className="text-[oklch(0.52_0.010_240)] text-sm mb-4">Sign in to access the Admin CMS</p>
          <a href={getLoginUrl()} className="px-5 py-2.5 bg-[oklch(0.55_0.22_25)] text-white text-sm font-medium rounded-sm hover:bg-[oklch(0.60_0.22_25)] transition-colors">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-10 h-10 mx-auto mb-4 text-[oklch(0.45_0.010_240)]" />
          <h2 className="text-xl font-bold text-white mb-2 font-['IBM_Plex_Sans']">Access Denied</h2>
          <p className="text-[oklch(0.52_0.010_240)] text-sm">Admin privileges required.</p>
        </div>
      </div>
    );
  }

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 0;
  const currentPage = Math.floor(offset / LIMIT) + 1;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-[oklch(0.20_0.015_240)] bg-[oklch(0.12_0.020_240)]">
        <div className="container py-8">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-[oklch(0.55_0.22_25)]" />
            <div>
              <div className="nasa-label">Administration</div>
              <h1 className="text-2xl font-bold text-white font-['IBM_Plex_Sans']">Admin CMS</h1>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="flex flex-wrap gap-6">
              {[
                { label: "Total Papers", value: stats.total },
                { label: "Pending Review", value: stats.pending, highlight: stats.pending > 0 },
                { label: "Approved", value: stats.approved },
                { label: "Featured", value: stats.featured },
              ].map((stat) => (
                <div key={stat.label} className="flex items-baseline gap-2">
                  <span className={cn("text-xl font-bold font-['IBM_Plex_Sans']", stat.highlight ? "text-[oklch(0.82_0.18_75)]" : "text-white")}>
                    {stat.value}
                  </span>
                  <span className="text-[0.65rem] text-[oklch(0.48_0.010_240)] tracking-wider uppercase font-['IBM_Plex_Mono']">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="container py-8">
        {/* Status tabs + search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex gap-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => { setStatusFilter(tab.value); setOffset(0); }}
                className={cn(
                  "px-3 py-1.5 text-[0.70rem] font-['IBM_Plex_Mono'] tracking-wider uppercase rounded-sm border transition-all",
                  statusFilter === tab.value
                    ? "border-[oklch(0.55_0.22_25)] text-[oklch(0.55_0.22_25)] bg-[oklch(0.55_0.22_25/0.10)]"
                    : "border-[oklch(0.22_0.018_240)] text-[oklch(0.52_0.010_240)] hover:border-[oklch(0.35_0.025_240)]"
                )}
              >
                {tab.label}
                {tab.value === "pending" && stats?.pending ? ` (${stats.pending})` : ""}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[oklch(0.45_0.010_240)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
              placeholder="Search papers..."
              className="w-full pl-8 pr-4 py-1.5 bg-[oklch(0.16_0.022_240)] border border-[oklch(0.24_0.018_240)] text-white text-[0.78rem] rounded-sm focus:outline-none focus:border-[oklch(0.55_0.22_25)] transition-colors placeholder-[oklch(0.40_0.010_240)]"
            />
          </div>
        </div>

        {/* Results */}
        <div className="text-[0.68rem] text-[oklch(0.45_0.010_240)] font-['IBM_Plex_Mono'] mb-4">
          {isLoading ? "Loading..." : `${data?.total ?? 0} papers · Page ${currentPage} of ${Math.max(1, totalPages)}`}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="nasa-card p-4 h-20 animate-pulse" />
            ))}
          </div>
        ) : data?.papers && data.papers.length > 0 ? (
          <>
            <div className="space-y-2">
              {data.papers.map((paper) => (
                <PaperAdminRow key={paper.id} paper={paper} onRefresh={refetch} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setOffset(Math.max(0, offset - LIMIT))}
                  disabled={offset === 0}
                  className="px-4 py-2 text-[0.70rem] font-['IBM_Plex_Mono'] tracking-wider uppercase border border-[oklch(0.24_0.018_240)] text-[oklch(0.58_0.010_240)] hover:border-[oklch(0.55_0.22_25)] hover:text-[oklch(0.55_0.22_25)] disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-sm"
                >
                  Previous
                </button>
                <span className="text-[0.68rem] font-['IBM_Plex_Mono'] text-[oklch(0.48_0.010_240)] px-2">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setOffset(offset + LIMIT)}
                  disabled={offset + LIMIT >= (data?.total ?? 0)}
                  className="px-4 py-2 text-[0.70rem] font-['IBM_Plex_Mono'] tracking-wider uppercase border border-[oklch(0.24_0.018_240)] text-[oklch(0.58_0.010_240)] hover:border-[oklch(0.55_0.22_25)] hover:text-[oklch(0.55_0.22_25)] disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-sm"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 border border-[oklch(0.20_0.015_240)] rounded-sm">
            <BookOpen className="w-8 h-8 mx-auto mb-3 text-[oklch(0.35_0.010_240)]" />
            <p className="text-[oklch(0.48_0.010_240)] text-sm">No papers with this status</p>
          </div>
        )}
      </div>
    </div>
  );
}
