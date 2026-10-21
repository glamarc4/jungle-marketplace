
import { Link } from "@tanstack/react-router"

import { MonkeyArtwork } from "@/components/home/MonkeyArtwork"
import { formatEth, type Nft } from "@/data/mock-nfts"

type NftCardProps = {
  nft: Nft
}

export function NftCard({ nft }: NftCardProps) {
  return (
    <Link
      to="/nft/$nftId"
      params={{ nftId: String(nft.id) }}
      aria-label={`Ver detalhes de ${nft.name}`}
      className="group block min-w-0"
    >
      <div className="overflow-hidden rounded-sm bg-kurio-card p-1.5 sm:p-2">
        <div className="aspect-square overflow-hidden rounded-lg bg-kurio-raised">
          <div className="h-full w-full transition-transform duration-300 ease-out motion-reduce:transition-none group-hover:scale-[1.035]">
            <MonkeyArtwork variant={nft.artwork} />
          </div>
        </div>
      </div>

      <div className="space-y-1 pt-2 font-mono">
        <h3 className="truncate text-xs font-medium text-foreground sm:text-sm">
          {nft.name}
        </h3>

        {nft.availability && Object.values(nft.availability).some(available => !available) && (
          <p role="status" className="text-[10px] text-kurio-secondary">{Object.values(nft.availability).some(Boolean) ? "Algumas edições indisponíveis" : "Indisponível"}</p>
        )}
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-sm font-bold text-kurio-primary">
            {formatEth(nft.priceCents)}
          </span>

          {nft.previousPriceCents !== undefined && (
            <span className="text-xs text-kurio-secondary line-through">
              {formatEth(nft.previousPriceCents)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
