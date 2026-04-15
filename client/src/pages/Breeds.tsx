import PaperCard from "@/components/PaperCard";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, BookOpen, Cat, Dog, Sparkles } from "lucide-react";
import { Link } from "wouter";

export function BreedsList() {
  const { data: allBreeds, isLoading } = trpc.breeds.list.useQuery({});

  const cats = allBreeds?.filter((b) => b.species === "cat") ?? [];
  const dogs = allBreeds?.filter((b) => b.species === "dog") ?? [];

  return (
    <div className="min-h-screen">
      <div className="border-b border-[oklch(0.20_0.015_240)] bg-[oklch(0.12_0.020_240)]">
        <div className="container py-10">
          <div className="nasa-label mb-2">Species Profiles</div>
          <h1 className="text-3xl font-bold text-white font-['IBM_Plex_Sans'] mb-2">Breed Profiles</h1>
          <p className="text-[0.82rem] text-[oklch(0.55_0.010_240)]">
            Breed-specific nutrition research and common health predispositions
          </p>
        </div>
      </div>

      <div className="container py-10 space-y-10">
        {/* Cats */}
        <section>
          <div className="nasa-section-header mb-4">
            <div className="flex items-center gap-2">
              <Cat className="w-4 h-4 text-[oklch(0.65_0.12_240)]" />
              <h2 className="text-lg font-bold text-white font-['IBM_Plex_Sans']">Feline Breeds</h2>
            </div>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="nasa-card p-4 h-24 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {cats.map((breed) => (
                <Link key={breed.id} href={`/breeds/${breed.slug}`}>
                  <div className="group nasa-card p-4 cursor-pointer text-center">
                    <Cat className="w-5 h-5 text-[oklch(0.65_0.12_240)] mx-auto mb-2" />
                    <div className="text-[0.75rem] font-medium text-[oklch(0.82_0.008_240)] group-hover:text-white transition-colors leading-tight">
                      {breed.breedName}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Dogs */}
        <section>
          <div className="nasa-section-header mb-4">
            <div className="flex items-center gap-2">
              <Dog className="w-4 h-4 text-[oklch(0.65_0.18_145)]" />
              <h2 className="text-lg font-bold text-white font-['IBM_Plex_Sans']">Canine Breeds</h2>
            </div>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="nasa-card p-4 h-24 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {dogs.map((breed) => (
                <Link key={breed.id} href={`/breeds/${breed.slug}`}>
                  <div className="group nasa-card p-4 cursor-pointer text-center">
                    <Dog className="w-5 h-5 text-[oklch(0.65_0.18_145)] mx-auto mb-2" />
                    <div className="text-[0.75rem] font-medium text-[oklch(0.82_0.008_240)] group-hover:text-white transition-colors leading-tight">
                      {breed.breedName}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export function BreedDetail({ params }: { params: { slug: string } }) {
  const { data: breed, isLoading, error } = trpc.breeds.getBySlug.useQuery({ slug: params.slug });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-40 bg-[oklch(0.20_0.018_240)] rounded-sm" />
            <div className="h-10 w-1/2 bg-[oklch(0.20_0.018_240)] rounded-sm" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !breed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[oklch(0.50_0.010_240)] mb-4">Breed not found</p>
          <Link href="/breeds" className="text-[0.72rem] font-['IBM_Plex_Mono'] tracking-wider uppercase text-[oklch(0.55_0.22_25)]">
            ← Back to Breeds
          </Link>
        </div>
      </div>
    );
  }

  const isCat = breed.species === "cat";
  const SpeciesIcon = isCat ? Cat : Dog;
  const iconColor = isCat ? "oklch(0.65_0.12_240)" : "oklch(0.65_0.18_145)";

  return (
    <div className="min-h-screen">
      <div className="border-b border-[oklch(0.20_0.015_240)] bg-[oklch(0.12_0.020_240)]">
        <div className="container py-10">
          <Link href="/breeds" className="inline-flex items-center gap-2 text-[0.68rem] font-['IBM_Plex_Mono'] tracking-wider uppercase text-[oklch(0.50_0.010_240)] hover:text-[oklch(0.55_0.22_25)] mb-4">
            <ArrowLeft className="w-3 h-3" /> Breed Profiles
          </Link>
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-sm flex items-center justify-center flex-shrink-0"
              style={{ background: `${iconColor}18`, border: `1px solid ${iconColor}35` }}
            >
              <SpeciesIcon className="w-6 h-6" style={{ color: iconColor }} />
            </div>
            <div>
              <div className="nasa-label">{isCat ? "Feline" : "Canine"} Breed Profile</div>
              <h1 className="text-3xl font-bold text-white font-['IBM_Plex_Sans']">{breed.breedName}</h1>
            </div>
          </div>

          {/* Breed metadata */}
          <div className="flex flex-wrap gap-4 mt-5">
            {breed.nutritionFocus && breed.nutritionFocus.length > 0 && (
              <div>
                <div className="nasa-label">Nutrition Focus</div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {breed.nutritionFocus.map((f: string) => (
                    <span key={f} className="nasa-tag">{f}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {breed.overview && (
            <p className="mt-4 text-[0.82rem] text-[oklch(0.58_0.010_240)] max-w-2xl leading-relaxed">
              {breed.overview}
            </p>
          )}
        </div>
      </div>

      <div className="container py-10">
        {/* Common health concerns */}
        {breed.commonIssues && breed.commonIssues.length > 0 && (
          <div className="mb-8">
            <div className="nasa-section-header mb-3">
              <h2 className="text-base font-bold text-white font-['IBM_Plex_Sans']">Common Health Concerns</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {breed.commonIssues.map((concern: string) => (
                <span key={concern} className="nasa-tag nasa-tag-red">{concern}</span>
              ))}
            </div>
          </div>
        )}

        {/* Related papers */}
        <div>
          <div className="nasa-section-header mb-4">
            <h2 className="text-base font-bold text-white font-['IBM_Plex_Sans']">
              Related Research ({(breed as any).papers?.length ?? 0} papers)
            </h2>
          </div>
          {(breed as any).papers && (breed as any).papers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(breed as any).papers.map((paper: any) => (
                <PaperCard key={paper.id} paper={paper} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-[oklch(0.20_0.015_240)]">
              <BookOpen className="w-8 h-8 mx-auto mb-3 text-[oklch(0.35_0.010_240)]" />
              <p className="text-[oklch(0.48_0.010_240)] text-sm">No breed-specific papers yet</p>
              <Link href="/library" className="mt-3 inline-block text-[0.68rem] font-['IBM_Plex_Mono'] tracking-wider uppercase text-[oklch(0.55_0.22_25)]">
                Browse All Papers →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
