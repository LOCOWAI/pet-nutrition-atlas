import PaperCard from "@/components/PaperCard";
import { trpc } from "@/lib/trpc";
import { ArrowRight, BookOpen, Cat, Dog, Heart, Sparkles, Zap } from "lucide-react";
import { Link } from "wouter";

const LIFE_STAGES = [
  { value: "junior", label: "Junior", sub: "Kitten / Puppy", desc: "Growth nutrition, immune development, early diet" },
  { value: "adult", label: "Adult", sub: "Prime Years", desc: "Maintenance, weight, vitality & performance" },
  { value: "senior", label: "Senior", sub: "Mature & Aging", desc: "Joint health, cognition, organ support" },
];

const SPECIES_CONFIG = {
  cat: {
    label: "Feline",
    title: "Cats",
    icon: Cat,
    color: "oklch(0.50_0.14_240)",
    tagClass: "nasa-tag-blue",
    desc: "Explore peer-reviewed feline nutrition research covering digestive health, skin & coat, urinary tract, kidney support, and breed-specific concerns. Organized by life stage and health scenario.",
    breedHighlights: ["Persian", "British Shorthair", "Ragdoll", "Maine Coon", "Siamese"],
    topicHighlights: ["Digestive Health", "Urinary Health", "Kidney Support", "Skin & Coat", "Gut Microbiome"],
  },
  dog: {
    label: "Canine",
    title: "Dogs",
    icon: Dog,
    color: "oklch(0.65_0.18_145)",
    tagClass: "nasa-tag-green",
    desc: "Comprehensive canine nutrition literature covering joint mobility, weight management, cognitive aging, heart health, and breed-specific predispositions. Organized by life stage and health scenario.",
    breedHighlights: ["Golden Retriever", "Labrador", "French Bulldog", "German Shepherd", "Poodle"],
    topicHighlights: ["Joint & Mobility", "Weight Management", "Cognitive Aging", "Heart Health", "Immune Support"],
  },
};

