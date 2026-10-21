
import { useEffect, useState } from "react"
import { Search, X } from "lucide-react"

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
      <div className="grid grid-cols-[64px_minmax(0,1fr)] gap-4 sm:grid-cols-[76px_minmax(0,1fr)] md:grid-cols-[88px_minmax(0,1fr)]">
        <div
          className="flex flex-col gap-3"
          aria-label="Miniaturas do NFT"
        >
          {images.map((artwork, index) => (
            <button
              key={`${artwork}-${index}`}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`Visualizar imagem ${index + 1} de ${title}`}
              aria-pressed={selectedIndex === index}
              className={`overflow-hidden rounded-md border-2 transition-colors ${
                selectedIndex === index
                  ? "border-kurio-primary"
                  : "border-transparent hover:border-kurio-border-soft"
              }`}
            >
              <div className="aspect-square w-full overflow-hidden">
                <MonkeyArtwork variant={artwork} />
              </div>
            </button>
          ))}
        </div>

        <div className="relative flex min-w-0 items-center justify-center rounded-md bg-kurio-card p-3 sm:p-4">
          <div className="aspect-square w-full overflow-hidden rounded-2xl">
            <MonkeyArtwork variant={selectedArtwork} />
          </div>

          <button
            type="button"
            onClick={() => setIsZoomOpen(true)}
            aria-label={`Ampliar imagem de ${title}`}
            className="absolute right-5 top-5 flex size-9 items-center justify-center rounded-full border border-white/60 bg-kurio-ink/70 text-white transition-colors hover:bg-kurio-ink"
          >
            <Search className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

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
              className="absolute -right-2 -top-12 flex size-10 items-center justify-center rounded-full bg-kurio-card text-white hover:bg-kurio-raised"
            >
              <X className="size-6" aria-hidden="true" />
            </button>

            <div className="aspect-square w-[min(80vw,80vh)] max-w-full overflow-hidden rounded-xl">
              <MonkeyArtwork variant={selectedArtwork} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
