import type { NftList } from "@/domain/api"

import {
  COLLECTIONS,
  MAX_PRICE,
  MIN_PRICE,
  NETWORKS,
  formatEth,
} from "@/data/mock-nfts"
import { MonkeyArtwork } from "@/components/home/MonkeyArtwork"

import { type CatalogFilterValues } from "@/domain/catalog"

type CatalogFiltersProps = {
  value: CatalogFilterValues
  onChange: (next: CatalogFilterValues) => void
  onApply: () => void
  onClear: () => void
  facets?: NftList["facets"]
}

export function CatalogFilters({
  value,
  onChange,
  onApply,
  onClear,
  facets,
}: CatalogFiltersProps) {
  const collectionCounts = facets?.collections ?? {}
  const networkCounts = facets?.networks ?? {}

  const minPercent =
    ((value.minPrice - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100

  const maxPercent =
    ((value.maxPrice - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100

  function updateMin(next: number) {
    onChange({
      ...value,
      minPrice: Math.min(next, value.maxPrice),
    })
  }

  function updateMax(next: number) {
    onChange({
      ...value,
      maxPrice: Math.max(next, value.minPrice),
    })
  }

  return (
    <aside aria-label="Filtros do catálogo" className="space-y-4">
      <div className="bg-kurio-card px-4 py-5 font-mono">
        <h2 className="mb-4 text-sm font-bold text-foreground">
          Coleções
        </h2>

        <div className="space-y-1">
          {COLLECTIONS.map((collection) => (
            <button
              key={collection}
              type="button"
              aria-pressed={value.collection === collection}
              onClick={() =>
                onChange({
                  ...value,
                  collection:
                    value.collection === collection
                      ? null
                      : collection,
                })
              }
              className={[
                "flex min-h-8 w-full items-center justify-between gap-2 rounded-sm px-2 text-left text-xs transition-colors",
                value.collection === collection
                  ? "bg-kurio-raised text-kurio-primary"
                  : "text-kurio-text-secondary hover:bg-kurio-raised hover:text-foreground",
              ].join(" ")}
            >
              <span>{collection}</span>
              <span>({collectionCounts[collection] ?? 0})</span>
            </button>
          ))}
        </div>

        <div className="mt-7">
          <h3 className="mb-4 text-sm font-bold text-foreground">
            Faixa de preço
          </h3>

          <div className="relative mb-4 h-5">
            <div className="absolute inset-x-0 top-2 h-1 rounded-full bg-kurio-border-soft" />

            <div
              className="absolute top-2 h-1 rounded-full bg-kurio-primary"
              style={{
                left: `${minPercent}%`,
                width: `${maxPercent - minPercent}%`,
              }}
            />

            <input
              type="range"
              aria-label="Preço mínimo em centésimos de ETH"
              min={MIN_PRICE}
              max={MAX_PRICE}
              step={1}
              value={value.minPrice}
              onChange={(event) =>
                updateMin(Number(event.target.value))
              }
              className="kurio-range absolute inset-x-0 top-0 z-10 w-full"
            />

            <input
              type="range"
              aria-label="Preço máximo em centésimos de ETH"
              min={MIN_PRICE}
              max={MAX_PRICE}
              step={1}
              value={value.maxPrice}
              onChange={(event) =>
                updateMax(Number(event.target.value))
              }
              className="kurio-range absolute inset-x-0 top-0 z-20 w-full"
            />
          </div>

          <p className="mb-3 text-[11px] leading-5 text-kurio-text-secondary">
            Preço: {formatEth(value.minPrice)} –{" "}
            {formatEth(value.maxPrice)}
          </p>

          <button
            type="button"
            onClick={onApply}
            className="min-h-9 rounded bg-kurio-primary px-4 text-xs font-bold text-kurio-ink transition-colors hover:bg-kurio-primary-light"
          >
            Aplicar
          </button>

          <button
            type="button"
            onClick={onClear}
            className="ml-3 min-h-9 text-xs text-kurio-text-secondary underline-offset-4 hover:text-foreground hover:underline"
          >
            Limpar
          </button>
        </div>

        <div className="mt-7">
          <h3 className="mb-3 text-sm font-bold text-foreground">
            Rede
          </h3>

          <div className="space-y-1">
            {NETWORKS.map((network) => (
              <button
                key={network}
                type="button"
                aria-pressed={value.network === network}
                onClick={() =>
                  onChange({
                    ...value,
                    network:
                      value.network === network ? null : network,
                  })
                }
                className={[
                  "flex min-h-8 w-full items-center justify-between gap-2 rounded-sm px-2 text-left text-xs transition-colors",
                  value.network === network
                    ? "bg-kurio-raised text-kurio-primary"
                    : "text-kurio-text-secondary hover:bg-kurio-raised hover:text-foreground",
                ].join(" ")}
              >
                <span>{network}</span>
                <span>({networkCounts[network] ?? 0})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <FeaturedNft />
    </aside>
  )
}

function FeaturedNft() {
  return (
    <section
      aria-label="NFT em destaque"
      className="overflow-hidden bg-kurio-card pt-5"
    >
      <div className="px-4 text-center font-mono">
        <h3 className="text-lg font-bold text-kurio-primary">
          NFT EM DESTAQUE
        </h3>
        <p className="mt-2 text-sm font-bold text-foreground">
          OFERTA LIMITADA
        </p>
      </div>

      <div className="mt-3 aspect-square overflow-hidden rounded-t-xl">
        <MonkeyArtwork variant="violet" />
      </div>
    </section>
  )
}
