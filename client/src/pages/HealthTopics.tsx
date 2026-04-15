import PaperCard from "@/components/PaperCard";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, BookOpen, FlaskConical, Heart } from "lucide-react";
import { Link } from "wouter";

// Topic list page
export function HealthTopicsList() {
  const { data: topics, isLoading } = trpc.topics.list.useQuery({});

  return (
    <div className="min-h-screen">
      <div className="border-b border-[oklch(0.20_0.015_240)] bg-[oklch(0.12_0.020_240)]">
        <div className="container py-10">
          <div className="nasa-label mb-2">Research Categories</div>
          <h1 className="text-3xl font-bold text-white font-['IBM_Plex_Sans'] mb-2">Health Topics</h1>
          <p className="text-[0.82rem] text-[oklch(0.55_0.010_240)]">
            15 health scenarios covering feline and canine nutrition research
          </p>
        </div>
      </div>

      <div className="container py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="nasa-card p-5 h-32 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics?.map((topic) => (
              <Link key={topic.id} href={`/health-topics/${topic.slug}`}>
                <div className="nasa-card p-5 cursor-pointer group h-full">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-sm bg-[oklch(0.55_0.22_25/0.12)] border border-[oklch(0.55_0.22_25/0.25)] flex items-center justify-center flex-shrink-0">
                      <Heart className="w-4 h-4 text-[oklch(0.55_0.22_25)]" />
                    </div>
                    <div>
                      <div className="nasa-label mb-0.5">
                        {topic.species === "cat" ? "Feline" : topic.species === "dog" ? "Canine" : "Feline & Canine"}
                      </div>
                      <h3 className="text-[0.88rem] font-semibold text-white group-hover:text-[oklch(0.80_0.15_25)] transition-colors font-['IBM_Plex_Sans'] mb-1">
                        {topic.name}
                      </h3>
                      {topic.description && (
                        <p className="text-[0.72rem] text-[oklch(0.52_0.010_240)] leading-relaxed line-clamp-2">
                          {topic.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Topic detail page
export function HealthTopicDetail({ params }: { params: { slug: string } }) {
  const { data, isLoading, error } = trpc.topics.getBySlug.useQuery({ slug: params.slug });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container py-8">
          <div className="animate-pulse space-y-4 max-w-4xl">
            <div className="h-6 w-48 bg-[oklch(0.20_0.018_240)] rounded-sm" />
            <div className="h-10 w-3/4 bg-[oklch(0.20_0.018_240)] rounded-sm" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[oklch(0.50_0.010_240)] mb-4">Topic not found</p>
          <Link href="/health-topics" className="text-[0.72rem] font-['IBM_Plex_Mono'] tracking-wider uppercase text-[oklch(0.55_0.22_25)]">
            ← Back to Health Topics
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="border-b border-[oklch(0.20_0.015_240)] bg-[oklch(0.12_0.020_240)]">
        <div className="container py-10">
          <Link href="/health-topics" className="inline-flex items-center gap-2 text-[0.68rem] font-['IBM_Plex_Mono'] tracking-wider uppercase text-[oklch(0.50_0.010_240)] hover:text-[oklch(0.55_0.22_25)] mb-4">
            <ArrowLeft className="w-3 h-3" /> Health Topics
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-sm bg-[oklch(0.55_0.22_25/0.12)] border border-[oklch(0.55_0.22_25/0.25)] flex items-center justify-center">
              <Heart className="w-5 h-5 text-[oklch(0.55_0.22_25)]" />
            </div>
            <div>
              <div className="nasa-label">
                {data.species === "cat" ? "Feline" : data.species === "dog" ? "Canine" : "Feline & Canine"}
              </div>
              <h1 className="text-3xl font-bold text-white font-['IBM_Plex_Sans']">{data.name}</h1>
            </div>
          </div>
          {data.description && (
            <p className="text-[0.82rem] text-[oklch(0.58_0.010_240)] max-w-2xl leading-relaxed">{data.description}</p>
          )}
          <div className="mt-3 text-[0.70rem] text-[oklch(0.45_0.010_240)] font-['IBM_Plex_Mono']">
            {data.papers.length} papers in this category
          </div>
        </div>
      </div>

      <div className="container py-10">
        {data.papers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.papers.map((paper) => (
              <PaperCard key={paper.id} paper={paper as any} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-[oklch(0.20_0.015_240)]">
            <BookOpen className="w-8 h-8 mx-auto mb-3 text-[oklch(0.35_0.010_240)]" />
            <p className="text-[oklch(0.48_0.010_240)] text-sm">No papers in this topic yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