export default function SpeciesPage({ species }: { species: "cat" | "dog" }) {
  const config = SPECIES_CONFIG[species];
  const Icon = config.icon;

  const { data: papersData, isLoading } = trpc.papers.list.useQuery({
    species,
    status: undefined,
    limit: 6,
    offset: 0,
  } as any);

  const { data: topicsData } = trpc.topics.list.useQuery({ species });
  const { data: breedsData } = trpc.breeds.list.useQuery({ species });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-[oklch(0.20_0.015_240)] bg-[oklch(0.12_0.020_240)] nasa-grid-bg">
        <div className="container py-12">
          <div className="flex items-start gap-5">
            <div
              className="w-14 h-14 rounded-sm flex items-center justify-center flex-shrink-0"
              style={{ background: `${config.color}20`, border: `1px solid ${config.color}40` }}
            >
              <Icon className="w-7 h-7" style={{ color: config.color }} />
            </div>
            <div>
              <div className="nasa-label mb-1">{config.label} Research</div>
              <h1 className="text-4xl font-bold text-white font-['IBM_Plex_Sans'] mb-3">{config.title}</h1>
              <p className="text-[0.85rem] text-[oklch(0.58_0.010_240)] leading-relaxed max-w-2xl">
                {config.desc}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-10 space-y-12">
        {/* Browse by Life Stage */}
        <section>
          <div className="nasa-section-header mb-4">
            <h2 className="text-lg font-bold text-white font-['IBM_Plex_Sans']">Browse by Life Stage</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {LIFE_STAGES.map((stage) => (
              <Link key={stage.value} href={`/library?species=${species}&lifeStage=${stage.value}`}>
                <div className="nasa-card p-5 cursor-pointer group h-full">
                  <div className="nasa-label mb-1">{stage.sub}</div>
                  <h3 className="text-xl font-bold text-white font-['IBM_Plex_Sans'] mb-2 group-hover:text-[oklch(0.80_0.15_25)] transition-colors">
                    {stage.label}
                  </h3>
                  <p className="text-[0.75rem] text-[oklch(0.52_0.010_240)] leading-relaxed mb-3">{stage.desc}</p>
                  <div className="flex items-center gap-1.5 text-[oklch(0.55_0.22_25)] text-[0.68rem] font-['IBM_Plex_Mono'] tracking-wider uppercase">
                    View Papers <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Health Topics */}
        {topicsData && topicsData.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="nasa-section-header mb-0">
                <h2 className="text-lg font-bold text-white font-['IBM_Plex_Sans']">Health Topics</h2>
              </div>
              <Link href="/health-topics" className="flex items-center gap-1 text-[0.68rem] font-['IBM_Plex_Mono'] tracking-wider uppercase text-[oklch(0.55_0.22_25)] hover:text-[oklch(0.70_0.18_25)]">
                All Topics <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {topicsData.map((topic) => (
                <Link key={topic.id} href={`/health-topics/${topic.slug}`}>
                  <div className="group p-3.5 border border-[oklch(0.22_0.018_240)] bg-[oklch(0.14_0.020_240)] hover:border-[oklch(0.55_0.22_25/0.4)] hover:bg-[oklch(0.16_0.022_240)] transition-all cursor-pointer rounded-sm">
                    <Heart className="w-3.5 h-3.5 text-[oklch(0.55_0.22_25)] mb-2" />
                    <div className="text-[0.72rem] font-medium text-[oklch(0.80_0.008_240)] group-hover:text-white transition-colors leading-tight">
                      {topic.name}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Breeds */}
        {breedsData && breedsData.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="nasa-section-header mb-0">
                <h2 className="text-lg font-bold text-white font-['IBM_Plex_Sans']">Breed Profiles</h2>
              </div>
              <Link href="/breeds" className="flex items-center gap-1 text-[0.68rem] font-['IBM_Plex_Mono'] tracking-wider uppercase text-[oklch(0.55_0.22_25)] hover:text-[oklch(0.70_0.18_25)]">
                All Breeds <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {breedsData.map((breed) => (
                <Link key={breed.id} href={`/breeds/${breed.slug}`}>
                  <div className="group p-3 border border-[oklch(0.22_0.018_240)] bg-[oklch(0.14_0.020_240)] hover:border-[oklch(0.55_0.22_25/0.4)] transition-all cursor-pointer rounded-sm text-center">
                    <Sparkles className="w-3.5 h-3.5 text-[oklch(0.55_0.22_25)] mx-auto mb-1.5" />
                    <div className="text-[0.70rem] font-medium text-[oklch(0.78_0.008_240)] group-hover:text-white transition-colors leading-tight">
                      {breed.breedName}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recent Papers */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="nasa-section-header mb-0">
              <h2 className="text-lg font-bold text-white font-['IBM_Plex_Sans']">Recent Papers</h2>
            </div>
            <Link href={`/library?species=${species}`} className="flex items-center gap-1 text-[0.68rem] font-['IBM_Plex_Mono'] tracking-wider uppercase text-[oklch(0.55_0.22_25)] hover:text-[oklch(0.70_0.18_25)]">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="nasa-card p-5 h-52 animate-pulse">
                  <div className="h-4 bg-[oklch(0.20_0.018_240)] rounded-sm mb-3 w-3/4" />
                  <div className="h-3 bg-[oklch(0.18_0.015_240)] rounded-sm mb-2 w-full" />
                  <div className="h-3 bg-[oklch(0.18_0.015_240)] rounded-sm w-2/3" />
                </div>
              ))}
            </div>
          ) : papersData?.papers && papersData.papers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {papersData.papers.map((paper) => (
                <PaperCard key={paper.id} paper={paper as any} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border border-[oklch(0.20_0.015_240)]">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-[oklch(0.35_0.010_240)]" />
              <p className="text-[oklch(0.48_0.010_240)] text-sm">No papers yet for this species</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
