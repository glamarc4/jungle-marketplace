import type { NftList } from "@/domain/api"

import {
  COLLECTIONS,
  MAX_PRICE,
  MIN_PRICE,
  NETWORKS,
  formatEth,
} from "@/data/mock-nfts"
import type { CatalogFilterValues } from "@/domain/catalog"

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
    <aside
      aria-label="Filtros do catálogo"
      className="flex flex-col gap-6"
    >
      {/* Painel de filtros */}
      <div className="rounded-[15px] border border-kurio-border bg-kurio-card px-5 py-6 font-mono">
        <h2 className="mb-3 text-sm font-bold text-foreground">
          Coleções
        </h2>

        {/* Coleções */}
        <div className="space-y-1">
          {COLLECTIONS.map((collection) => {
            const selected = value.collection === collection

            return (
              <button
                key={collection}
                type="button"
                aria-pressed={selected}
                onClick={() =>
                  onChange({
                    ...value,
                    collection: selected ? null : collection,
                  })
                }
                className={[
                  "flex min-h-8 w-full items-center justify-between gap-2",
                  "rounded-[8px] px-2.5 text-left text-xs",
                  "transition-colors duration-200",
                  selected
                    ? "bg-kurio-primary/10 text-kurio-primary"
                    : "text-kurio-text-secondary hover:bg-kurio-primary/5 hover:text-foreground",
                ].join(" ")}
              >
                <span>{collection}</span>
                <span className="shrink-0">
                  ({collectionCounts[collection] ?? 0})
                </span>
              </button>
            )
          })}
        </div>

        {/* Faixa de preço */}
        <div className="mt-8">
          <h3 className="mb-4 text-sm font-bold text-foreground">
            Faixa de preço
          </h3>

          <div className="relative mb-4 h-6">
            {/* Trilho */}
            <div className="absolute inset-x-0 top-[10px] h-[4px] rounded-full bg-kurio-border-soft" />

            {/* Trecho selecionado */}
            <div
              className="absolute top-[10px] h-[4px] rounded-full bg-kurio-primary"
              style={{
                left: `${minPercent}%`,
                width: `${maxPercent - minPercent}%`,
              }}
            />

            {/* Controle mínimo */}
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
              className="kurio-range absolute inset-x-0 top-[2px] z-10 w-full"
            />

            {/* Controle máximo */}
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
              className="kurio-range absolute inset-x-0 top-[2px] z-20 w-full"
            />
          </div>

          <p className="mb-3 text-[11px] leading-5 text-kurio-text-secondary">
            Preço: {formatEth(value.minPrice)} –{" "}
            {formatEth(value.maxPrice)}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onApply}
              className={[
                "min-h-9 rounded-[8px] bg-kurio-primary px-4",
                "text-xs font-bold text-kurio-ink",
                "transition-colors hover:bg-kurio-primary-light",
              ].join(" ")}
            >
              Aplicar
            </button>

            <button
              type="button"
              onClick={onClear}
              className="min-h-9 text-xs text-kurio-text-secondary underline-offset-4 hover:text-foreground hover:underline"
            >
              Limpar
            </button>
          </div>
        </div>

        {/* Redes */}
        <div className="mt-8">
          <h3 className="mb-3 text-sm font-bold text-foreground">
            Rede
          </h3>

          <div className="space-y-1">
            {NETWORKS.map((network) => {
              const selected = value.network === network

              return (
                <button
                  key={network}
                  type="button"
                  aria-pressed={selected}
                  onClick={() =>
                    onChange({
                      ...value,
                      network: selected ? null : network,
                    })
                  }
                  className={[
                    "flex min-h-8 w-full items-center justify-between gap-2",
                    "rounded-[8px] px-2.5 text-left text-xs",
                    "transition-colors duration-200",
                    selected
                      ? "bg-kurio-primary/10 text-kurio-primary"
                      : "text-kurio-text-secondary hover:bg-kurio-primary/5 hover:text-foreground",
                  ].join(" ")}
                >
                  <span>{network}</span>
                  <span className="shrink-0">
                    ({networkCounts[network] ?? 0})
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <FeaturedNft />
      </div>
    </aside>
  )
}

function FeaturedNft() {
  return (
    <section
      aria-label="NFT em destaque"
      className="overflow-hidden rounded-[15px] border border-kurio-border bg-kurio-card"
    >
      <div className="px-4 pb-4 pt-6 text-center font-mono">
        <h3 className="text-[18px] font-bold uppercase leading-[27px] tracking-[1px] text-kurio-primary">
          NFT EM
          <br />
          DESTAQUE
        </h3>

        <p className="mt-1 text-[12px] font-bold uppercase tracking-[2px] text-foreground">
          OFERTA LIMITADA
        </p>
      </div>

      <div className="aspect-square w-full overflow-hidden">
        <img
          src="/images/nfts/macaco-cinza.png"
          alt="Macaco Preto — NFT em destaque"
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    </section>
  )
}