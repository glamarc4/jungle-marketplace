
import { useEffect, useState } from "react"
import { ZoomIn, X } from "lucide-react"

import { MonkeyArtwork } from "@/components/home/MonkeyArtwork"
import type { NftArtworkVariant } from "@/data/nft-details"

type NftGalleryProps = {
  title: string
  images: NftArtworkVariant[]
}

export function NftGallery({ title, images }: NftGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isZoomOpen, setIsZoomOpen] = useState(false)

  const selectedArtwork = images[selectedIndex] ?? images[0]

  useEffect(() => {
    if (!isZoomOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsZoomOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isZoomOpen])

  return (
    <>
      <div className="grid min-w-0 grid-cols-1 items-start gap-4 lg:grid-cols-[88px_minmax(0,1fr)]">
        {/* Miniaturas: somente desktop */}
        <div
          className="hidden flex-col gap-3 lg:flex"
          aria-label="Miniaturas do NFT"
        >
          {images.map((artwork, index) => (
            <button
              key={`${artwork}-${index}`}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`Visualizar imagem ${index + 1} de ${title}`}
              aria-pressed={selectedIndex === index}
              className={[
                "overflow-hidden rounded-xl border-2 p-0.5",
                "transition-colors duration-200",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kurio-primary",
                selectedIndex === index
                  ? "border-kurio-primary bg-kurio-primary/10"
                  : "border-transparent hover:border-kurio-border-soft",
              ].join(" ")}
            >
              <div className="aspect-square w-full overflow-hidden rounded-lg bg-kurio-raised">
                <MonkeyArtwork variant={artwork} />
              </div>
            </button>
          ))}
        </div>

        {/* Imagem principal */}
        <div
          className={[
            "relative min-w-0 overflow-hidden",
            "rounded-[24px] bg-kurio-card",
            "lg:rounded-[20px] lg:border lg:border-kurio-border-soft",
            "lg:p-3 lg:shadow-sm",
          ].join(" ")}
        >
          <div
            className={[
              "aspect-square w-full overflow-hidden",
              "rounded-[24px] bg-kurio-raised",
              "lg:rounded-[13px] lg:border lg:border-white/10",
            ].join(" ")}
          >
            <MonkeyArtwork variant={selectedArtwork} />
          </div>

          {/* Zoom: somente desktop */}
          <button
            type="button"
            onClick={() => setIsZoomOpen(true)}
            aria-label={`Ampliar imagem de ${title}`}
            className={[
              "absolute right-5 top-5 z-10",
              "hidden size-10 items-center justify-center rounded-full lg:flex",
              "border border-white/35",
              "bg-gradient-to-br from-white/30 via-kurio-ink/65 to-kurio-ink/90",
              "text-white shadow-lg shadow-black/20 backdrop-blur-md",
              "transition-all duration-200 ease-out",
              "hover:scale-105 hover:border-white/65 hover:from-white/40",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kurio-primary",
              "motion-reduce:transition-none",
            ].join(" ")}
          >
            <ZoomIn
              className="size-5"
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {/* Modal de zoom preservado */}
      {isZoomOpen && (
        <div
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsZoomOpen(false)
            }
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-10"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Imagem ampliada de ${title}`}
            className="relative flex max-h-full max-w-5xl items-center justify-center"
          >
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              aria-label="Fechar imagem ampliada"
              autoFocus
              className="absolute -right-2 -top-12 flex size-10 items-center justify-center rounded-full border border-white/20 bg-kurio-card text-white transition-colors hover:bg-kurio-raised"
            >
              <X className="size-6" aria-hidden="true" />
            </button>

            <div className="aspect-square w-[min(80vw,80vh)] max-w-full overflow-hidden rounded-2xl border border-white/20">
              <MonkeyArtwork variant={selectedArtwork} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
