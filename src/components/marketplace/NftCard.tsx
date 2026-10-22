
import { Link } from "@tanstack/react-router"

import { formatEth, type Nft } from "@/data/mock-nfts"

type NftCardProps = {
  nft: Nft
}

const monkeyImages = [
  "/images/nfts/macaco-bege.png",
  "/images/nfts/macaco-cinza.png",
  "/images/nfts/macaco-marrom.png",
  "/images/nfts/macaco-preto.png",
] as const

function getNftImage(nft: Nft): string {
  // Distribuição determinística: o mesmo NFT mantém
  // sua imagem ao filtrar, paginar ou atualizar a página.
  const key = String(nft.id)

  let hash = 0

  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  }

  return monkeyImages[hash % monkeyImages.length]
}

export function NftCard({ nft }: NftCardProps) {
  const imageSrc = getNftImage(nft)

  return (
    <Link
      to="/nft/$nftId"
      params={{ nftId: String(nft.id) }}
      aria-label={`Ver detalhes de ${nft.name}`}
      className="group block min-w-0 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-kurio-primary"
    >
      {/* Moldura externa */}
      <div
        className={[
          "rounded-[16px] border border-kurio-border",
          "bg-kurio-card p-4",
          "transition-colors duration-300",
          "group-hover:border-kurio-primary/55",
          "group-focus-visible:border-kurio-primary",
        ].join(" ")}
      >
        {/* Imagem exportada */}
        <div
          className={[
            "aspect-square overflow-hidden rounded-[8px]",
            "border border-white/10 bg-kurio-raised",
          ].join(" ")}
        >
          <img
            src={imageSrc}
            alt={`Arte do NFT ${nft.name}`}
            loading="lazy"
            decoding="async"
            draggable={false}
            className={[
              "h-full w-full object-cover",
              "transition-transform duration-500 ease-out",
              "group-hover:scale-[1.045]",
              "motion-reduce:transition-none",
            ].join(" ")}
          />
        </div>
      </div>

      {/* Informações do NFT */}
      <div className="space-y-1 pt-3 font-mono">
        <h3 className="truncate text-xs font-medium text-foreground sm:text-sm">
          {nft.name}
        </h3>

        {nft.availability &&
          Object.values(nft.availability).some(
            (available) => !available
          ) && (
            <p
              role="status"
              className="text-[10px] text-kurio-secondary"
            >
              {Object.values(nft.availability).some(Boolean)
                ? "Algumas edições indisponíveis"
                : "Indisponível"}
            </p>
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
