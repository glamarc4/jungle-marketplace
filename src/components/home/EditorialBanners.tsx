
import { ArrowRight } from "lucide-react"

import { MonkeyArtwork } from "@/components/home/MonkeyArtwork"
import {
  editorialBanners,
  type EditorialBanner,
} from "@/data/editorial-content"

function EditorialBannerCard({
  banner,
}: {
  banner: EditorialBanner
}) {
  return (
    <article className="grid min-w-0 overflow-hidden rounded-md bg-kurio-card sm:grid-cols-2">
      <div className="aspect-square min-h-0 overflow-hidden rounded-md bg-kurio-raised sm:aspect-auto">
        <MonkeyArtwork variant={banner.artwork} />
      </div>

      <div className="flex min-w-0 flex-col items-center justify-center px-5 py-7 text-center sm:px-4 sm:py-5 lg:px-6">
        <h3 className="whitespace-pre-line font-mono text-sm font-bold leading-6 text-foreground lg:text-base">
          {banner.title}
        </h3>

        <p className="mt-3 font-mono text-xs leading-6 text-kurio-text-secondary lg:text-sm">
          {banner.description}
        </p>

        <a
          href={banner.href}
          className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-kurio-primary px-5 font-mono text-xs font-bold text-kurio-ink transition-colors hover:bg-kurio-primary-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kurio-primary"
        >
          {banner.buttonLabel}
          <ArrowRight aria-hidden="true" className="size-4" />
        </a>
      </div>
    </article>
  )
}

export function EditorialBanners() {
  return (
    <section
      aria-label="Coleções em destaque"
      className="pb-16 pt-4 sm:pb-20"
    >
      <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
        {editorialBanners.map((banner) => (
          <EditorialBannerCard
            key={banner.id}
            banner={banner}
          />
        ))}
      </div>
    </section>
  )
}
