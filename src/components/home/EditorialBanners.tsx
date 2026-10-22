
import { ArrowRight } from "lucide-react"

import {
  editorialBanners,
  type EditorialBanner,
} from "@/data/editorial-content"

const editorialImages: Record<EditorialBanner["artwork"], string> = {
  emerald: "/images/nfts/macaco-bege.png",
  violet: "/images/nfts/macaco-preto.png",
  gold: "/images/nfts/macaco-marrom.png",
}

function EditorialBannerCard({
  banner,
}: {
  banner: EditorialBanner
}) {
  const imageSrc = editorialImages[banner.artwork]

  return (
    <article
      className={[
        "grid min-w-0 overflow-hidden",
        "rounded-[16px] border border-kurio-border",
        "bg-kurio-card",
        "sm:h-[286px]",
        "sm:grid-cols-[minmax(0,286px)_minmax(0,1fr)]",
      ].join(" ")}
    >
      {/* Imagem quadrada, sem recortar o topo */}
      <div className="aspect-square min-h-0 overflow-hidden bg-kurio-raised sm:aspect-auto sm:h-full">
        <img
          src={imageSrc}
          alt={`Arte da coleção: ${banner.title.replace("\n", " ")}`}
          width={600}
          height={600}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="h-full w-full object-contain"
        />
      </div>

      {/* Textos e botão alinhados à direita */}
      <div
        className={[
          "flex min-w-0 flex-col items-end justify-center",
          "px-5 py-7 text-right",
          "sm:px-5 sm:py-4",
          "lg:px-6",
        ].join(" ")}
      >
        <h3 className="whitespace-pre-line font-mono text-sm font-bold leading-5 text-foreground lg:text-base lg:leading-6">
          {banner.title}
        </h3>

        <p className="mt-8 font-mono text-[13px] leading-[20px] text-kurio-text-secondary">
          {banner.description}
        </p>

        <a
          href={banner.href}
          className={[
            "mt-5 inline-flex h-[30px] items-center justify-center",
            "gap-2 self-end rounded-[7px] bg-kurio-primary px-4",
            "font-mono text-[12px] font-bold text-kurio-ink",
            "transition-colors hover:bg-kurio-primary-light",
            "focus-visible:outline-2 focus-visible:outline-offset-2",
            "focus-visible:outline-kurio-primary",
          ].join(" ")}
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
      id="criadores"
      aria-label="Coleções em destaque"
      className="pb-16 pt-4 sm:pb-20"
    >
      <div className="mx-auto grid w-full max-w-[1920px] gap-6 px-5 sm:px-8 md:grid-cols-2 lg:px-12 xl:px-[85px]">
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
