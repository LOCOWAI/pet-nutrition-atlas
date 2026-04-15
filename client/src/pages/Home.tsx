import PaperCard from "@/components/PaperCard";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Cat,
  Dog,
  Dumbbell,
  FlaskConical,
  Heart,
  Microscope,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

const HEALTH_TOPIC_ICONS: Record<string, React.ElementType> = {
  "digestive-health": FlaskConical,
  "skin-coat": Sparkles,
  "joint-mobility": Zap,
  "weight-management": Dumbbell,
  "urinary-health": Shield,
  "kidney-support": Shield,
  "dental-oral-health": Heart,
  "immune-support": Shield,
  "cognitive-aging": Brain,
  "heart-health": Heart,
  "liver-support": FlaskConical,
  "gut-microbiome": Microscope,
  "food-sensitivity-allergy": Shield,
  "stress-behavior": Brain,
  "muscle-maintenance": Dumbbell,
};

const LIFE_STAGES = [
  { label: "Junior", sub: "Kitten / Puppy", value: "junior", desc: "Growth, development & early immunity" },
  { label: "Adult", sub: "Prime Years", value: "adult", desc: "Maintenance, weight & vitality" },
  { label: "Senior", sub: "Mature & Aging", value: "senior", desc: "Joints, cognition & organ support" },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();

  const { data: stats } = trpc.papers.getStats.useQuery();
  const { data: featuredData } = trpc.papers.getFeatured.useQuery({ limit: 6 });
  const { data: topicsData } = trpc.topics.list.useQuery({});
  const { data: monthlyData } = trpc.papers.getMonthly.useQuery({});

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/library?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* ============================================================
          HERO SECTION
          ============================================================ */}
      <section className="relative overflow-hidden nasa-hero-gradient nasa-grid-bg">
        <div className="absolute inset-0 pointer-events-none">
          {/* Decorative grid lines */}
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-[oklch(0.55_0.22_25/0.15)] to-transparent" />
          <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-[oklch(0.40_0.08_240/0.10)] to-transparent" />
        </div>

        <div className="container relative py-20 lg:py-28">
          {/* Mission label */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-[oklch(0.55_0.22_25)]" />
            <span className="nasa-label">Scientific Literature Database</span>
            <div className="w-8 h-px bg-[oklch(0.55_0.22_25)]" />
          </div>

          {/* Main headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.08] tracking-tight mb-5 max-w-4xl font-['IBM_Plex_Sans']">
            Pet Nutrition
            <br />
            <span className="text-[oklch(0.55_0.22_25)]">Research Atlas</span>
          </h1>

          <p className="text-[oklch(0.65_0.010_240)] text-base md:text-lg leading-relaxed max-w-2xl mb-10 font-light">
            A structured research library for feline and canine nutrition, organized by life stage,
            health scenario, breed relevance, and content opportunity.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[oklch(0.50_0.010_240)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by topic, breed, life stage, ingredient, or health concern"
                className="w-full pl-11 pr-32 py-4 bg-[oklch(0.16_0.022_240)] border border-[oklch(0.28_0.022_240)] text-white placeholder-[oklch(0.45_0.010_240)] text-sm rounded-sm focus:outline-none focus:border-[oklch(0.55_0.22_25)] focus:ring-1 focus:ring-[oklch(0.55_0.22_25/0.3)] transition-all font-['Inter']"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-[oklch(0.55_0.22_25)] text-white text-[0.75rem] font-semibold tracking-wider uppercase rounded-sm hover:bg-[oklch(0.60_0.22_25)] transition-colors font-['IBM_Plex_Mono']"
              >
                Search
              </button>
            </div>
          </form>

          {/* Stats row */}
          {stats && (
            <div className="flex flex-wrap gap-6 mt-10">
              {[
                { label: "Total Papers", value: stats.approved },
                { label: "Feline Studies", value: stats.cats },
                { label: "Canine Studies", value: stats.dogs },
                { label: "Featured", value: stats.featured },
              ].map((stat) => (
                <div key={stat.label} className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white font-['IBM_Plex_Sans']">{stat.value}</span>
                  <span className="text-[0.68rem] text-[oklch(0.50_0.010_240)] tracking-wider uppercase font-['IBM_Plex_Mono']">{stat.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          BROWSE BY SPECIES
          ============================================================ */}
      <section className="py-16 bg-[oklch(0.12_0.020_240)]">
        <div className="container">
          <div className="nasa-section-header">
            <h2 className="text-xl font-bold text-white font-['IBM_Plex_Sans'] tracking-tight">Browse by Species</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cats */}
            <Link href="/cats">
              <div className="group relative overflow-hidden nasa-card p-8 cursor-pointer">
                <div className="absolute top-0 right-0 w-48 h-48 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Cat className="w-full h-full text-[oklch(0.50_0.14_240)]" />
                </div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-sm bg-[oklch(0.50_0.14_240/0.15)] border border-[oklch(0.50_0.14_240/0.3)] flex items-center justify-center">
                      <Cat className="w-5 h-5 text-[oklch(0.65_0.12_240)]" />
                    </div>
                    <div>
                      <div className="nasa-label">Feline Research</div>
                      <h3 className="text-xl font-bold text-white font-['IBM_Plex_Sans']">Cats</h3>
                    </div>
                  </div>
                  <p className="text-[0.80rem] text-[oklch(0.58_0.010_240)] leading-relaxed mb-4">
                    Explore feline nutrition research across life stages, from kitten development to senior care. Includes breed-specific studies for Persian, British Shorthair, Ragdoll, and more.
                  </p>
                  <div className="flex items-center gap-2 text-[oklch(0.65_0.12_240)] text-[0.72rem] font-['IBM_Plex_Mono'] tracking-wider uppercase group-hover:gap-3 transition-all">
                    Explore Feline Research <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Dogs */}
            <Link href="/dogs">
              <div className="group relative overflow-hidden nasa-card p-8 cursor-pointer">
                <div className="absolute top-0 right-0 w-48 h-48 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Dog className="w-full h-full text-[oklch(0.65_0.18_145)]" />
                </div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-sm bg-[oklch(0.65_0.18_145/0.12)] border border-[oklch(0.65_0.18_145/0.3)] flex items-center justify-center">
                      <Dog className="w-5 h-5 text-[oklch(0.65_0.18_145)]" />
                    </div>
                    <div>
                      <div className="nasa-label">Canine Research</div>
                      <h3 className="text-xl font-bold text-white font-['IBM_Plex_Sans']">Dogs</h3>
                    </div>
                  </div>
                  <p className="text-[0.80rem] text-[oklch(0.58_0.010_240)] leading-relaxed mb-4">
                    Comprehensive canine nutrition literature covering joint health, weight management, cognitive aging, and breed-specific concerns for Golden Retrievers, Labradors, French Bulldogs, and more.
                  </p>
                  <div className="flex items-center gap-2 text-[oklch(0.65_0.18_145)] text-[0.72rem] font-['IBM_Plex_Mono'] tracking-wider uppercase group-hover:gap-3 transition-all">
                    Explore Canine Research <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          BROWSE BY LIFE STAGE
          ============================================================ */}
      <section className="py-16">
        <div className="container">
          <div className="nasa-section-header">
            <h2 className="text-xl font-bold text-white font-['IBM_Plex_Sans'] tracking-tight">Browse by Life Stage</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {LIFE_STAGES.map((stage) => (
              <Link key={stage.value} href={`/library?lifeStage=${stage.value}`}>
                <div className="nasa-card p-6 cursor-pointer group h-full">
                  <div className="nasa-label mb-1">{stage.sub}</div>
                  <h3 className="text-2xl font-bold text-white font-['IBM_Plex_Sans'] mb-2 group-hover:text-[oklch(0.80_0.15_25)] transition-colors">
                    {stage.label}
                  </h3>
                  <p className="text-[0.78rem] text-[oklch(0.55_0.010_240)] leading-relaxed mb-4">
                    {stage.desc}
                  </p>
                  <div className="flex items-center gap-2 text-[oklch(0.55_0.22_25)] text-[0.68rem] font-['IBM_Plex_Mono'] tracking-wider uppercase">
                    Browse Papers <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          BROWSE BY HEALTH TOPIC
          ============================================================ */}
      <section className="py-16 bg-[oklch(0.12_0.020_240)]">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <div className="nasa-section-header mb-0">
              <h2 className="text-xl font-bold text-white font-['IBM_Plex_Sans'] tracking-tight">Browse by Health Topic</h2>
            </div>
            <Link href="/health-topics" className="flex items-center gap-1.5 text-[0.70rem] font-['IBM_Plex_Mono'] tracking-wider uppercase text-[oklch(0.55_0.22_25)] hover:text-[oklch(0.70_0.18_25)] transition-colors">
              All Topics <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {topicsData?.slice(0, 15).map((topic) => {
              const Icon = HEALTH_TOPIC_ICONS[topic.slug] || FlaskConical;
              return (
                <Link key={topic.id} href={`/health-topics/${topic.slug}`}>
                  <div className="group p-3.5 border border-[oklch(0.22_0.018_240)] bg-[oklch(0.14_0.020_240)] hover:border-[oklch(0.55_0.22_25/0.4)] hover:bg-[oklch(0.16_0.022_240)] transition-all cursor-pointer rounded-sm">
                    <Icon className="w-4 h-4 text-[oklch(0.55_0.22_25)] mb-2" />
                    <div className="text-[0.72rem] font-medium text-[oklch(0.80_0.008_240)] group-hover:text-white transition-colors leading-tight font-['IBM_Plex_Sans']">
                      {topic.name}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          FEATURED PAPERS
          ============================================================ */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <div className="nasa-section-header mb-0">
              <h2 className="text-xl font-bold text-white font-['IBM_Plex_Sans'] tracking-tight">Featured Papers</h2>
            </div>
            <Link href="/library" className="flex items-center gap-1.5 text-[0.70rem] font-['IBM_Plex_Mono'] tracking-wider uppercase text-[oklch(0.55_0.22_25)] hover:text-[oklch(0.70_0.18_25)] transition-colors">
              Reference Library <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {featuredData?.papers && featuredData.papers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredData.papers.map((paper) => (
                <PaperCard key={paper.id} paper={paper as any} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-[oklch(0.45_0.010_240)]">
              <BookOpen className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No featured papers yet</p>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          MONTHLY UPDATES
          ============================================================ */}
      <section className="py-16 bg-[oklch(0.12_0.020_240)]">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <div className="nasa-section-header mb-0">
              <h2 className="text-xl font-bold text-white font-['IBM_Plex_Sans'] tracking-tight">Monthly Updates</h2>
            </div>
            <Link href="/monthly-updates" className="flex items-center gap-1.5 text-[0.70rem] font-['IBM_Plex_Mono'] tracking-wider uppercase text-[oklch(0.55_0.22_25)] hover:text-[oklch(0.70_0.18_25)] transition-colors">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* New papers this month */}
            <div className="lg:col-span-2">
              <div className="nasa-label mb-3">
                New This Month — {new Date().toLocaleString("en-US", { month: "long", year: "numeric" })}
              </div>
              {monthlyData && monthlyData.length > 0 ? (
                <div className="space-y-2">
                  {monthlyData.slice(0, 4).map((paper) => (
                    <Link key={paper.id} href={`/paper/${paper.id}`}>
                      <div className="group flex items-start gap-3 p-3.5 border border-[oklch(0.20_0.015_240)] bg-[oklch(0.13_0.018_240)] hover:border-[oklch(0.30_0.025_240)] hover:bg-[oklch(0.15_0.020_240)] transition-all rounded-sm cursor-pointer">
                        <div className="w-1 h-full min-h-[2.5rem] bg-[oklch(0.55_0.22_25)] rounded-full flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[0.80rem] font-medium text-[oklch(0.88_0.006_240)] group-hover:text-white transition-colors line-clamp-2 leading-snug mb-1">
                            {paper.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[0.65rem] text-[oklch(0.48_0.010_240)] font-['IBM_Plex_Mono']">
                            <span>{paper.year}</span>
                            <span>·</span>
                            <span className="truncate">{paper.journal}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3 h-3 text-[oklch(0.55_0.22_25)] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-[0.80rem] text-[oklch(0.45_0.010_240)] py-6 text-center border border-[oklch(0.20_0.015_240)] rounded-sm">
                  No new papers added this month yet.
                </div>
              )}
            </div>

            {/* Quick links */}
            <div className="space-y-3">
              <div className="nasa-label mb-3">Quick Access</div>
              {[
                { label: "Content Opportunities", href: "/content-opportunities", icon: FlaskConical, desc: "Brand content angles from research" },
                { label: "Breed Profiles", href: "/breeds", icon: Sparkles, desc: "Species-specific health research" },
                { label: "Reference Library", href: "/library", icon: BookOpen, desc: "Full searchable literature database" },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <div className="group flex items-center gap-3 p-4 border border-[oklch(0.20_0.015_240)] bg-[oklch(0.13_0.018_240)] hover:border-[oklch(0.55_0.22_25/0.4)] transition-all rounded-sm cursor-pointer">
                    <item.icon className="w-4 h-4 text-[oklch(0.55_0.22_25)] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[0.75rem] font-medium text-[oklch(0.85_0.006_240)] group-hover:text-white transition-colors">
                        {item.label}
                      </div>
                      <div className="text-[0.65rem] text-[oklch(0.48_0.010_240)]">{item.desc}</div>
                    </div>
                    <ArrowRight className="w-3 h-3 text-[oklch(0.55_0.22_25)] flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FOOTER
          ============================================================ */}
      <footer className="border-t border-[oklch(0.20_0.015_240)] py-10">
        <div className="container">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="text-[0.72rem] font-bold tracking-widest uppercase text-white font-['IBM_Plex_Sans'] mb-1">
                Pet Nutrition Research Atlas
              </div>
              <div className="text-[0.65rem] text-[oklch(0.45_0.010_240)] font-['IBM_Plex_Mono']">
                Academic literature database for feline & canine nutrition research
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-[0.65rem] font-['IBM_Plex_Mono'] tracking-wider uppercase text-[oklch(0.45_0.010_240)]">
              <Link href="/library" className="hover:text-[oklch(0.55_0.22_25)] transition-colors">Reference Library</Link>
              <Link href="/health-topics" className="hover:text-[oklch(0.55_0.22_25)] transition-colors">Health Topics</Link>
              <Link href="/breeds" className="hover:text-[oklch(0.55_0.22_25)] transition-colors">Breeds</Link>
              <Link href="/monthly-updates" className="hover:text-[oklch(0.55_0.22_25)] transition-colors">Updates</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
