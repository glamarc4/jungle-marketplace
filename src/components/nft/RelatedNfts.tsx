
import { useState } from "react"
import { Link } from "@tanstack/react-router"

import { MonkeyArtwork } from "@/components/home/MonkeyArtwork"
import type { RelatedNft } from "@/data/nft-details"
import { formatEth } from "@/data/mock-nfts"
import { useNfts } from "@/hooks/use-api"
import { RequestState } from "@/components/RequestState"

type RelatedNftsProps = {
  currentNftId: string
  title?: string
}

function RelatedNftCard({ nft }: { nft: RelatedNft }) {
  return (
    <Link
      to="/nft/$nftId"
      params={{ nftId: nft.id }}
      aria-label={`Ver detalhes de ${nft.title}`}
      className="group block min-w-0"
    >
      <div
        className={[
          "overflow-hidden rounded-2xl border border-kurio-border-soft",
          "bg-kurio-card p-2.5 sm:p-3",
          "transition-[border-color,box-shadow] duration-300 ease-out",
          "group-hover:border-kurio-primary/60",
          "group-hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]",
          "group-focus-visible:border-kurio-primary",
        ].join(" ")}
      >
        <div className="aspect-square overflow-hidden rounded-xl border border-white/10 bg-kurio-raised">
          <div className="h-full w-full transition-transform duration-300 ease-out group-hover:scale-[1.045] motion-reduce:transition-none">
            <MonkeyArtwork variant={nft.artwork} />
          </div>
        </div>
      </div>

      <div className="mt-2.5 space-y-1 font-mono">
        <h3 className="truncate text-xs font-medium text-foreground sm:text-sm">
          {nft.title}
        </h3>

        <p className="text-sm font-bold text-kurio-primary">
          {nft.price} ETH
        </p>
      </div>
    </Link>
  )
}

export function RelatedNfts({
  currentNftId,
  title = "Mais desta coleção",
}: RelatedNftsProps) {
  const [page, setPage] = useState(0)

  const query = useNfts({ pageSize: 100 })

  const relatedIds = ["118", "314", "088", "207", "166"]

  const items: RelatedNft[] = (query.data?.items ?? [])
    .filter(
      (nft) =>
        relatedIds.includes(nft.id) &&
        nft.id !== currentNftId,
    )
    .map((nft) => ({
      id: nft.id,
      title: nft.name,
      price: formatEth(nft.priceCents).replace(" ETH", ""),
      artwork: nft.artwork,
    }))

  const pageCount = Math.min(3, items.length)
  const activePage = pageCount > 0 ? page % pageCount : 0

  const visibleItems = [
    ...items.slice(activePage),
    ...items.slice(0, activePage),
  ]

  return (
    <section className="font-mono">
      <h2 className="border-b border-white/20 pb-3 text-sm font-bold text-foreground sm:text-base">
        {title}
      </h2>

      <RequestState
        pending={query.isPending}
        error={query.error}
        retry={() => void query.refetch()}
      />

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
        {visibleItems.map((nft) => (
          <RelatedNftCard key={nft.id} nft={nft} />
        ))}
      </div>

      {items.length > 1 && (
        <div
          className="mt-7 flex items-center justify-center gap-2"
          aria-label="Navegação de NFTs relacionados"
        >
          {Array.from(
            { length: pageCount },
            (_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setPage(index)}
                aria-label={`Visualizar grupo ${index + 1}`}
                aria-pressed={activePage === index}
                className={[
                  "h-2.5 rounded-full border border-kurio-primary",
                  "transition-[width,background-color] duration-300 ease-out",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kurio-primary",
                  "motion-reduce:transition-none",
                  activePage === index
                    ? "w-6 bg-kurio-primary"
                    : "w-2.5 bg-transparent hover:bg-kurio-primary/30",
                ].join(" ")}
              />
            ),
          )}
        </div>
      )}
    </section>
  )
}
