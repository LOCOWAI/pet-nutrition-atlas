import PaperCard from "@/components/PaperCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, BookOpen, Cat, Dog } from "lucide-react";
import { Link } from "wouter";

export function BreedsList() {
  const { data: allBreeds, isLoading } = trpc.breeds.list.useQuery({});
  const { t } = useLanguage();

  const cats = allBreeds?.filter((b) => b.species === "cat") ?? [];
  const dogs = allBreeds?.filter((b) => b.species === "dog") ?? [];

  return (
    <div className="min-h-screen">
      <div className="border-b border-[oklch(0.20_0.030_285)] bg-[oklch(0.11_0.022_285)]">
        <div className="container py-10">
          <div className="nasa-label mb-2">Species Profiles</div>
          <h1 className="text-3xl font-bold text-white font-['IBM_Plex_Sans'] mb-2">{t("breeds_title")}</h1>
          <p className="text-[0.82rem] text-[oklch(0.52_0.010_285)]">
            {t("breeds_subtitle")}
          </p>
        </div>
      </div>

      <div className="container py-10 space-y-10">
        {/* Cats */}
        <section>
          <div className="nasa-section-header mb-4">
            <div className="flex items-center gap-2">
              <Cat className="w-4 h-4 text-[oklch(0.62_0.18_240)]" />
              <h2 className="text-lg font-bold text-white font-['IBM_Plex_Sans']">{t("common_feline")} {t("nav_breeds")}</h2>
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
                    <Cat className="w-5 h-5 text-[oklch(0.62_0.18_240)] mx-auto mb-2" />
                    <div className="text-[0.75rem] font-medium text-[oklch(0.82_0.008_285)] group-hover:text-white transition-colors leading-tight">
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
              <h2 className="text-lg font-bold text-white font-['IBM_Plex_Sans']">{t("common_canine")} {t("nav_breeds")}</h2>
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
                    <div className="text-[0.75rem] font-medium text-[oklch(0.82_0.008_285)] group-hover:text-white transition-colors leading-tight">
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
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-40 bg-[oklch(0.20_0.025_285)] rounded-sm" />
            <div className="h-10 w-1/2 bg-[oklch(0.20_0.025_285)] rounded-sm" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !breed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[oklch(0.50_0.010_285)] mb-4">{t("common_not_found")}</p>
          <Link href="/breeds" className="text-[0.72rem] font-['IBM_Plex_Mono'] tracking-wider uppercase text-[oklch(0.72_0.18_290)]">
            ← {t("breeds_back")}
          </Link>
        </div>
      </div>
    );
  }

  const isCat = breed.species === "cat";
  const SpeciesIcon = isCat ? Cat : Dog;
  const iconColor = isCat ? "oklch(0.62_0.18_240)" : "oklch(0.65_0.18_145)";

  return (
    <div className="min-h-screen">
      <div className="border-b border-[oklch(0.20_0.030_285)] bg-[oklch(0.11_0.022_285)]">
        <div className="container py-10">
          <Link href="/breeds" className="inline-flex items-center gap-2 text-[0.68rem] font-['IBM_Plex_Mono'] tracking-wider uppercase text-[oklch(0.50_0.010_285)] hover:text-[oklch(0.72_0.18_290)] mb-4">
            <ArrowLeft className="w-3 h-3" /> {t("breeds_back")}
          </Link>
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-sm flex items-center justify-center flex-shrink-0"
              style={{ background: `${iconColor}18`, border: `1px solid ${iconColor}35` }}
            >
              <SpeciesIcon className="w-6 h-6" style={{ color: iconColor }} />
            </div>
            <div>
              <div className="nasa-label">{isCat ? t("common_feline") : t("common_canine")} Breed Profile</div>
              <h1 className="text-3xl font-bold text-white font-['IBM_Plex_Sans']">{breed.breedName}</h1>
            </div>
          </div>

          {/* Breed metadata */}
          <div className="flex flex-wrap gap-4 mt-5">
            {breed.nutritionFocus && breed.nutritionFocus.length > 0 && (
              <div>
                <div className="nasa-label">{t("breeds_nutrition_focus")}</div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {breed.nutritionFocus.map((f: string) => (
                    <span key={f} className="nasa-tag">{f}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {breed.overview && (
            <p className="mt-4 text-[0.82rem] text-[oklch(0.55_0.010_285)] max-w-2xl leading-relaxed">
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
              <h2 className="text-base font-bold text-white font-['IBM_Plex_Sans']">{t("breeds_common_issues")}</h2>
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
              {t("breeds_related_papers")} ({(breed as any).papers?.length ?? 0} {t("breeds_papers_count")})
            </h2>
          </div>
          {(breed as any).papers && (breed as any).papers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(breed as any).papers.map((paper: any) => (
                <PaperCard key={paper.id} paper={paper} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-[oklch(0.20_0.030_285)]">
              <BookOpen className="w-8 h-8 mx-auto mb-3 text-[oklch(0.32_0.010_285)]" />
              <p className="text-[oklch(0.48_0.010_285)] text-sm">{t("breeds_no_papers")}</p>
              <Link href="/library" className="mt-3 inline-block text-[0.68rem] font-['IBM_Plex_Mono'] tracking-wider uppercase text-[oklch(0.72_0.18_290)]">
                {t("nav_reference_library")} →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
