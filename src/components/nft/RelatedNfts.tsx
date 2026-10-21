
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
      className="group block min-w-0"
    >
      <div className="overflow-hidden rounded-sm bg-kurio-card p-3">
        <div className="aspect-square overflow-hidden rounded-lg">
          <div className="h-full w-full transition-transform duration-300 group-hover:scale-[1.035] motion-reduce:transition-none">
            <MonkeyArtwork variant={nft.artwork} />
          </div>
        </div>
      </div>

      <div className="mt-2 font-mono">
        <h3 className="truncate text-xs text-foreground group-hover:text-kurio-primary">
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
  const items = (query.data?.items ?? []).filter(nft => relatedIds.includes(nft.id) && nft.id !== currentNftId).map(nft => ({ id: nft.id, title: nft.name, price: formatEth(nft.priceCents).replace(" ETH", ""), artwork: nft.artwork }))

  const visibleItems = [
    ...items.slice(page),
    ...items.slice(0, page),
  ]

  return (
    <section className="font-mono">
      <h2 className="border-b border-kurio-border pb-2 text-sm font-bold text-kurio-primary">
        {title}
      </h2>

      <RequestState pending={query.isPending} error={query.error} retry={() => void query.refetch()} />
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {visibleItems.map((nft) => (
          <RelatedNftCard key={nft.id} nft={nft} />
        ))}
      </div>

      {items.length > 1 && (
        <div
          className="mt-6 flex justify-center gap-2"
          aria-label="Navegação de NFTs relacionados"
        >
          {Array.from(
            { length: Math.min(3, items.length) },
            (_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setPage(index)}
                aria-label={`Visualizar grupo ${index + 1}`}
                aria-pressed={page === index}
                className={`size-2.5 rounded-full border border-kurio-primary ${
                  page === index
                    ? "bg-kurio-primary"
                    : "bg-transparent"
                }`}
              />
            ),
          )}
        </div>
      )}
    </section>
  )
}
