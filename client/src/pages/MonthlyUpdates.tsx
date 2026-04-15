import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { ArrowRight, Calendar, CheckCircle, Clock, RefreshCw, XCircle } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_ZH = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

export default function MonthlyUpdates() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { t, isZh } = useLanguage();

  const { data: logs, refetch: refetchLogs } = trpc.updateLogs.list.useQuery({ limit: 12 });
  const { data: monthlyPapers } = trpc.papers.getMonthly.useQuery({});

  const triggerImport = trpc.updateLogs.triggerImport.useMutation({
    onSuccess: (data) => {
      toast.success(isZh
        ? `导入完成：已导入 ${data.totalImported} 篇文献，${data.totalFlagged} 篇待审核`
        : `Import completed: ${data.totalImported} papers imported, ${data.totalFlagged} flagged for review`
      );
      refetchLogs();
    },
    onError: () => toast.error(isZh ? "导入失败，请重试。" : "Import failed. Please try again."),
  });

  const now = new Date();
  const MONTHS = isZh ? MONTHS_ZH : MONTHS_EN;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-[oklch(0.20_0.030_285)] bg-[oklch(0.11_0.022_285)]">
        <div className="container py-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="nasa-label mb-2">Literature Tracking</div>
              <h1 className="text-3xl font-bold text-white font-['IBM_Plex_Sans'] mb-2">{t("monthly_title")}</h1>
              <p className="text-[0.82rem] text-[oklch(0.52_0.010_285)]">
                {t("monthly_subtitle")}
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => triggerImport.mutate({ source: "Manual", notes: "Manual import triggered from UI" })}
                disabled={triggerImport.isPending}
                className="flex items-center gap-2 px-4 py-2.5 bg-[oklch(0.46_0.28_290)] text-white text-[0.72rem] font-semibold tracking-wider uppercase rounded-sm hover:bg-[oklch(0.52_0.28_290)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-['IBM_Plex_Mono']"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", triggerImport.isPending && "animate-spin")} />
                {triggerImport.isPending ? t("monthly_triggering") : t("monthly_trigger")}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main: New papers this month */}
          <div className="lg:col-span-2">
            <div className="nasa-section-header mb-4">
              <h2 className="text-base font-bold text-white font-['IBM_Plex_Sans']">
                {t("monthly_new_papers")} — {MONTHS[now.getMonth()]} {now.getFullYear()}
              </h2>
            </div>

            {monthlyPapers && monthlyPapers.length > 0 ? (
              <div className="space-y-2">
                {monthlyPapers.map((paper) => (
                  <Link key={paper.id} href={`/paper/${paper.id}`}>
                    <div className="group flex items-start gap-3 p-4 border border-[oklch(0.20_0.030_285)] bg-[oklch(0.13_0.022_285)] hover:border-[oklch(0.46_0.28_290/0.4)] hover:bg-[oklch(0.15_0.025_285)] transition-all rounded-sm cursor-pointer">
                      <div className="w-1 min-h-[3rem] bg-[oklch(0.72_0.18_290)] rounded-full flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap gap-1.5 mb-1.5">
                          <span className={cn("nasa-tag text-[0.60rem]", paper.species === "cat" ? "nasa-tag-blue" : "nasa-tag-green")}>
                            {paper.species === "cat" ? t("common_feline") : paper.species === "dog" ? t("common_canine") : t("common_both")}
                          </span>
                          <span className="nasa-tag text-[0.60rem]">{paper.lifeStage}</span>
                          <span className={cn("nasa-tag text-[0.60rem]",
                            paper.evidenceLevel === "high" ? "evidence-high" : paper.evidenceLevel === "medium" ? "evidence-medium" : "evidence-low"
                          )}>
                            {paper.evidenceLevel.toUpperCase()}
                          </span>
                        </div>
                        <h4 className="text-[0.82rem] font-medium text-[oklch(0.88_0.006_285)] group-hover:text-white transition-colors line-clamp-2 leading-snug mb-1">
                          {paper.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[0.65rem] text-[oklch(0.48_0.010_285)] font-['IBM_Plex_Mono']">
                          <span>{paper.year}</span>
                          {paper.journal && <><span>·</span><span className="truncate">{paper.journal}</span></>}
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[oklch(0.72_0.18_290)] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-[oklch(0.20_0.030_285)] rounded-sm">
                <Calendar className="w-8 h-8 mx-auto mb-3 text-[oklch(0.32_0.010_285)]" />
                <p className="text-[oklch(0.48_0.010_285)] text-sm">{t("monthly_no_papers")}</p>
              </div>
            )}
          </div>

          {/* Sidebar: Import logs */}
          <div>
            <div className="nasa-section-header mb-4">
              <h2 className="text-base font-bold text-white font-['IBM_Plex_Sans']">{t("monthly_import_logs")}</h2>
            </div>
            <div className="space-y-2">
              {logs && logs.length > 0 ? logs.map((log) => (
                <div key={log.id} className="p-3.5 border border-[oklch(0.20_0.030_285)] bg-[oklch(0.13_0.022_285)] rounded-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {log.status === "completed" ? (
                        <CheckCircle className="w-3.5 h-3.5 text-[oklch(0.65_0.18_145)]" />
                      ) : log.status === "failed" ? (
                        <XCircle className="w-3.5 h-3.5 text-[oklch(0.72_0.18_290)]" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-[oklch(0.82_0.18_75)] animate-pulse" />
                      )}
                      <span className="text-[0.70rem] font-medium text-[oklch(0.82_0.008_285)] font-['IBM_Plex_Mono']">
                        {log.source}
                      </span>
                    </div>
                    <span className={cn(
                      "nasa-tag text-[0.58rem]",
                      log.status === "completed" ? "nasa-tag-green" : log.status === "failed" ? "nasa-tag-red" : ""
                    )}>
                      {log.status === "completed" ? t("monthly_status_completed") : log.status === "failed" ? t("monthly_status_failed") : t("monthly_status_running")}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div className="text-center">
                      <div className="text-sm font-bold text-white">{log.totalFound}</div>
                      <div className="text-[0.58rem] text-[oklch(0.45_0.010_285)] font-['IBM_Plex_Mono']">{t("monthly_found")}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-[oklch(0.65_0.18_145)]">{log.totalImported}</div>
                      <div className="text-[0.58rem] text-[oklch(0.45_0.010_285)] font-['IBM_Plex_Mono']">{t("monthly_imported")}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-[oklch(0.82_0.18_75)]">{log.totalFlagged}</div>
                      <div className="text-[0.58rem] text-[oklch(0.45_0.010_285)] font-['IBM_Plex_Mono']">{t("monthly_flagged")}</div>
                    </div>
                  </div>
                  <div className="text-[0.62rem] text-[oklch(0.42_0.010_285)] font-['IBM_Plex_Mono']">
                    {new Date(log.runDate).toLocaleDateString(isZh ? "zh-CN" : "en-US", { month: "short", day: "numeric", year: "numeric" })}
                    {log.triggeredBy && ` · ${log.triggeredBy}`}
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 border border-[oklch(0.20_0.030_285)] rounded-sm">
                  <p className="text-[oklch(0.45_0.010_285)] text-sm">{t("monthly_no_logs")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
